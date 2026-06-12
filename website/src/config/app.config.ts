export const APP_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.yzjtiantian.cn',
  LOGO_URL: 'https://api.yzjtiantian.cn/uploads/logo/logo.png',
  APP_NAME: '时光绿径待办',
  APP_NAME_EN: 'TimeGreen Path Todo',
  VERSION: '1.0.0',
  POLLING_INTERVAL: 30000, // 30s for collaboration polling
  TOKEN_KEY: 'auth-storage',
  TODO_STORAGE_KEY: 'todos',
} as const;
