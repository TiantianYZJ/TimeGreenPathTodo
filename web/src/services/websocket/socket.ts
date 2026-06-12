/**
 * WebSocket 实时协作服务
 *
 * 提供待办事项的实时同步功能，支持：
 * - 待办 CRUD 操作的实时推送
 * - 成员在线状态和输入指示
 * - 自动重连和心跳保活
 * - 离线操作队列管理
 */

import { useAuthStore } from '@/stores/authStore';
import { useTodoStore } from '@/stores/todoStore';

// ==================== 类型定义 ====================

/** WebSocket 事件类型 */
export type WSEventType =
  | 'todo:created'
  | 'todo:updated'
  | 'todo:deleted'
  | 'todo:completed'
  | 'member:joined'
  | 'member:left'
  | 'member:typing'
  | 'sync:request'
  | 'sync:response';

/** WebSocket 消息结构 */
export interface WSMessage {
  /** 事件类型 */
  event: WSEventType;
  /** 事件数据 */
  data: any;
  /** 消息时间戳 */
  timestamp: number;
  /** 发送者 ID */
  senderId?: string;
}

/** 离线操作类型 */
export type OfflineActionType =
  | 'todo:create'
  | 'todo:update'
  | 'todo:delete'
  | 'todo:complete';

/** 离线操作项 */
export interface OfflineAction {
  /** 唯一标识（用于去重） */
  id: string;
  /** 操作类型 */
  action: OfflineActionType;
  /** 操作载荷 */
  payload: any;
  /** 入队时间戳 */
  timestamp: number;
}

// ==================== WebSocket 服务核心类 ====================

class WebSocketService {
  // ---------- 私有属性 ----------
  
  /** WebSocket 实例 */
  private ws: WebSocket | null = null;
  
  /** 当前重连尝试次数 */
  private reconnectAttempts: number = 0;
  
  /** 最大重连尝试次数 */
  private maxReconnectAttempts: number = 5;
  
  /** 重连基础延迟（毫秒） */
  private reconnectDelay: number = 1000;
  
  /** 心跳定时器 */
  private heartbeatInterval: NodeJS.Timeout | null = null;
  
  /** 是否为手动关闭（用于区分手动断开和网络异常） */
  private isManualClose: boolean = false;
  
  /** 输入指示清除定时器 */
  private typingClearTimer: NodeJS.Timeout | null = null;

  // ---------- 公共方法 ----------

  /**
   * 建立 WebSocket 连接
   *
   * @returns Promise<void> 连接成功后 resolve，失败则 reject
   * @throws 无 token 或连接失败时抛出错误
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // 获取认证 token
      const token = useAuthStore.getState().token;
      if (!token) {
        reject(new Error('未登录，无法建立 WebSocket 连接'));
        return;
      }

      // 构建 WebSocket URL
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws?token=${encodeURIComponent(token)}`;

      console.log('[WebSocket] 正在连接:', wsUrl.replace(/token=[^&]*/, 'token=***'));

      try {
        this.ws = new WebSocket(wsUrl);

        // 连接成功
        this.ws.onopen = () => {
          console.log('[WebSocket] 连接已建立');
          this.reconnectAttempts = 0; // 重置重连计数
          this.isManualClose = false;
          this.startHeartbeat();
          resolve();
        };

        // 收到消息
        this.ws.onmessage = (event: MessageEvent) => {
          try {
            const message: WSMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('[WebSocket] 消息解析失败:', error, event.data);
          }
        };

        // 连接错误
        this.ws.onerror = (event: Event) => {
          console.error('[WebSocket] 连接错误:', event);
          reject(new Error('WebSocket 连接失败'));
        };

        // 连接关闭
        this.ws.onclose = (event: CloseEvent) => {
          console.log(`[WebSocket] 连接已关闭: code=${event.code}, reason=${event.reason}`);
          this.stopHeartbeat();
          
          // 非手动关闭时尝试自动重连
          if (!this.isManualClose) {
            this.scheduleReconnect();
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 断开 WebSocket 连接
   *
   * 设置 isManualClose 标志以阻止自动重连，
   * 清理心跳定时器并关闭连接。
   */
  disconnect(): void {
    console.log('[WebSocket] 手动断开连接');
    this.isManualClose = true;
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, '用户主动断开');
      this.ws = null;
    }
    
    // 重置重连计数（以便下次 connect 可以正常工作）
    this.reconnectAttempts = 0;
  }

  /**
   * 发送消息到服务器
   *
   * @param event 事件类型
   * @param data 事件数据
   * @throws WebSocket 未就绪时抛出错误
   */
  send(event: WSEventType, data: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket 未连接，无法发送消息');
    }

    const message: WSMessage = {
      event,
      data,
      timestamp: Date.now(),
      senderId: useAuthStore.getState().user?.id?.toString(),
    };

    this.ws.send(JSON.stringify(message));
    console.log('[WebSocket] 发送消息:', event, data);
  }

  /**
   * 获取当前连接状态
   *
   * @returns WebSocket 就绪状态码
   */
  get readyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  /**
   * 检查是否已连接
   *
   * @returns 是否处于 OPEN 状态
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // ---------- 私有方法 ----------

  /**
   * 处理收到的 WebSocket 消息
   *
   * 忽略自己发送的消息，根据事件类型分发到对应的处理逻辑。
   *
   * @param message 解析后的消息对象
   */
  private handleMessage(message: WSMessage): void {
    const currentUserId = useAuthStore.getState().user?.id?.toString();

    // 忽略自己的消息，避免重复处理
    if (message.senderId && message.senderId === currentUserId) {
      return;
    }

    console.log('[WebSocket] 收到消息:', message.event, message.data);

    switch (message.event) {
      case 'todo:created':
        useTodoStore.getState().addTodoFromRemote(message.data);
        break;

      case 'todo:updated':
        useTodoStore.getState().updateTodoFromRemote(message.data);
        break;

      case 'todo:deleted':
        useTodoStore.getState().removeTodoFromRemote(message.data.id);
        break;

      case 'todo:completed':
        useTodoStore.getState().toggleCompleteFromRemote(
          message.data.id,
          message.data.completed
        );
        break;

      case 'member:joined':
        this.handleMemberJoined(message.data);
        break;

      case 'member:left':
        this.handleMemberLeft(message.data);
        break;

      case 'member:typing':
        this.handleTypingIndicator(message.data);
        break;

      case 'sync:request':
        this.handleSyncRequest(message);
        break;

      case 'sync:response':
        this.handleSyncResponse(message.data);
        break;

      default:
        console.warn('[WebSocket] 未知事件类型:', message.event);
    }
  }

  /**
   * 处理成员加入事件
   *
   * @param data 成员信息
   */
  private handleMemberJoined(data: any): void {
    const memberName = data.nickname || data.name || '某位成员';
    console.log(`[WebSocket] ${memberName} 加入了协作`);
    // TODO: 可集成 UI 通知组件显示提示
    // message.info(`${memberName} 加入了协作`);
  }

  /**
   * 处理成员离开事件
   *
   * @param data 成员信息
   */
  private handleMemberLeft(data: any): void {
    const memberName = data.nickname || data.name || '某位成员';
    console.log(`[WebSocket] ${memberName} 离开了协作`);
    // TODO: 可集成 UI 通知组件显示提示
  }

  /**
   * 处理输入指示器事件
   *
   * 显示"正在输入..."提示，3秒后自动清除。
   *
   * @param data 包含用户信息的对象
   */
  private handleTypingIndicator(data: any): void {
    const todoStore = useTodoStore.getState();
    
    // 设置正在输入的用户（如果 store 支持）
    if ('setTypingUser' in todoStore) {
      (todoStore as any).setTypingUser(data);
    }
    
    // 清除之前的定时器
    if (this.typingClearTimer) {
      clearTimeout(this.typingClearTimer);
    }
    
    // 3秒后自动清除输入指示
    this.typingClearTimer = setTimeout(() => {
      if ('clearTypingUser' in todoStore) {
        (todoStore as any).clearTypingUser();
      }
    }, 3000);
  }

  /**
   * 处理同步请求事件
   *
   * 当其他用户请求全量数据时响应当前本地数据。
   *
   * @param message 同步请求消息
   */
  private handleSyncRequest(message: WSMessage): void {
    const todos = useTodoStore.getState().todos;
    this.send('sync:response', { todos });
  }

  /**
   * 处理同步响应事件
   *
   * 接收其他用户的完整待办列表并合并到本地。
   *
   * @param data 远程待办列表
   */
  private handleSyncResponse(data: any): void {
    if (data.todos && Array.isArray(data.todos)) {
      const todoStore = useTodoStore.getState();
      data.todos.forEach((todo: any) => {
        todoStore.addTodoFromRemote(todo);
      });
    }
  }

  /**
   * 启动心跳保活机制
   *
   * 每30秒发送一次 ping 消息保持连接活跃。
   */
  private startHeartbeat(): void {
    this.stopHeartbeat(); // 先清理已有的心跳
    
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
        } catch (error) {
          console.error('[WebSocket] 心跳发送失败:', error);
        }
      }
    }, 30000); // 30秒间隔
    
    console.log('[WebSocket] 心跳已启动');
  }

  /**
   * 停止心跳保活机制
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * 安排自动重连
   *
   * 使用指数退避策略计算延迟时间：
   * - 第1次：1s
   * - 第2次：2s
   * - 第3次：4s
   * - 第4次：8s
   * - 第5次：16s
   * 最大延迟不超过30秒。
   *
   * 达到最大尝试次数后将停止重连。
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(
        `[WebSocket] 已达到最大重连次数 (${this.maxReconnectAttempts})，停止重连`
      );
      return;
    }

    // 计算延迟时间（指数退避，最大30秒）
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      30000
    );

    this.reconnectAttempts++;
    console.log(
      `[WebSocket] 将在 ${delay / 1000} 秒后进行第 ${this.reconnectAttempts} 次重连...`
    );

    setTimeout(() => {
      console.log(`[WebSocket] 开始第 ${this.reconnectAttempts} 次重连尝试`);
      this.connect().catch((error) => {
        console.error('[WebSocket] 重连失败:', error.message);
      });
    }, delay);
  }
}

// ==================== 单例导出 ====================

/**
 * WebSocket 服务单例
 *
 * 全局唯一实例，提供实时协作能力。
 *
 * @example
 * ```typescript
 * import { wsService } from '@/services/websocket/socket';
 *
 * // 连接
 * await wsService.connect();
 *
 * // 发送消息
 * wsService.send('todo:created', newTodo);
 *
 * // 断开
 * wsService.disconnect();
 * ```
 */
export const wsService = new WebSocketService();
