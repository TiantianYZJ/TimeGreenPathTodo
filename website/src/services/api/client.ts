import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { message } from 'antd';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.yzjtiantian.cn';

const client: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

// Request interceptor
client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const stored = localStorage.getItem('timegreen-auth');
    if (stored) {
      try {
        const { state } = JSON.parse(stored);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch {
        // ignore
      }
    }
    // Cache bust for GET requests
    if (config.method === 'get') {
      config.params = { ...config.params, _t: Date.now() };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
client.interceptors.response.use(
  (response: AxiosResponse) => {
    const data = response.data;
    if (data && typeof data === 'object' && 'success' in data) {
      if (!data.success) {
        const msg = data.message || '请求失败';
        message.error(msg);
        return Promise.reject(new Error(msg));
      }
    }
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 401: {
          localStorage.removeItem('auth-storage');
          const currentPath = window.location.pathname;
          if (currentPath !== '/login') {
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          }
          break;
        }
        case 403:
          message.error('没有权限执行此操作');
          break;
        case 404:
          message.error('请求的资源不存在');
          break;
        case 429:
          message.error('请求过于频繁，请稍后再试');
          break;
        default:
          message.error(data?.message || '服务器错误');
      }
    } else if (error.code === 'ECONNABORTED') {
      message.error('请求超时，请检查网络');
    } else {
      message.error('网络错误，请检查网络连接');
    }
    return Promise.reject(error);
  }
);

export const request = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    client.get(url, config).then((res) => res.data as T),
  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    client.post(url, data, config).then((res) => res.data as T),
  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    client.put(url, data, config).then((res) => res.data as T),
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    client.delete(url, config).then((res) => res.data as T),
};

export default client;
