import dayjs from 'dayjs';
import { DATE_FORMATS } from './constants';

// 数字格式化
export const formatNumber = (value: number, options?: Intl.NumberFormatOptions): string => {
  try {
    return new Intl.NumberFormat('zh-CN', options).format(value);
  } catch {
    return value.toString();
  }
};

// 价格格式化
export const formatPrice = (price: number, currency = '¥'): string => {
  return `${currency}${formatNumber(price, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// 百分比格式化
export const formatPercent = (value: number, precision = 2): string => {
  return `${(value * 100).toFixed(precision)}%`;
};

// 文件大小格式化
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// 时间格式化
export const formatDate = (date: string | Date | number, format = DATE_FORMATS.DATETIME): string => {
  return dayjs(date).format(format);
};

// 相对时间格式化
export const formatRelativeTime = (date: string | Date | number): string => {
  const now = dayjs();
  const target = dayjs(date);
  const diff = now.diff(target, 'second');

  if (diff < 60) {
    return '刚刚';
  } else if (diff < 3600) {
    return `${Math.floor(diff / 60)}分钟前`;
  } else if (diff < 86400) {
    return `${Math.floor(diff / 3600)}小时前`;
  } else if (diff < 2592000) {
    return `${Math.floor(diff / 86400)}天前`;
  } else {
    return target.format('YYYY-MM-DD');
  }
};

// 持续时间格式化
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}秒`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}分${remainingSeconds}秒` : `${minutes}分钟`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const remainingMinutes = Math.floor((seconds % 3600) / 60);
    return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`;
  }
};

// 文本截断
export const truncateText = (text: string, maxLength: number, suffix = '...'): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
};

// 高亮搜索关键词
export const highlightKeyword = (text: string, keyword: string): string => {
  if (!keyword || !text) return text;
  
  const regex = new RegExp(`(${keyword})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

// 手机号格式化
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  return phone;
};

// 身份证号格式化（脱敏）
export const formatIdCard = (idCard: string, mask = true): string => {
  if (!idCard) return '';
  
  if (mask && idCard.length >= 8) {
    return idCard.slice(0, 4) + '****' + idCard.slice(-4);
  }
  
  return idCard;
};

// 银行卡号格式化（脱敏）
export const formatBankCard = (cardNumber: string, mask = true): string => {
  if (!cardNumber) return '';
  
  const cleaned = cardNumber.replace(/\s/g, '');
  
  if (mask && cleaned.length >= 8) {
    const start = cleaned.slice(0, 4);
    const end = cleaned.slice(-4);
    const middle = '*'.repeat(Math.max(0, cleaned.length - 8));
    return `${start}${middle}${end}`.replace(/(.{4})/g, '$1 ').trim();
  }
  
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
};

// 邮箱格式化（脱敏）
export const formatEmail = (email: string, mask = true): string => {
  if (!email) return '';
  
  if (mask) {
    const [username, domain] = email.split('@');
    if (username && domain) {
      const maskedUsername = username.length > 2 
        ? username.slice(0, 2) + '*'.repeat(Math.max(0, username.length - 2))
        : username;
      return `${maskedUsername}@${domain}`;
    }
  }
  
  return email;
};

// 数组转字符串
export const arrayToString = (arr: any[], separator = ', '): string => {
  if (!Array.isArray(arr)) return '';
  return arr.filter(item => item != null).join(separator);
};

// 字符串转数组
export const stringToArray = (str: string, separator = ','): string[] => {
  if (!str) return [];
  return str.split(separator).map(item => item.trim()).filter(Boolean);
};

// URL参数格式化
export const formatUrlParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
};

// 状态文本格式化
export const formatStatus = (status: string): { text: string; color: string } => {
  const statusMap: Record<string, { text: string; color: string }> = {
    active: { text: '激活', color: 'success' },
    inactive: { text: '停用', color: 'default' },
    draft: { text: '草稿', color: 'warning' },
    pending: { text: '待处理', color: 'processing' },
    running: { text: '运行中', color: 'processing' },
    completed: { text: '已完成', color: 'success' },
    error: { text: '错误', color: 'error' },
    synced: { text: '已同步', color: 'success' },
    syncing: { text: '同步中', color: 'processing' },
  };
  
  return statusMap[status] || { text: status, color: 'default' };
};

// JSON格式化
export const formatJSON = (obj: any, indent = 2): string => {
  try {
    return JSON.stringify(obj, null, indent);
  } catch {
    return String(obj);
  }
};

// 下载量格式化
export const formatDownloadCount = (count: number): string => {
  if (count < 1000) {
    return count.toString();
  } else if (count < 1000000) {
    return `${(count / 1000).toFixed(1)}K`;
  } else {
    return `${(count / 1000000).toFixed(1)}M`;
  }
};

// 评分格式化
export const formatRating = (rating: number, maxRating = 5): string => {
  const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(maxRating - Math.floor(rating));
  return `${stars} (${rating.toFixed(1)})`;
};

// 转换驼峰命名
export const camelCase = (str: string): string => {
  return str.replace(/-(.)/g, (_, char) => char.toUpperCase());
};

// 转换短横线命名
export const kebabCase = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`).replace(/^-/, '');
};

// 首字母大写
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};