// API 常量
export const API_ENDPOINTS = {
  // 商品相关
  PRODUCTS: '/api/products',
  PRODUCT_DETAIL: (id: string) => `/api/products/${id}`,
  PRODUCT_PROMPTS: (id: string) => `/api/products/${id}/prompts`,
  
  // 提示词相关
  PROMPT_TEMPLATES: '/api/prompts/templates',
  PROMPT_PREVIEW: '/api/prompts/preview',
  PROMPT_VALIDATE: '/api/prompts/validate',
  
  // 同步相关
  SYNC_STATUS: '/api/sync/status',
  SYNC_MANUAL: '/api/sync/manual',
  SYNC_AUTO: '/api/sync/auto',
  
  // 认证相关
  AUTH_LOGIN: '/api/auth/login',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_ME: '/api/auth/me',
  
  // 系统相关
  SYSTEM_STATS: '/api/system/stats',
  SYSTEM_HEALTH: '/api/system/health',
  SYSTEM_NOTIFICATIONS: '/api/system/notifications',
};

// 状态常量
export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DRAFT: 'draft',
} as const;

export const SYNC_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  ERROR: 'error',
} as const;

export const PROMPT_TYPES = {
  PRICE: 'price',
  TECH: 'tech',
  DEFAULT: 'default',
  CLASSIFY: 'classify',
} as const;

// UI 常量
export const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100'];
export const DEFAULT_PAGE_SIZE = 20;

export const CARD_GRID_COLS = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
  xl: 4,
  xxl: 5,
};

// 颜色主题
export const THEME_COLORS = {
  PRIMARY: '#1890ff',
  SUCCESS: '#52c41a',
  WARNING: '#faad14',
  ERROR: '#f5222d',
  INFO: '#13c2c2',
};

// 本地存储键名
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_INFO: 'user_info',
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  TABLE_COLUMNS: 'table_columns',
  FILTERS: 'filters',
};

// 文件上传限制
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/json', 'text/csv'],
  CHUNK_SIZE: 1024 * 1024, // 1MB
};

// 验证规则
export const VALIDATION_RULES = {
  REQUIRED: { required: true, message: '此字段为必填项' },
  EMAIL: {
    type: 'email' as const,
    message: '请输入有效的邮箱地址',
  },
  PHONE: {
    pattern: /^1[3-9]\d{9}$/,
    message: '请输入有效的手机号码',
  },
  PASSWORD: {
    min: 6,
    max: 20,
    message: '密码长度需要在6-20位之间',
  },
  PRODUCT_ID: {
    pattern: /^[a-zA-Z0-9_-]+$/,
    message: '商品ID只能包含字母、数字、下划线和横线',
  },
  PRICE: {
    type: 'number' as const,
    min: 0,
    message: '价格必须大于等于0',
  },
};

// 时间格式
export const DATE_FORMATS = {
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  DISPLAY: 'YYYY年MM月DD日 HH:mm',
};

// WebSocket 事件类型
export const WS_EVENT_TYPES = {
  STATS_UPDATE: 'stats_update',
  SYNC_STATUS: 'sync_status',
  PRODUCT_CHANGE: 'product_change',
  NOTIFICATION: 'notification',
  ERROR: 'error',
};

// 操作权限
export const PERMISSIONS = {
  PRODUCT: {
    VIEW: 'product:view',
    CREATE: 'product:create',
    EDIT: 'product:edit',
    DELETE: 'product:delete',
    SYNC: 'product:sync',
  },
  PROMPT: {
    VIEW: 'prompt:view',
    EDIT: 'prompt:edit',
    TEMPLATE: 'prompt:template',
  },
  SYSTEM: {
    SETTINGS: 'system:settings',
    USERS: 'system:users',
    LOGS: 'system:logs',
  },
};

// 错误代码
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SYNC_ERROR: 'SYNC_ERROR',
};

// 通知类型
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

// 导出筛选选项
export const EXPORT_FORMATS = ['json', 'csv', 'excel'] as const;

// 自动保存间隔（毫秒）
export const AUTO_SAVE_INTERVAL = 30000; // 30秒

// WebSocket 重连配置
export const WS_CONFIG = {
  RECONNECT_INTERVAL: 3000, // 3秒
  MAX_RECONNECT_ATTEMPTS: 5,
  HEARTBEAT_INTERVAL: 30000, // 30秒
};