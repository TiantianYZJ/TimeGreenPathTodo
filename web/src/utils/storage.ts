/**
 * 本地存储工具函数
 *
 * 封装 localStorage 和 sessionStorage 操作，
 * 提供类型安全的读写接口，支持 JSON 自动序列化/反序列化
 */

// ==================== 类型定义 ====================

/** 存储类型 */
type StorageType = 'local' | 'session';

// ==================== 内部辅助函数 ====================

/**
 * 获取存储对象
 *
 * @param type 存储类型：'local' 或 'session'
 * @returns Storage 对象（localStorage 或 sessionStorage）
 */
function getStorageInstance(type: StorageType): Storage {
  return type === 'local' ? localStorage : sessionStorage;
}

// ==================== localStorage 操作 ====================

/**
 * 从 localStorage 读取数据
 *
 * @param key 存储键名
 * @param defaultValue 默认值（当键不存在或读取失败时返回）
 * @returns 存储的值或默认值
 *
 * @example
 * ```ts
 * const token = getStorage('token'); // string | null
 * const theme = getStorage('theme', 'light'); // 默认返回 'light'
 * ```
 */
export function getStorage<T = string>(
  key: string,
  defaultValue?: T
): T | null {
  try {
    const value = localStorage.getItem(key);
    if (value === null) {
      return defaultValue ?? null;
    }
    return value as unknown as T;
  } catch (error) {
    console.error(`从 localStorage 读取 ${key} 失败:`, error);
    return defaultValue ?? null;
  }
}

/**
 * 向 localStorage 写入数据
 *
 * @param key 存储键名
 * @param value 要存储的值
 *
 * @example
 * ```ts
 * setStorage('token', 'abc123');
 * setStorage('user', { name: '张三' });
 * ```
 */
export function setStorage<T>(key: string, value: T): void {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, stringValue);
  } catch (error) {
    console.error(`向 localStorage 写入 ${key} 失败:`, error);
    // 可能是存储空间已满或隐私模式下禁用
    throw new Error(`存储失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 从 localStorage 删除指定数据
 *
 * @param key 存储键名
 *
 * @example
 * ```ts
 * removeStorage('token');
 * ```
 */
export function removeStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`从 localStorage 删除 ${key} 失败:`, error);
  }
}

/**
 * 清空 localStorage 所有数据
 *
 * **注意**：此操作会清除该域名下的所有本地存储数据，
 * 请谨慎使用！建议只在用户登出或数据重置场景下调用。
 *
 * @example
 * ```ts
 * // 用户登出时清空所有缓存
 * clearStorage();
 * ```
 */
export function clearStorage(): void {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('清空 localStorage 失败:', error);
  }
}

// ==================== JSON 存储（自动序列化） ====================

/**
 * 从 localStorage 读取 JSON 数据（自动反序列化）
 *
 * 适用于存储对象、数组等复杂数据类型
 *
 * @param key 存储键名
 * @param defaultValue 默认值（当键不存在、JSON 解析失败时返回）
 * @returns 解析后的 JavaScript 对象或默认值
 *
 * @example
 * ```ts
 * const user = getJSONStorage<UserInfo>('userInfo');
 * const settings = getJSONStorage<Settings>('settings', { theme: 'light' });
 * ```
 */
export function getJSONStorage<T>(
  key: string,
  defaultValue?: T
): T | null {
  try {
    const value = localStorage.getItem(key);
    if (value === null) {
      return defaultValue ?? null;
    }

    // 尝试解析 JSON
    const parsed = JSON.parse(value);
    return parsed as T;
  } catch (error) {
    console.error(`解析 localStorage 中 ${key} 的 JSON 失败:`, error);
    // JSON 解析失败，返回默认值
    return defaultValue ?? null;
  }
}

/**
 * 向 localStorage 写入 JSON 数据（自动序列化）
 *
 * 适用于存储对象、数组等复杂数据类型
 *
 * @param key 存储键名
 * @param value 要存储的值（会被自动序列化为 JSON 字符串）
 *
 * @example
 * ```ts
 * setJSONStorage('userInfo', { id: 1, name: '张三' });
 * setJSONStorage('todos', [{ id: 1, text: '待办事项' }]);
 * ```
 */
export function setJSONStorage<T>(key: string, value: T): void {
  try {
    const jsonString = JSON.stringify(value);
    localStorage.setItem(key, jsonString);
  } catch (error) {
    console.error(`序列化并写入 ${key} 到 localStorage 失败:`, error);
    throw new Error(
      `JSON 存储失败: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// ==================== sessionStorage 操作（可选） ====================

/**
 * 从 sessionStorage 读取数据
 *
 * @param key 存储键名
 * @param defaultValue 默认值
 * @returns 存储的值或默认值
 */
export function getSessionStorage<T = string>(
  key: string,
  defaultValue?: T
): T | null {
  try {
    const value = sessionStorage.getItem(key);
    if (value === null) {
      return defaultValue ?? null;
    }
    return value as unknown as T;
  } catch (error) {
    console.error(`从 sessionStorage 读取 ${key} 失败:`, error);
    return defaultValue ?? null;
  }
}

/**
 * 向 sessionStorage 写入数据
 *
 * @param key 存储键名
 * @param value 要存储的值
 */
export function setSessionStorage<T>(key: string, value: T): void {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    sessionStorage.setItem(key, stringValue);
  } catch (error) {
    console.error(`向 sessionStorage 写入 ${key} 失败:`, error);
    throw new Error(
      `Session 存储失败: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
