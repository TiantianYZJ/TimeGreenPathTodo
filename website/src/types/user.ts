export interface UserInfo {
  id: number;
  openid: string;
  nickname: string;
  avatarUrl: string | null;
  todoLimit: number;
  comboLimit: number;
  collabLimit: number;
  isAdmin: boolean;
}
