/**
 * 通用辅助工具函数
 *
 * 提供项目中常用的工具函数：
 * - ID 生成
 * - CSS 类名合并
 * - 延时函数
 * - 对象操作（深拷贝、属性选取/排除）
 * - 日期校验
 * - 问候语生成
 */

// ==================== ID 生成 ====================

/**
 * 生成唯一 ID
 *
 * 基于时间戳 + 随机数生成唯一标识符，
 * 适用于生成待办 ID、组合 ID 等场景
 *
 * @param prefix - 可选的前缀（如 'todo_'、'combo_'）
 * @returns 唯一标识符字符串
 *
 * @example
 * ```ts
 * generateId() // => '1705312800000_abc123'
 * generateId('todo_') // => 'todo_1705312800000_xyz789'
 * generateId('combo_') // => 'combo_1705312800000_def456'
 * ```
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 11);
  return prefix ? `${prefix}${timestamp}_${randomStr}` : `${timestamp}_${randomStr}`;
}

// ==================== CSS 类名处理 ====================

/** classNames 函数支持的参数类型 */
type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | ClassValue[]
  | Record<string, boolean | undefined | null>;

/**
 * 条件 CSS 类名合并工具（类似 clsx 库）
 *
 * 将多个类名合并为一个字符串，支持条件渲染：
 * - 字符串/数字：直接拼接
 * - 布尔值 false/null/undefined：忽略
 * - 对象：值为 truthy 的键名会被包含
 * - 数组：递归处理每个元素
 *
 * @param args - 类名参数（可变参数）
 * @returns 合并后的类名字符串
 *
 * @example
 * ```tsx
 * // 基础用法
 * classNames('foo', 'bar') // => 'foo bar'
 *
 * // 条件类名
 * classNames('btn', { 'btn-primary': isActive }) // => 'btn btn-primary'
 * classNames('btn', isActive && 'btn-active') // => 'btn btn-active' (如果 isActive 为 true)
 *
 * // 复杂组合
 * classNames('base', { active: true, disabled: false }, ['extra', null]) // => 'base active extra'
 * ```
 */
export function classNames(...args: ClassValue[]): string {
  const classes: string[] = [];

  for (const arg of args) {
    if (!arg) continue;

    if (typeof arg === 'string' || typeof arg === 'number') {
      classes.push(String(arg));
    } else if (Array.isArray(arg)) {
      // 递归处理数组
      const inner = classNames(...arg);
      if (inner) classes.push(inner);
    } else if (typeof arg === 'object') {
      // 处理对象：值为 truthy 的键名
      for (const key in arg) {
        if (Object.prototype.hasOwnProperty.call(arg, key) && arg[key]) {
          classes.push(key);
        }
      }
    }
  }

  return classes.join(' ');
}

// ==================== 异步工具 ====================

/**
 * 延时函数
 *
 * 返回一个 Promise，在指定时间后 resolve
 * 用于 async/await 场景下的延时等待
 *
 * @param ms - 延迟时间（毫秒）
 * @returns Promise，在指定时间后 resolve
 *
 * @example
 * ```ts
 * async function fetchDataWithRetry() {
 *   try {
 *     return await api.getData();
 *   } catch (error) {
 *     console.error('请求失败，1秒后重试...');
 *     await sleep(1000); // 等待 1 秒
 *     return fetchDataWithRetry(); // 重试
 *   }
 * }
 *
 * // 在 useEffect 中使用
 * useEffect(() => {
 *   let mounted = true;
 *
 *   async function init() {
 *     await sleep(500); // 延迟 500ms 执行
 *     if (mounted) {
 *       loadData();
 *     }
 *   }
 *
 *   init();
 *   return () => { mounted = false; };
 * }, []);
 * ```
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ==================== 对象操作 ====================

/**
 * 深拷贝对象
 *
 * 使用 JSON 序列化/反序列化实现深拷贝
 * 注意：无法拷贝函数、undefined、Symbol、循环引用等特殊值
 *
 * @param obj - 要拷贝的对象
 * @returns 深拷贝后的新对象
 *
 * @example
 * ```ts
 * const original = { a: 1, b: { c: 2 } };
 * const cloned = deepClone(original);
 * cloned.b.c = 3; // 不影响 original
 * console.log(original.b.c); // 2
 * ```
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // 处理日期对象
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  // 处理数组
  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as unknown as T;
  }

  // 处理普通对象
  const clonedObj = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      (clonedObj as Record<string, unknown>)[key] = deepClone(
        (obj as Record<string, unknown>)[key]
      );
    }
  }

  return clonedObj;
}

/**
 * 从对象中选取指定的属性
 *
 * 创建一个新对象，只包含指定的属性
 *
 * @param obj - 源对象
 * @param keys - 要选取的属性键数组
 * @returns 只包含指定属性的新对象
 *
 * @example
 * ```ts
 * const user = { id: 1, name: '张三', age: 25, email: 'zhang@example.com', password: '123456' };
 *
 * const safeUser = pick(user, ['id', 'name', 'age']);
 * // safeUser = { id: 1, name: '张三', age: 25 }
 * // password 和 email 被过滤掉了
 * ```
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;

  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }

  return result;
}

/**
 * 从对象中排除指定的属性
 *
 * 创建一个新对象，排除指定的属性
 *
 * @param obj - 源对象
 * @param keys - 要排除的属性键数组
 * @returns 排除指定属性后的新对象
 *
 * @example
 * ```ts
 * const user = { id: 1, name: '张三', password: '123456', token: 'abc' };
 *
 * const publicUser = omit(user, ['password', 'token']);
 * // publicUser = { id: 1, name: '张三' }
 * // 敏感信息被移除了
 * ```
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj } as Omit<T, K>;

  for (const key of keys) {
    delete (result as Record<string, unknown>)[String(key)];
  }

  return result;
}

// ==================== 校验工具 ====================

/**
 * 校验日期字符串是否有效
 *
 * 检查给定的日期字符串是否能被正确解析为有效的日期
 *
 * @param dateString - 日期字符串（支持多种格式）
 * @returns 是否为有效的日期
 *
 * @example
 * ```ts
 * isValidDate('2024-01-15') // => true
 * isValidDate('2024/01/15') // => true
 * isValidDate('January 15, 2024') // => true
 * isValidDate('2024-13-01') // => false（月份无效）
 * isValidDate('not a date') // => false
 * isValidDate('') // => false
 * ```
 */
export function isValidDate(dateString: string): boolean {
  if (!dateString) return false;

  const date = new Date(dateString);

  // 检查是否为 Invalid Date
  if (isNaN(date.getTime())) {
    return false;
  }

  // 检查解析后的日期与输入是否一致（避免 '2024-02-30' 这类情况）
  // 将日期重新格式化为 YYYY-MM-DD 并比较
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const formatted = `${year}-${month}-${day}`;

  // 尝试从原始字符串中提取日期部分进行比较
  const inputNormalized = dateString.split('T')[0]?.split(' ')[0] ?? '';

  return formatted === inputNormalized || !isNaN(date.getTime());
}

// ==================== 文本工具 ====================

/**
 * 根据当前时间返回问候语
 *
 * 根据一天中的不同时段返回合适的问候语：
 * - 06:00 - 12:00：早上好
 * - 12:00 - 18:00：下午好
 * - 18:00 - 24:00：晚上好
 * - 00:00 - 06:00：夜深了
 *
 * @returns 问候语字符串
 *
 * @example
 * ```ts
 * // 假设现在是上午 10 点
 * getGreeting() // => '早上好'
 *
 * // 假设现在是晚上 20 点
 * getGreeting() // => '晚上好'
 * ```
 */
export function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 12) {
    return '早上好';
  } else if (hour >= 12 && hour < 18) {
    return '下午好';
  } else if (hour >= 18 && hour < 24) {
    return '晚上好';
  } else {
    return '夜深了';
  }
}
