import { request as umiRequest } from '@umijs/max';
import { message, notification } from 'antd';
import type { RequestOptions } from '@umijs/max';
import type { ApiResponse } from '@/types';
import { authStorage } from '@/utils/storage';

// 封装请求函数
const request = async <T = any>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> => {
  const token = authStorage.getToken();
  
  const requestOptions: RequestOptions = {
    // 使用代理，开发环境下请求会自动转发到后端
    timeout: 10000,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await umiRequest<ApiResponse<T>>(url, requestOptions);
    
    // 处理业务错误
    if (response && typeof response === 'object') {
      if (response.success === false) {
        const errorMessage = response.message || '请求失败';
        
        if (response.code === 401) {
          message.error('登录已过期，请重新登录');
          authStorage.clear();
          window.location.href = '/login';
          throw new Error(errorMessage);
        }
        
        if (response.code === 403) {
          message.error('权限不足');
          throw new Error(errorMessage);
        }
        
        message.error(errorMessage);
        throw new Error(errorMessage);
      }
    }
    
    return response;
  } catch (error: any) {
    // 处理网络错误
    if (error.name === 'RequestError') {
      if (!error.response) {
        notification.error({
          message: '网络异常',
          description: '网络连接失败，请检查网络设置',
        });
      } else {
        const status = error.response.status;
        switch (status) {
          case 401:
            message.error('登录已过期，请重新登录');
            authStorage.clear();
            window.location.href = '/login';
            break;
          case 403:
            message.error('权限不足');
            break;
          case 404:
            message.error('请求的资源不存在');
            break;
          case 500:
            message.error('服务器内部错误');
            break;
          case 502:
            message.error('网关错误');
            break;
          case 503:
            message.error('服务不可用');
            break;
          case 504:
            message.error('网关超时');
            break;
          default:
            message.error(error.message || '请求失败');
        }
      }
    }
    
    throw error;
  }
};

// 泛型请求方法
export async function apiRequest<T = any>(
  url: string,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  try {
    const response = await request(url, options);
    return response;
  } catch (error) {
    throw error;
  }
}

// GET 请求
export function get<T = any>(
  url: string,
  params?: Record<string, any>
): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'GET',
    params,
  });
}

// POST 请求
export function post<T = any>(
  url: string,
  data?: Record<string, any>
): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'POST',
    data,
  });
}

// PUT 请求
export function put<T = any>(
  url: string,
  data?: Record<string, any>
): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'PUT',
    data,
  });
}

// DELETE 请求
export function del<T = any>(
  url: string,
  params?: Record<string, any>
): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'DELETE',
    params,
  });
}

// 上传文件
export function upload<T = any>(
  url: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<ApiResponse<T>> {
  const formData = new FormData();
  formData.append('file', file);
  
  return request<T>(url, {
    method: 'POST',
    data: formData,
    requestType: 'form',
    onUploadProgress: (e: ProgressEvent) => {
      if (onProgress && e.total > 0) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    },
  });
}

export default request;