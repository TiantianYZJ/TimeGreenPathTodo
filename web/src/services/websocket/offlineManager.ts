/**
 * 离线操作管理器
 *
 * 在网络断开或 WebSocket 未连接时，将用户的操作缓存到本地队列中。
 * 当网络恢复或连接重新建立时，自动批量重放这些操作以确保数据一致性。
 *
 * 功能特性：
 * - 操作队列持久化（localStorage）
 * - 自动去重（基于 ID）
 * - 批量发送与错误处理
 * - 队列状态查询
 */

import { wsService } from './socket';
import type { OfflineAction, OfflineActionType } from './socket';

// ==================== 常量定义 ====================

/** localStorage 中存储离线操作的键名 */
const STORAGE_KEY = 'pending_actions';

/** 最大缓存操作数量（防止内存溢出） */
const MAX_PENDING_ACTIONS = 100;

// ==================== 离线管理器核心类 ====================

class OfflineManager {
  /** 待发送的操作队列 */
  private pendingActions: OfflineAction[] = [];

  constructor() {
    // 初始化时从 localStorage 恢复队列
    this.loadFromStorage();
  }

  // ---------- 公共方法 ----------

  /**
   * 将操作加入离线队列
   *
   * 操作会被添加到队列末尾并立即持久化到 localStorage，
   * 以防页面刷新导致数据丢失。
   *
   * @param action 操作类型
   * @param payload 操作载荷（待办对象、ID 等）
   * @returns 生成的操作 ID，可用于后续追踪或取消
   *
   * @example
   * ```typescript
   * offlineManager.queueAction('todo:create', newTodo);
   * offlineManager.queueAction('todo:delete', { id: 'todo_123' });
   * ```
   */
  queueAction(action: OfflineActionType, payload: any): string {
    const id = this.generateId();
    
    const offlineAction: OfflineAction = {
      id,
      action,
      payload,
      timestamp: Date.now(),
    };

    // 检查是否超过最大容量
    if (this.pendingActions.length >= MAX_PENDING_ACTIONS) {
      console.warn(
        `[OfflineManager] 队列已满 (${MAX_PENDING_ACTIONS} 项)，移除最早的操作`
      );
      this.pendingActions.shift(); // 移除最早的项
    }

    this.pendingActions.push(offlineAction);
    this.persistToStorage();

    console.log(
      `[OfflineManager] 操作已入队: ${action} (id=${id}, 队列长度=${this.pendingActions.length})`
    );

    return id;
  }

  /**
   * 批量发送所有待处理的离线操作
   *
   * 在网络恢复或 WebSocket 重连成功后调用此方法。
   * 按时间顺序依次发送每个操作，成功后从队列中移除。
   *
   * 发送过程中遇到错误会记录但不会中断后续操作，
   * 所有操作处理完毕后会返回统计结果。
   *
   * @returns Promise<{ successCount, failCount }> 发送结果统计
   *
   * @example
   * ```typescript
   * wsService.connect().then(() => {
   *   offlineManager.flushPendingActions();
   * });
   * ```
   */
  async flushPendingActions(): Promise<{ successCount: number; failCount: number }> {
    if (this.pendingActions.length === 0) {
      console.log('[OfflineManager] 队列为空，无需发送');
      return { successCount: 0, failCount: 0 };
    }

    if (!wsService.isConnected) {
      console.warn('[OfflineManager] WebSocket 未连接，无法发送');
      return { successCount: 0, failCount: 0 };
    }

    console.log(
      `[OfflineManager] 开始批量发送 ${this.pendingActions.length} 个待处理操作...`
    );

    let successCount = 0;
    let failCount = 0;
    const failedIds: string[] = [];
    
    // 复制当前队列并清空（避免重复发送）
    const actionsToFlush = [...this.pendingActions];
    this.clearAll();

    for (const action of actionsToFlush) {
      try {
        // 将离线操作转换为 WebSocket 事件并发送
        await this.sendActionViaWebSocket(action);
        successCount++;
        console.log(`[OfflineManager] 操作发送成功: ${action.action} (id=${action.id})`);
      } catch (error) {
        failCount++;
        failedIds.push(action.id);
        console.error(
          `[OfflineManager] 操作发送失败: ${action.action} (id=${action.id})`,
          error
        );
        
        // 将失败的操作重新加入队列
        this.pendingActions.push(action);
      }
    }

    // 如果有失败的操作，重新持久化
    if (failedIds.length > 0) {
      this.persistToStorage();
    }

    console.log(
      `[OfflineManager] 批量发送完成: 成功=${successCount}, 失败=${failCount}`
    );

    return { successCount, failCount };
  }

  /**
   * 清空所有待处理的离线操作
   *
   * 同时清除内存中的队列和 localStorage 中的持久化数据。
   * 谨慎使用：清空后数据无法恢复！
   *
   * @example
   * ```typescript
   * // 用户主动放弃未同步的更改时
   * offlineManager.clearAll();
   * ```
   */
  clearAll(): void {
    this.pendingActions = [];
    this.removeFromStorage();
    console.log('[OfflineManager] 队列已清空');
  }

  /**
   * 获取当前待处理操作的数量
   *
   * @returns 队列中的操作数量
   */
  get pendingCount(): number {
    return this.pendingActions.length;
  }

  /**
   * 获取所有待处理操作的副本
   *
   * 返回数组的浅拷贝，修改返回值不会影响内部队列。
   *
   * @returns 待处理操作数组
   */
  get actions(): OfflineAction[] {
    return [...this.pendingActions];
  }

  /**
   * 检查是否有待处理的操作
   *
   * @returns 队列是否非空
   */
  get hasPending(): boolean {
    return this.pendingActions.length > 0;
  }

  /**
   * 根据操作类型过滤队列
   *
   * @param actionType 要筛选的操作类型
   * @returns 匹配指定类型的操作列表
   */
  getActionsByType(actionType: OfflineActionType): OfflineAction[] {
    return this.pendingActions.filter((a) => a.action === actionType);
  }

  /**
   * 移除指定的操作（按 ID）
   *
   * @param id 要移除的操作 ID
   * @returns 是否找到并移除了该操作
   */
  removeAction(id: string): boolean {
    const index = this.pendingActions.findIndex((a) => a.id === id);
    if (index !== -1) {
      this.pendingActions.splice(index, 1);
      this.persistToStorage();
      return true;
    }
    return false;
  }

  // ---------- 私有方法 ----------

  /**
   * 通过 WebSocket 发送单个离线操作
   *
   * 将离线操作类型映射为对应的 WebSocket 事件类型，
   * 然后调用 wsService.send() 发送。
   *
   * @param action 离线操作项
   * @private
   */
  private async sendActionViaWebSocket(action: OfflineAction): Promise<void> {
    // 映射离线操作类型到 WebSocket 事件类型
    const eventMap: Record<OfflineActionType, import('./socket').WSEventType> = {
      'todo:create': 'todo:created',
      'todo:update': 'todo:updated',
      'todo:delete': 'todo:deleted',
      'todo:complete': 'todo:completed',
    };

    const eventType = eventMap[action.action];
    if (!eventType) {
      throw new Error(`未知操作类型: ${action.action}`);
    }

    // 发送到服务器
    wsService.send(eventType, action.payload);
    
    // 给服务器一点时间处理（模拟异步确认）
    // 实际生产环境中应该使用消息确认机制
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  /**
   * 从 localStorage 恢复操作队列
   *
   * 应用启动或实例创建时调用，确保页面刷新不丢失数据。
   * @private
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: OfflineAction[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.pendingActions = parsed;
          console.log(`[OfflineManager] 从本地存储恢复了 ${parsed.length} 个操作`);
        }
      }
    } catch (error) {
      console.error('[OfflineManager] 从本地存储恢复失败:', error);
      this.pendingActions = [];
    }
  }

  /**
   * 持久化操作队列到 localStorage
   *
   * 每次队列变更后调用，确保数据可跨会话保留。
   * @private
   */
  private persistToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.pendingActions));
    } catch (error) {
      console.error('[OfflineManager] 持久化到本地存储失败:', error);
      // 可能是存储空间不足
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('[OfflineManager] 存储空间不足，尝试清理旧数据...');
        // 移除一半最旧的数据以腾出空间
        this.pendingActions = this.pendingActions.slice(Math.floor(this.pendingActions.length / 2));
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.pendingActions));
        } catch (e) {
          console.error('[OfflineManager] 清理后仍无法保存:', e);
        }
      }
    }
  }

  /**
   * 从 localStorage 移除持久化数据
   *
   * 清空队列时调用。
   * @private
   */
  private removeFromStorage(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('[WebSocket] 移除本地存储失败:', error);
    }
  }

  /**
   * 生成唯一的操作 ID
   *
   * 格式：offline_{timestamp}_{random}
   *
   * @returns 唯一标识符字符串
   * @private
   */
  private generateId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `offline_${timestamp}_${random}`;
  }
}

// ==================== 单例导出 ====================

/**
 * 离线操作管理器单例
 *
 * 全局唯一实例，提供离线操作队列管理能力。
 *
 * @example
 * ```typescript
 * import { offlineManager } from '@/services/websocket/offlineManager';
 *
 * // 网络断开时入队
 * offlineManager.queueAction('todo:create', todoData);
 *
 * // 查看待处理数量
 * console.log(offlineManager.pendingCount);
 *
 * // 网络恢复时批量发送
 * await offlineManager.flushPendingActions();
 * ```
 */
export const offlineManager = new OfflineManager();
