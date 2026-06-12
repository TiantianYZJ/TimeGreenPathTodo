export interface SharedTodo {
  id: number;
  text: string;
  setDate: string;
  setTime: string;
  remarks: string;
  assignType: 'all' | 'any' | 'specific';
  excludeType: string;
  tags: number[];
  images: string[];
  location: import('./todo').LocationInfo | null;
  completedAt: number;
  myCompletedAt: number | null;
  createdAt: string;
  assignCount: number;
  completedCount: number;
  creator: {
    id: number;
    nickname: string;
    avatar: string | null;
  };
  assignments: SharedTodoAssignment[];
}

export interface SharedTodoAssignment {
  userId: number;
  nickname: string;
  avatarUrl: string | null;
  completedAt: number | null;
}

export interface CollabRequest {
  id: number;
  userId: number;
  nickname: string;
  avatarUrl: string | null;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Comment {
  id: number;
  userId: number;
  nickname: string;
  avatarUrl: string | null;
  content: string;
  parentId: number | null;
  replyToUserId: number | null;
  replyToNickname: string | null;
  canDelete: boolean;
  createdAt: string;
  replies: Comment[];
}
