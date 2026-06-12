const { todosApi, authApi, setToken, getToken } = require('./api.js');

const SYNC_STORAGE_KEY = 'lastSyncAt';
const LOCAL_TODOS_KEY = 'todos';
const DELETED_TODOS_KEY = 'deletedTodos';

let syncLock = false;
let syncQueue = [];

function formatDate(dateValue) {
  if (!dateValue) return dateValue;
  const dateObj = new Date(dateValue);
  if (isNaN(dateObj.getTime())) return dateValue;
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTime(timeValue) {
  if (!timeValue) return timeValue;
  if (typeof timeValue === 'string' && timeValue.length <= 5) {
    const parts = timeValue.split(':');
    if (parts.length === 2) {
      const hours = parts[0].padStart(2, '0');
      const minutes = parts[1].padStart(2, '0');
      return `${hours}:${minutes}`;
    }
  }
  const timeMatch = String(timeValue).match(/(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    const hours = timeMatch[1].padStart(2, '0');
    const minutes = timeMatch[2].padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  return timeValue;
}

function formatTodoDates(todo) {
  if (!todo) return todo;
  return {
    ...todo,
    setDate: formatDate(todo.setDate),
    setTime: formatTime(todo.setTime)
  };
}

function getLastSyncTime() {
  return wx.getStorageSync(SYNC_STORAGE_KEY) || null;
}

function setLastSyncTime(time) {
  wx.setStorageSync(SYNC_STORAGE_KEY, time);
}

function getLocalTodos() {
  return wx.getStorageSync(LOCAL_TODOS_KEY) || [];
}

function setLocalTodos(todos) {
  const activeTodos = todos.filter(t => !t.isDeleted);
  activeTodos.sort((a, b) => (b.time || 0) - (a.time || 0));
  wx.setStorageSync(LOCAL_TODOS_KEY, activeTodos);
  const app = getApp();
  if (app && app.updateCalendarCache) {
    app.updateCalendarCache(activeTodos);
  }
}

function getDeletedTodos() {
  return wx.getStorageSync(DELETED_TODOS_KEY) || [];
}

function addDeletedTodo(todo) {
  const deletedTodos = getDeletedTodos();
  const existingIndex = deletedTodos.findIndex(t => t.id === todo.id);
  if (existingIndex > -1) {
    deletedTodos[existingIndex] = {
      id: todo.id,
      deletedAt: todo.deletedAt,
      updatedAt: todo.updatedAt
    };
  } else {
    deletedTodos.push({
      id: todo.id,
      deletedAt: todo.deletedAt,
      updatedAt: todo.updatedAt
    });
  }
  wx.setStorageSync(DELETED_TODOS_KEY, deletedTodos);
}

function clearDeletedTodos(ids) {
  if (!ids || ids.length === 0) return;
  const deletedTodos = getDeletedTodos().filter(t => !ids.includes(t.id));
  wx.setStorageSync(DELETED_TODOS_KEY, deletedTodos);
}

function getLocalChanges(lastSyncAt) {
  const allTodos = wx.getStorageSync(LOCAL_TODOS_KEY) || [];
  const deletedTodos = getDeletedTodos();
  const lastSyncTimestamp = lastSyncAt ? new Date(lastSyncAt).getTime() : 0;
  
  const localChanges = allTodos.filter(todo => {
    const updatedAt = todo.updatedAt || todo.time || 0;
    return updatedAt > lastSyncTimestamp;
  });
  
  const localDeletedIds = deletedTodos
    .filter(todo => todo.deletedAt && todo.deletedAt > lastSyncTimestamp)
    .map(todo => todo.id);
  
  return { localChanges, localDeletedIds };
}

function mergeChanges(cloudChanges, cloudDeletedIds, localWins = false) {
  const localTodos = getLocalTodos();
  const localDeletedTodos = getDeletedTodos();
  const localTodoMap = new Map();
  
  localTodos.forEach(todo => {
    if (todo.id) {
      localTodoMap.set(todo.id, todo);
    }
  });
  
  const localDeletedMap = new Map();
  localDeletedTodos.forEach(todo => {
    localDeletedMap.set(todo.id, todo);
  });
  
  const cloudDeletedSet = new Set(cloudDeletedIds);
  
  cloudChanges.forEach(cloudTodo => {
    const formattedCloudTodo = formatTodoDates(cloudTodo);
    const localTodo = localTodoMap.get(formattedCloudTodo.id);
    const localDeletedInfo = localDeletedMap.get(formattedCloudTodo.id);
    
    if (localDeletedInfo) {
      const localDeletedAt = localDeletedInfo.deletedAt || 0;
      const cloudUpdatedAt = formattedCloudTodo.updatedAt || formattedCloudTodo.time || 0;
      
      if (localDeletedAt >= cloudUpdatedAt) {
        return;
      }
    }
    
    if (!localTodo) {
      if (!formattedCloudTodo.isDeleted && !cloudDeletedSet.has(formattedCloudTodo.id)) {
        if (!localDeletedMap.has(formattedCloudTodo.id)) {
          localTodoMap.set(formattedCloudTodo.id, formattedCloudTodo);
        }
      }
    } else {
      const localIsDeleted = localTodo.isDeleted;
      const cloudIsDeleted = formattedCloudTodo.isDeleted;
      
      if (cloudIsDeleted || localIsDeleted) {
        const cloudDeletedAt = formattedCloudTodo.deletedAt || formattedCloudTodo.updatedAt || 0;
        const localDeletedAt = localTodo.deletedAt || localTodo.updatedAt || 0;
        
        if (cloudIsDeleted && localIsDeleted) {
          if (cloudDeletedAt >= localDeletedAt) {
            localTodoMap.delete(formattedCloudTodo.id);
          }
        } else if (cloudIsDeleted) {
          if (cloudDeletedAt >= (localTodo.updatedAt || localTodo.time || 0)) {
            localTodoMap.delete(formattedCloudTodo.id);
          }
        } else if (localIsDeleted) {
          if (localDeletedAt >= cloudUpdatedAt) {
            localTodoMap.delete(formattedCloudTodo.id);
          }
        }
        return;
      }
      
      const localUpdatedAt = localTodo.updatedAt || localTodo.time || 0;
      const cloudUpdatedAt = formattedCloudTodo.updatedAt || formattedCloudTodo.time || 0;
      
      if (cloudUpdatedAt >= localUpdatedAt) {
        localTodoMap.set(formattedCloudTodo.id, formattedCloudTodo);
      }
    }
  });
  
  cloudDeletedIds.forEach(id => {
    const localTodo = localTodoMap.get(id);
    if (localTodo) {
      const localUpdatedAt = localTodo.updatedAt || localTodo.time || 0;
      const cloudDeletedAt = localTodo.deletedAt || 0;
      
      if (cloudDeletedAt >= localUpdatedAt) {
        localTodoMap.delete(id);
      }
    }
  });
  
  const mergedTodos = Array.from(localTodoMap.values());
  mergedTodos.sort((a, b) => (b.time || 0) - (a.time || 0));
  return mergedTodos;
}

async function loginWithCode() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: async (res) => {
        try {
          const result = await authApi.login(res.code);
          if (result.token) {
            setToken(result.token);
          }
          resolve(result);
        } catch (err) {
          reject(err);
        }
      },
      fail: (err) => {
        reject(new Error('微信登录失败'));
      }
    });
  });
}

async function checkSyncDiff() {
  const lastSyncAt = getLastSyncTime();
  const { localChanges, localDeletedIds } = getLocalChanges(lastSyncAt);
  
  try {
    const result = await todosApi.sync({
      localChanges: [],
      localDeletedIds: [],
      lastSyncAt
    });
    
    if (!result) {
      throw new Error('同步返回数据为空');
    }
    
    const cloudChanges = result.cloudChanges || [];
    const cloudDeletedIds = result.cloudDeletedIds || [];
    
    const cloudActiveChanges = cloudChanges.filter(t => !t.isDeleted);
    const cloudDeletedFromChanges = cloudChanges.filter(t => t.isDeleted);
    
    const hasLocalChanges = localChanges.length > 0 || localDeletedIds.length > 0;
    const hasCloudChanges = cloudActiveChanges.length > 0 || cloudDeletedIds.length > 0 || cloudDeletedFromChanges.length > 0;
    
    if (!hasLocalChanges && !hasCloudChanges) {
      return {
        hasDiff: false,
        status: 'synced'
      };
    }
    
    const localTodoIds = new Set((wx.getStorageSync(LOCAL_TODOS_KEY) || []).map(t => t.id));
    const cloudTodoIds = new Set(cloudChanges.map(t => t.id));
    
    const newFromCloud = cloudActiveChanges.filter(t => !localTodoIds.has(t.id));
    const newFromLocal = localChanges.filter(t => !cloudTodoIds.has(t.id));
    const updatedInCloud = cloudActiveChanges.filter(t => {
      const local = localChanges.find(l => l.id === t.id);
      if (!local) return false;
      const cloudVersion = t.version || 1;
      const localVersion = local.version || 1;
      return cloudVersion > localVersion;
    });
    
    return {
      hasDiff: true,
      status: 'diff',
      localChangesCount: localChanges.length,
      localDeletedCount: localDeletedIds.length,
      cloudChangesCount: cloudActiveChanges.length,
      cloudDeletedCount: cloudDeletedIds.length + cloudDeletedFromChanges.length,
      newFromCloudCount: newFromCloud.length,
      newFromLocalCount: newFromLocal.length,
      updatedInCloudCount: updatedInCloud.length,
      localChanges,
      localDeletedIds,
      cloudChanges,
      cloudDeletedIds,
      syncedAt: result.syncedAt
    };
  } catch (err) {
    console.error('检查同步差异失败:', err);
    throw err;
  }
}

async function syncWithCloud(resolveStrategy = 'merge') {
  return new Promise((resolve, reject) => {
    syncQueue.push({ resolveStrategy, resolve, reject });
    processSyncQueue();
  });
}

async function processSyncQueue() {
  if (syncLock || syncQueue.length === 0) {
    return;
  }
  
  syncLock = true;
  const { resolveStrategy, resolve, reject } = syncQueue.shift();
  
  try {
    const result = await _syncWithCloudInternal(resolveStrategy);
    resolve(result);
  } catch (err) {
    reject(err);
  } finally {
    syncLock = false;
    if (syncQueue.length > 0) {
      processSyncQueue();
    }
  }
}

async function _syncWithCloudInternal(resolveStrategy = 'merge') {
  const lastSyncAt = getLastSyncTime();
  const { localChanges, localDeletedIds } = getLocalChanges(lastSyncAt);
  
  try {
    if (resolveStrategy === 'local') {
      const result = await todosApi.sync({
        localChanges,
        localDeletedIds,
        lastSyncAt: null
      });
      setLastSyncTime(result.syncedAt || new Date().toISOString());
      clearDeletedTodos(localDeletedIds);
      return {
        status: 'local_wins',
        message: '已将本地数据同步到云端'
      };
    }
    
    const result = await todosApi.sync({
      localChanges: [],
      localDeletedIds: [],
      lastSyncAt
    });
    
    if (!result) {
      throw new Error('同步返回数据为空');
    }
    
    const cloudChanges = result.cloudChanges || [];
    const cloudDeletedIds = result.cloudDeletedIds || [];
    
    if (resolveStrategy === 'cloud') {
      const cloudTodos = cloudChanges.filter(t => !t.isDeleted);
      setLocalTodos(cloudTodos.map(t => formatTodoDates(t)));
      clearDeletedTodos([]);
      setLastSyncTime(result.syncedAt || new Date().toISOString());
      return {
        status: 'cloud_wins',
        message: '已使用云端数据覆盖本地'
      };
    }
    
    const mergedTodos = mergeChanges(cloudChanges, cloudDeletedIds, false);
    setLocalTodos(mergedTodos);
    
    const cloudTodoIds = new Set(cloudChanges.map(t => t.id));
    const localOnlyChanges = localChanges.filter(t => !cloudTodoIds.has(t.id));
    const localOnlyDeletedIds = localDeletedIds.filter(id => !cloudDeletedIds.includes(id));
    
    if (localOnlyChanges.length > 0 || localOnlyDeletedIds.length > 0) {
      console.log('merge - uploading local only changes:', localOnlyChanges.length, 'deleted:', localOnlyDeletedIds.length);
      await todosApi.sync({
        localChanges: localOnlyChanges,
        localDeletedIds: localOnlyDeletedIds,
        lastSyncAt: result.syncedAt
      });
    }
    
    clearDeletedTodos(localDeletedIds);
    setLastSyncTime(new Date().toISOString());
    
    return {
      status: 'merged',
      message: '已合并本地和云端数据',
      uploadedCount: localOnlyChanges.length,
      downloadedCount: cloudChanges.length
    };
  } catch (err) {
    console.error('同步失败:', err);
    throw err;
  }
}

async function incrementalSync() {
  const lastSyncAt = getLastSyncTime();
  const { localChanges, localDeletedIds } = getLocalChanges(lastSyncAt);
  
  try {
    const result = await todosApi.sync({
      localChanges,
      localDeletedIds,
      lastSyncAt
    });
    
    if (!result) {
      throw new Error('同步返回数据为空');
    }
    
    if (result.cloudChanges || result.cloudDeletedIds) {
      const mergedTodos = mergeChanges(
        result.cloudChanges || [],
        result.cloudDeletedIds || []
      );
      setLocalTodos(mergedTodos);
    }
    
    clearDeletedTodos(localDeletedIds);
    setLastSyncTime(result.syncedAt || new Date().toISOString());
    
    return {
      status: 'synced',
      uploadedCount: localChanges.length,
      deletedCount: localDeletedIds.length,
      downloadedCount: (result.cloudChanges || []).length
    };
  } catch (err) {
    console.error('增量同步失败:', err);
    throw err;
  }
}

async function fullSync() {
  const localTodos = getLocalTodos();
  const hasLocalData = localTodos && localTodos.length > 0;
  
  try {
    const cloudResult = await todosApi.fullSync(getLastSyncTime());
    const cloudTodos = (cloudResult.todos || []).map(todo => formatTodoDates(todo));
    const cloudDeletedIds = cloudResult.deletedIds || [];
    const hasCloudData = cloudTodos.length > 0;
    
    if (!hasLocalData && !hasCloudData) {
      return { status: 'empty', todos: [] };
    }
    
    if (!hasLocalData && hasCloudData) {
      const filteredTodos = cloudTodos.filter(t => !t.isDeleted);
      setLocalTodos(filteredTodos);
      setLastSyncTime(new Date().toISOString());
      return { status: 'downloaded', todos: filteredTodos };
    }
    
    if (hasLocalData && !hasCloudData) {
      const { localChanges, localDeletedIds } = getLocalChanges(null);
      await todosApi.sync({
        localChanges,
        localDeletedIds,
        lastSyncAt: null
      });
      setLastSyncTime(new Date().toISOString());
      return { status: 'uploaded', todos: localTodos };
    }
    
    const mergedTodos = mergeChanges(cloudTodos, cloudDeletedIds);
    const activeTodos = mergedTodos.filter(t => !t.isDeleted);
    
    const { localChanges, localDeletedIds } = getLocalChanges(getLastSyncTime());
    if (localChanges.length > 0 || localDeletedIds.length > 0) {
      await todosApi.sync({
        localChanges,
        localDeletedIds,
        lastSyncAt: getLastSyncTime()
      });
    }
    
    setLocalTodos(activeTodos);
    setLastSyncTime(new Date().toISOString());
    
    return {
      status: 'merged',
      todos: activeTodos,
      uploadedCount: localChanges.length
    };
  } catch (err) {
    console.error('全量同步失败:', err);
    throw err;
  }
}

async function ensureLogin() {
  const token = getToken();
  return !!token;
}

async function syncOnAppStart() {
  const isLoggedIn = await ensureLogin();
  if (!isLoggedIn) {
    console.log('未登录，跳过同步');
    return { status: 'not_logged_in' };
  }
  
  try {
    return await incrementalSync();
  } catch (err) {
    console.error('启动同步失败:', err);
    return { status: 'error', error: err.message };
  }
}

module.exports = {
  getLastSyncTime,
  setLastSyncTime,
  getLocalTodos,
  setLocalTodos,
  getLocalChanges,
  mergeChanges,
  loginWithCode,
  incrementalSync,
  fullSync,
  ensureLogin,
  syncOnAppStart,
  addDeletedTodo,
  clearDeletedTodos,
  checkSyncDiff,
  syncWithCloud
};
