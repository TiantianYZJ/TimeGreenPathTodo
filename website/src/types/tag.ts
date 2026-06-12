export interface Tag {
  id: number;
  name: string;
  color: string;
  icon: string;
  isSystem: boolean;
  usageCount?: number;
}

export interface CreateTagData {
  name: string;
  color?: string;
  icon?: string;
}

export interface UpdateTagData {
  name?: string;
  color?: string;
  icon?: string;
}
