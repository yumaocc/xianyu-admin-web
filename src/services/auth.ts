import { get, post } from './request';
import type { User, ApiResponse } from '@/types';

// 登录
export function login(credentials: {
  username: string;
  password: string;
  remember?: boolean;
}): Promise<ApiResponse<{
  token: string;
  user: User;
  expiresIn: number;
}>> {
  return post('/api/auth/login', credentials);
}

// 退出登录
export function logout(): Promise<ApiResponse<void>> {
  return post('/api/auth/logout');
}

// 获取当前用户信息
export function getCurrentUser(): Promise<ApiResponse<User>> {
  return get('/api/auth/me');
}

// 刷新Token
export function refreshToken(): Promise<ApiResponse<{
  token: string;
  expiresIn: number;
}>> {
  return post('/api/auth/refresh');
}

// 修改密码
export function changePassword(data: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ApiResponse<void>> {
  return post('/api/auth/change-password', data);
}

// 更新用户信息
export function updateProfile(data: {
  email?: string;
  avatar?: string;
}): Promise<ApiResponse<User>> {
  return post('/api/auth/profile', data);
}

// 验证Token有效性
export function validateToken(): Promise<ApiResponse<{
  valid: boolean;
  expiresAt: string;
}>> {
  return get('/api/auth/validate');
}