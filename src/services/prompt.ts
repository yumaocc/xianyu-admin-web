import { get, post, put } from './request';
import type { 
  PromptType, 
  ProductPrompts, 
  ApiResponse, 
  PromptTemplate,
  Product 
} from '@/types';

// 获取商品提示词
export function getProductPrompts(productId: string): Promise<ApiResponse<ProductPrompts>> {
  return get(`/api/products/${productId}/prompts`);
}

// 更新商品提示词
export function updateProductPrompt(
  productId: string,
  type: PromptType,
  content: string
): Promise<ApiResponse<void>> {
  return put(`/api/products/${productId}/prompts`, {
    type,
    content,
  });
}

// 批量更新商品提示词
export function batchUpdateProductPrompts(
  productId: string,
  prompts: Partial<ProductPrompts>
): Promise<ApiResponse<void>> {
  return put(`/api/products/${productId}/prompts/batch`, prompts);
}

// 预览提示词效果
export function previewPrompt(
  type: PromptType,
  content: string,
  productInfo: Pick<Product, 'title' | 'desc' | 'price' | 'itemId'>
): Promise<ApiResponse<{
  preview: string;
  variables: Record<string, string>;
  wordCount: number;
}>> {
  return post('/api/prompts/preview', {
    type,
    content,
    productInfo,
  });
}

// 获取提示词模板列表
export function getPromptTemplates(type?: PromptType): Promise<ApiResponse<PromptTemplate[]>> {
  return get('/api/prompts/templates', { type });
}

// 创建提示词模板
export function createPromptTemplate(data: {
  name: string;
  type: PromptType;
  content: string;
  description?: string;
}): Promise<ApiResponse<PromptTemplate>> {
  return post('/api/prompts/templates', data);
}

// 更新提示词模板
export function updatePromptTemplate(
  id: string,
  data: Partial<PromptTemplate>
): Promise<ApiResponse<PromptTemplate>> {
  return put(`/api/prompts/templates/${id}`, data);
}

// 删除提示词模板
export function deletePromptTemplate(id: string): Promise<ApiResponse<void>> {
  return del(`/api/prompts/templates/${id}`);
}

// 应用模板到商品
export function applyTemplateToProduct(
  productId: string,
  templateId: string,
  type: PromptType
): Promise<ApiResponse<void>> {
  return post(`/api/products/${productId}/apply-template`, {
    templateId,
    type,
  });
}

// 批量应用模板
export function batchApplyTemplate(
  productIds: string[],
  templateId: string,
  type: PromptType
): Promise<ApiResponse<{
  success: number;
  failed: number;
  errors?: string[];
}>> {
  return post('/api/prompts/batch-apply-template', {
    productIds,
    templateId,
    type,
  });
}

// 获取提示词变量列表
export function getPromptVariables(): Promise<ApiResponse<{
  name: string;
  key: string;
  description: string;
  example: string;
}[]>> {
  return get('/api/prompts/variables');
}

// 验证提示词语法
export function validatePrompt(
  content: string,
  type: PromptType
): Promise<ApiResponse<{
  valid: boolean;
  errors?: string[];
  warnings?: string[];
  suggestions?: string[];
}>> {
  return post('/api/prompts/validate', {
    content,
    type,
  });
}

// 获取提示词使用统计
export function getPromptStats(): Promise<ApiResponse<{
  totalPrompts: number;
  customPrompts: number;
  templateUsage: Record<string, number>;
  typeDistribution: Record<PromptType, number>;
}>> {
  return get('/api/prompts/stats');
}

// 导出提示词
export function exportPrompts(
  productIds?: string[],
  types?: PromptType[]
): Promise<ApiResponse<{ downloadUrl: string }>> {
  return post('/api/prompts/export', {
    productIds,
    types,
  });
}

// 导入提示词
export function importPrompts(file: File): Promise<ApiResponse<{
  success: number;
  failed: number;
  errors?: string[];
}>> {
  const formData = new FormData();
  formData.append('file', file);
  
  return post('/api/prompts/import', formData);
}