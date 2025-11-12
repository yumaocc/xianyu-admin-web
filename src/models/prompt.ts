import { useState, useCallback } from 'react';
import { message } from 'antd';
import type { PromptType, ProductPrompts, PromptTemplate } from '@/types';
import * as promptService from '@/services/prompt';

export interface PromptModel {
  // 状态
  prompts: ProductPrompts | null;
  templates: PromptTemplate[];
  currentTemplate: PromptTemplate | null;
  loading: boolean;
  previewResult: {
    preview: string;
    variables: Record<string, string>;
    wordCount: number;
  } | null;
  
  // 操作
  fetchPrompts: (productId: string) => Promise<void>;
  updatePrompt: (productId: string, type: PromptType, content: string) => Promise<void>;
  batchUpdatePrompts: (productId: string, prompts: Partial<ProductPrompts>) => Promise<void>;
  previewPrompt: (type: PromptType, content: string, productInfo: any) => Promise<void>;
  fetchTemplates: (type?: PromptType) => Promise<void>;
  createTemplate: (data: any) => Promise<void>;
  updateTemplate: (id: string, data: any) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  applyTemplate: (productId: string, templateId: string, type: PromptType) => Promise<void>;
  validatePrompt: (content: string, type: PromptType) => Promise<any>;
  clearPreview: () => void;
  reset: () => void;
}

export default function usePromptModel(): PromptModel {
  const [prompts, setPrompts] = useState<ProductPrompts | null>(null);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<PromptTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState<any>(null);

  // 获取商品提示词
  const fetchPrompts = useCallback(async (productId: string) => {
    setLoading(true);
    try {
      const response = await promptService.getProductPrompts(productId);
      if (response.success && response.data) {
        setPrompts(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
      message.error('获取提示词失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 更新单个提示词
  const updatePrompt = useCallback(async (productId: string, type: PromptType, content: string) => {
    setLoading(true);
    try {
      const response = await promptService.updateProductPrompt(productId, type, content);
      if (response.success) {
        message.success('更新提示词成功');
        // 更新本地状态
        setPrompts(prev => prev ? { ...prev, [type]: content } : null);
      }
    } catch (error) {
      console.error('Failed to update prompt:', error);
      message.error('更新提示词失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 批量更新提示词
  const batchUpdatePrompts = useCallback(async (productId: string, newPrompts: Partial<ProductPrompts>) => {
    setLoading(true);
    try {
      const response = await promptService.batchUpdateProductPrompts(productId, newPrompts);
      if (response.success) {
        message.success('批量更新提示词成功');
        setPrompts(prev => prev ? { ...prev, ...newPrompts } : null);
      }
    } catch (error) {
      console.error('Failed to batch update prompts:', error);
      message.error('批量更新提示词失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 预览提示词
  const previewPrompt = useCallback(async (type: PromptType, content: string, productInfo: any) => {
    setLoading(true);
    try {
      const response = await promptService.previewPrompt(type, content, productInfo);
      if (response.success && response.data) {
        setPreviewResult(response.data);
      }
    } catch (error) {
      console.error('Failed to preview prompt:', error);
      message.error('预览提示词失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取模板列表
  const fetchTemplates = useCallback(async (type?: PromptType) => {
    setLoading(true);
    try {
      const response = await promptService.getPromptTemplates(type);
      if (response.success && response.data) {
        setTemplates(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      message.error('获取模板列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 创建模板
  const createTemplate = useCallback(async (data: any) => {
    setLoading(true);
    try {
      const response = await promptService.createPromptTemplate(data);
      if (response.success && response.data) {
        message.success('创建模板成功');
        setTemplates(prev => [...prev, response.data]);
      }
    } catch (error) {
      console.error('Failed to create template:', error);
      message.error('创建模板失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 更新模板
  const updateTemplate = useCallback(async (id: string, data: any) => {
    setLoading(true);
    try {
      const response = await promptService.updatePromptTemplate(id, data);
      if (response.success && response.data) {
        message.success('更新模板成功');
        setTemplates(prev => prev.map(t => t.id === id ? response.data : t));
      }
    } catch (error) {
      console.error('Failed to update template:', error);
      message.error('更新模板失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 删除模板
  const deleteTemplate = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await promptService.deletePromptTemplate(id);
      if (response.success) {
        message.success('删除模板成功');
        setTemplates(prev => prev.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
      message.error('删除模板失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 应用模板
  const applyTemplate = useCallback(async (productId: string, templateId: string, type: PromptType) => {
    setLoading(true);
    try {
      const response = await promptService.applyTemplateToProduct(productId, templateId, type);
      if (response.success) {
        message.success('应用模板成功');
        // 重新获取提示词
        await fetchPrompts(productId);
      }
    } catch (error) {
      console.error('Failed to apply template:', error);
      message.error('应用模板失败');
    } finally {
      setLoading(false);
    }
  }, [fetchPrompts]);

  // 验证提示词
  const validatePrompt = useCallback(async (content: string, type: PromptType) => {
    try {
      const response = await promptService.validatePrompt(content, type);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.error('Failed to validate prompt:', error);
      message.error('验证提示词失败');
    }
    return null;
  }, []);

  // 清除预览结果
  const clearPreview = useCallback(() => {
    setPreviewResult(null);
  }, []);

  // 重置状态
  const reset = useCallback(() => {
    setPrompts(null);
    setTemplates([]);
    setCurrentTemplate(null);
    setPreviewResult(null);
  }, []);

  return {
    // 状态
    prompts,
    templates,
    currentTemplate,
    loading,
    previewResult,
    
    // 操作
    fetchPrompts,
    updatePrompt,
    batchUpdatePrompts,
    previewPrompt,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    applyTemplate,
    validatePrompt,
    clearPreview,
    reset,
  };
}