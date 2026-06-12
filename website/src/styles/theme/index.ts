import { theme } from 'antd';
import type { ThemeConfig } from 'antd';

const lightTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#00b26a',
    colorBgLayout: '#e3f5eb',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorText: '#1a1a1a',
    colorTextSecondary: '#666666',
    colorBorder: '#e8e8e8',
    borderRadius: 8,
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 14,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    colorSuccess: '#00b26a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      siderBg: '#ffffff',
      bodyBg: '#e3f5eb',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#e3f5eb',
      itemSelectedColor: '#00b26a',
      itemHoverBg: '#f0faf5',
      itemActiveBg: '#d0f0de',
    },
    Card: {
      paddingLG: 20,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    },
    Button: {
      primaryShadow: '0 2px 4px rgba(0,178,106,0.3)',
    },
    Input: {
      activeBorderColor: '#00b26a',
      hoverBorderColor: '#4dd69a',
    },
    Select: {
      optionSelectedBg: '#e3f5eb',
    },
    Table: {
      headerBg: '#f0faf5',
      rowHoverBg: '#f0faf5',
    },
    Modal: {
      contentBg: '#ffffff',
    },
    Tag: {
      defaultBg: '#f0faf5',
    },
  },
};

const darkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    ...lightTheme.token,
    colorPrimary: '#4dd69a',
    colorBgLayout: '#0a1a12',
    colorBgContainer: '#142118',
    colorBgElevated: '#1a2d22',
    colorText: '#e8e8e8',
    colorTextSecondary: '#a0a0a0',
    colorBorder: '#2a3d2f',
  },
  components: {
    ...lightTheme.components,
    Layout: {
      headerBg: '#142118',
      siderBg: '#142118',
      bodyBg: '#0a1a12',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#1a2d22',
      itemSelectedColor: '#4dd69a',
      itemHoverBg: '#1a2d22',
      itemActiveBg: '#223d2a',
    },
    Card: {
      ...lightTheme.components?.Card,
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    },
    Table: {
      headerBg: '#1a2d22',
      rowHoverBg: '#1a2d22',
    },
  },
};

export const getThemeConfig = (isDark: boolean): ThemeConfig => {
  return isDark ? darkTheme : lightTheme;
};
