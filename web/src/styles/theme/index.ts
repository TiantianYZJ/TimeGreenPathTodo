import type { ThemeConfig } from 'antd';

/**
 * 时光绿径待办 - Ant Design 5 主题配置
 *
 * 品牌主色: #00b26a (清新绿)
 * 基于 Design Token 系统与 CSS 变量保持一致
 */
const theme: ThemeConfig = {
  token: {
    /* ---------- 品牌色彩 ---------- */
    colorPrimary: '#00b26a',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    colorLink: '#00b26a',
    colorLinkHover: '#009e5d',

    /* ---------- 字体系统 ---------- */
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeSM: 12,
    fontSizeXL: 20,
    lineHeight: 1.5715,
    lineHeightLG: 1.5,
    lineHeightSM: 1.6667,

    /* ---------- 字重 ---------- */
    fontWeightStrong: 600,

    /* ---------- 圆角 ---------- */
    borderRadius: 6,
    borderRadiusSM: 4,
    borderRadiusLG: 8,
    borderRadiusXS: 2,

    /* ---------- 间距 ---------- */
    sizeUnit: 4,
    sizeStep: 4,
    sizePopupArrow: 12,

    /* ---------- 控件高度 ---------- */
    controlHeight: 36,
    controlHeightLG: 44,
    controlHeightSM: 28,

    /* ---------- 阴影 ---------- */
    boxShadow:
      '0 1px 2px -1px rgba(0, 0, 0, 0.08), 0 1px 3px 0 rgba(0, 0, 0, 0.05)',
    boxShadowSecondary:
      '0 4px 6px -4px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',

    /* ---------- 动效 ---------- */
    motionDurationFast: '150ms',
    motionDurationMid: '200ms',
    motionDurationSlow: '300ms',
    motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    motionEaseOut: 'cubic-bezier(0, 0, 0.2, 1)',

    /* ---------- 其他 ---------- */
    wireframe: false,
  },

  components: {
    Button: {
      primaryShadow:
        '0 2px 4px rgba(0, 178, 106, 0.25)',
      contentFontSizeLG: 16,
      contentFontSizeSM: 14,
      fontWeight: 500,
      borderRadius: 6,
    },

    Card: {
      paddingLG: 24,
      borderRadiusLG: 32,
      boxShadowTertiary:
        '0 1px 2px rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.02)',
    },

    Input: {
      activeBorderColor: '#00b26a',
      hoverBorderColor: '#40c98c',
      activeShadow: '0 0 0 2px rgba(0, 178, 106, 0.1)',
      paddingInline: 12,
      paddingBlock: 8,
      borderRadius: 6,
    },

    Select: {
      optionActiveBg: 'rgba(0, 178, 106, 0.06)',
      optionSelectedBg: 'rgba(0, 178, 106, 0.08)',
      optionSelectedColor: '#00b26a',
      activeBorderColor: '#00b26a',
      hoverBorderColor: '#40c98c',
    },

    Table: {
      headerBg: '#fafafa',
      headerColor: '#595959',
      rowHoverBg: 'rgba(0, 0, 0, 0.02)',
      borderColor: '#f0f0f0',
      headerSortActiveBg: 'rgba(0, 0, 0, 0.02)',
      headerSortHoverBg: 'rgba(0, 0, 0, 0.04)',
    },

    Modal: {
      borderRadiusLG: 16,
      contentBg: '#ffffff',
      headerBg: '#ffffff',
      footerBg: '#ffffff',
    },

    Drawer: {
      colorBgElevated: '#ffffff',
      borderRadiusLG: 16,
    },

    Menu: {
      itemActiveBg: 'rgba(0, 178, 106, 0.06)',
      itemSelectedBg: 'rgba(0, 178, 106, 0.08)',
      itemSelectedColor: '#00b26a',
      itemHoverBg: 'rgba(0, 0, 0, 0.04)',
      itemBorderRadius: 6,
    },

    Tag: {
      defaultBg: 'rgba(0, 0, 0, 0.04)',
      defaultColor: '#595959',
      borderRadiusSM: 4,
    },

    Switch: {
      colorPrimary: '#00b26a',
      colorPrimaryHover: '#009e5d',
    },

    Checkbox: {
      colorPrimary: '#00b26a',
      colorPrimaryHover: '#009e5d',
    },

    Radio: {
      colorPrimary: '#00b26a',
      colorPrimaryHover: '#009e5d',
    },

    Pagination: {
      itemActiveBg: '#00b26a',
      itemActiveBgDisabled: 'rgba(0, 178, 106, 0.3)',
    },

    Tabs: {
      inkBarColor: '#00b26a',
      itemActiveColor: '#00b26a',
      itemSelectedColor: '#00b26a',
      cardGutter: 0,
    },

    Message: {
      contentBg: '#ffffff',
    },

    Notification: {
      colorBgElevated: '#ffffff',
    },

    Popover: {
      colorBgElevated: '#ffffff',
      boxShadow:
        '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.04), 0 9px 28px 0 rgba(0, 0, 0, 0.05)',
    },

    Tooltip: {
      colorBgSpotlight: 'rgba(64, 64, 64, 0.85)',
    },

    Dropdown: {
      colorBgElevated: '#ffffff',
      borderRadiusLG: 8,
      controlItemBgHover: 'rgba(0, 0, 0, 0.04)',
      controlItemBgActive: 'rgba(0, 178, 106, 0.06)',
    },

    DatePicker: {
      cellActiveWithRangeBg: 'rgba(0, 178, 106, 0.1)',
      cellRangeBorderColor: '#00b26a',
      hoverBorderColor: '#40c98c',
      activeBorderColor: '#00b26a',
    },

    Badge: {
      colorPrimary: '#00b26a',
      colorError: '#ff4d4f',
    },

    Progress: {
      defaultColor: '#00b26a',
      remainingColor: 'rgba(0, 0, 0, 0.06)',
    },

    Alert: {
      colorInfoBg: 'rgba(24, 144, 255, 0.06)',
      colorInfoBorder: 'rgba(24, 144, 255, 0.3)',
      colorSuccessBg: 'rgba(82, 196, 26, 0.06)',
      colorSuccessBorder: 'rgba(82, 196, 26, 0.3)',
      colorWarningBg: 'rgba(250, 173, 20, 0.06)',
      colorWarningBorder: 'rgba(250, 173, 20, 0.3)',
      colorErrorBg: 'rgba(255, 77, 79, 0.06)',
      colorErrorBorder: 'rgba(255, 77, 79, 0.3)',
    },

    Avatar: {
      colorPrimaryBg: 'rgba(0, 178, 106, 0.1)',
      colorTextLightSolid: '#ffffff',
    },
  },
};

export default theme;
