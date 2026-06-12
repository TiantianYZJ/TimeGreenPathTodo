export interface Todo {
  id: string;
  text: string;
  setDate: string;
  setTime: string;
  remarks: string;
  completed: number;
  isStar: boolean;
  tags: number[];
  images: string[];
  comboId: number | null;
  location: LocationInfo | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface LocationInfo {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface CreateTodoData {
  text: string;
  setDate?: string;
  setTime?: string;
  remarks?: string;
  tags?: number[];
  isStar?: boolean;
  comboId?: number | null;
  images?: string[];
  location?: LocationInfo | null;
}

export interface UpdateTodoData extends Partial<CreateTodoData> {
  version?: number;
  completed?: number;
}

export interface TodoFilter {
  status: 'all' | 'completed' | 'uncompleted';
  comboId?: number | null;
  tagIds?: number[];
  dateRange?: [string, string];
  keyword?: string;
}

export interface DeletedTodo extends Todo {
  deletedAt: string;
}
