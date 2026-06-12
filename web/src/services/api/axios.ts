import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { message } from 'antd';

const DEFAULT_BASE_URL = 'https://api.yzjtiantian.cn';
const REQUEST_TIMEOUT = 15000;

function generateRequestId(): string {
  return Date.now() + '-' + Math.random().toString(36).substring(2, 10);
}

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    let token: string | null = null;
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        token = parsed?.state?.token || null;
      }
    } catch {
      // ignore
    }
    if (token && config.headers) {
      config.headers.Authorization = 'Bearer ' + token;
    }
    config.headers['X-Request-ID'] = generateRequestId();
    if (config.method === 'get' && config.url) {
      var sep = config.url.indexOf('?') > -1 ? '&' : '?';
      config.url = config.url + sep + '_t=' + Date.now();
    }
    return config;
  },
  function(error) {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  function(response: AxiosResponse) {
    var responseData = response.data;
    if (
      responseData &&
      typeof responseData === 'object' &&
      !Array.isArray(responseData) &&
      responseData.success &&
      responseData.data !== undefined
    ) {
      return responseData.data;
    }
    return responseData;
  },
  function(error) {
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        message.error('请求超时，请稍后重试');
      } else {
        message.error('网络连接异常，请检查网络设置');
      }
      return Promise.reject(error);
    }
    var status = error.response.status;
    var data = error.response.data;
    switch (status) {
      case 401:
        var currentPath = window.location.pathname;
        if (currentPath !== '/login') {
          import('@/stores/authStore').then(function(mod) {
            mod.useAuthStore.getState().logout();
          });
          message.error('登录已过期，请重新登录');
          window.location.href = '/login?redirect=' + encodeURIComponent(currentPath);
        }
        break;
      case 403:
        message.error('没有权限执行此操作');
        break;
      case 404:
        message.error('请求的资源不存在');
        break;
      case 429:
        message.error('操作过于频繁，请稍后再试');
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        message.error(data && data.message ? data.message : '服务器内部错误，请稍后重试');
        break;
      default:
        message.error(data && data.message ? data.message : '请求失败 (' + status + ')');
    }
    return Promise.reject(error);
  }
);

export default apiClient;

export var request = {
  get: function <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.get(url, config);
  },
  post: function <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.post(url, data, config);
  },
  put: function <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.put(url, data, config);
  },
  remove: function <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.delete(url, config);
  },
  patch: function <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.patch(url, data, config);
  },
};
