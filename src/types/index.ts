// 商品类型定义
export interface Product {
  id: string;
  itemId: string;
  title: string;
  desc: string;
  price: number;
  soldPrice: number;
  category?: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  updatedAt: string;
  hasCustomPrompts: boolean;
  syncStatus: 'pending' | 'synced' | 'error' | 'syncing';
}

// 提示词类型
export type PromptType = 'price' | 'tech' | 'default' | 'classify';

export interface ProductPrompts {
  price: string;
  tech: string;
  default: string;
  classify: string;
}

// 商品设置
export interface ProductSettings {
  maxDiscount: number;
  sellingPoints: string[];
  targetCustomers: string;
  urgencyLevel: 'low' | 'medium' | 'high';
}

// 同步状态
export interface SyncStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  message?: string;
  startTime: string;
  endTime?: string;
  affectedItems: number;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  code?: number;
}

// 分页参数
export interface PaginationParams {
  page: number;
  pageSize: number;
  keyword?: string;
  category?: string;
  status?: string;
}

// 分页响应
export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 用户信息
export interface User {
  id: string;
  username: string;
  email?: string;
  role: 'super_admin' | 'admin' | 'user';
  avatar?: string;
  createdAt: string;
}

// 系统统计
export interface SystemStats {
  totalProducts: number;
  totalValue: number;
  aiConfigRate: number;
  todaySyncCount: number;
  activeProducts: number;
  errorCount: number;
}

// WebSocket消息类型
export interface WebSocketMessage {
  type: 'stats_update' | 'sync_status' | 'product_change' | 'error' | 'notification';
  data: any;
  timestamp: string;
}

// 路由菜单项
export interface MenuItem {
  name: string;
  path: string;
  icon?: string;
  component?: string;
  routes?: MenuItem[];
  hideInMenu?: boolean;
}

// 表单验证规则
export interface FormRule {
  required?: boolean;
  message?: string;
  pattern?: RegExp;
  min?: number;
  max?: number;
  validator?: (rule: any, value: any) => Promise<void>;
}

// 编辑器配置
export interface EditorConfig {
  theme?: 'vs' | 'vs-dark' | 'hc-black';
  language?: string;
  readOnly?: boolean;
  wordWrap?: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
  minimap?: {
    enabled: boolean;
  };
  scrollBeyondLastLine?: boolean;
}

// 商品创建步骤
export interface CreateStep {
  title: string;
  description: string;
  status: 'wait' | 'process' | 'finish' | 'error';
}

// 筛选器类型
export interface FilterOptions {
  categories: string[];
  statuses: Array<{
    label: string;
    value: string;
    color?: string;
  }>;
  priceRanges: Array<{
    label: string;
    value: [number, number];
  }>;
}

// 操作日志
export interface OperationLog {
  id: string;
  action: string;
  target: string;
  targetId: string;
  userId: string;
  userName: string;
  timestamp: string;
  details?: Record<string, any>;
}

// 通知消息
export interface NotificationMessage {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

// 上传文件信息
export interface FileInfo {
  uid: string;
  name: string;
  status: 'uploading' | 'done' | 'error' | 'removed';
  url?: string;
  thumbUrl?: string;
  size: number;
  type: string;
}

// 导出选项
export interface ExportOptions {
  format: 'json' | 'csv' | 'excel';
  fields: string[];
  filter?: Record<string, any>;
  fileName?: string;
}

// 模板信息
export interface PromptTemplate {
  id: string;
  name: string;
  type: PromptType;
  content: string;
  description?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}