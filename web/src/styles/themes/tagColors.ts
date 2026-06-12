/**
 * 时光绿径待办 - 标签色彩常量
 *
 * 预设10种标签颜色，用于待办事项的分类标签
 * 每种颜色包含：HEX值、名称、对应的浅色背景、深色文字色
 */

export interface TagColor {
  /** 色彩 HEX 值 */
  color: string;
  /** 标签名称（中文） */
  name: string;
  /** 浅色背景色 (用于标签背景) */
  bgColor: string;
  /** 边框色 */
  borderColor: string;
}

export const TAG_COLORS: TagColor[] = [
  {
    color: '#1890ff',
    name: '工作',
    bgColor: 'rgba(24, 144, 255, 0.08)',
    borderColor: 'rgba(24, 144, 255, 0.3)',
  },
  {
    color: '#722ed1',
    name: '学习',
    bgColor: 'rgba(114, 46, 209, 0.08)',
    borderColor: 'rgba(114, 46, 209, 0.3)',
  },
  {
    color: '#52c41a',
    name: '生活',
    bgColor: 'rgba(82, 196, 26, 0.08)',
    borderColor: 'rgba(82, 196, 26, 0.3)',
  },
  {
    color: '#eb2f96',
    name: '娱乐',
    bgColor: 'rgba(235, 47, 150, 0.08)',
    borderColor: 'rgba(235, 47, 150, 0.3)',
  },
  {
    color: '#fa8c16',
    name: '健康',
    bgColor: 'rgba(250, 140, 22, 0.08)',
    borderColor: 'rgba(250, 140, 22, 0.3)',
  },
  {
    color: '#faad14',
    name: '购物',
    bgColor: 'rgba(250, 173, 20, 0.08)',
    borderColor: 'rgba(250, 173, 20, 0.3)',
  },
  {
    color: '#13c2c2',
    name: '社交',
    bgColor: 'rgba(19, 194, 194, 0.08)',
    borderColor: 'rgba(19, 194, 194, 0.3)',
  },
  {
    color: '#2f54eb',
    name: '旅行',
    bgColor: 'rgba(47, 84, 235, 0.08)',
    borderColor: 'rgba(47, 84, 235, 0.3)',
  },
  {
    color: '#00b26a',
    name: '重要',
    bgColor: 'rgba(0, 178, 106, 0.08)',
    borderColor: 'rgba(0, 178, 106, 0.3)',
  },
  {
    color: '#a054e1',
    name: '创意',
    bgColor: 'rgba(160, 84, 225, 0.08)',
    borderColor: 'rgba(160, 84, 225, 0.3)',
  },
];

/** 根据 ID 获取标签颜色（循环取模） */
export function getTagColorById(id: number): TagColor {
  return TAG_COLORS[id % TAG_COLORS.length]!;
}

/** 根据颜色值查找标签配置 */
export function getTagColorByValue(color: string): TagColor | undefined {
  return TAG_COLORS.find((tc) => tc.color.toLowerCase() === color.toLowerCase());
}
