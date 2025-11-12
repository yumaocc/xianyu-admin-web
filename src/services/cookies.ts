import { get, post } from './request';
import type { ApiResponse } from '@/types';

export interface CookieConfig {
  hasCookies: boolean;
  cookiePreview: Record<string, string>;
  lastUpdated: string | null;
  status: 'configured' | 'not_configured';
}

export interface CookieTestResult {
  connected: boolean;
  status: 'valid' | 'invalid' | 'error';
  message: string;
  testTime: string;
}

// 获取当前Cookie配置
export function getCookieConfig(): Promise<ApiResponse<CookieConfig>> {
  return get('/api/config/cookies');
}

// 更新Cookie配置
export function updateCookieConfig(data: {
  cookiesStr: string;
}): Promise<ApiResponse<{
  updatedAt: string;
  status: string;
}>> {
  return post('/api/config/cookies', data);
}

// 测试Cookie连接
export function testCookieConnection(data?: {
  cookiesStr?: string;
}): Promise<ApiResponse<CookieTestResult>> {
  return post('/api/config/cookies/test', data || {});
}