/**
 * 标签相关类型定义
 */

export interface Tag {
  /** 标签ID */
  id: number;
  /** 标签名称 */
  name: string;
  /** 标签颜色（HEX格式） */
  color: string;
  /** 标签图标名称 */
  icon: string;
  /** 是否系统预设标签 */
  is_system: boolean;
}

export interface CreateTagData {
  name: string;
  color: string;
  icon: string;
}

export interface UpdateTagData extends Partial<CreateTagData> {}
