import { useState, useCallback } from 'react';
import { message } from 'antd';
import type { Product, PaginationParams, PaginatedResponse } from '@/types';
import * as productService from '@/services/product';

export interface ProductModel {
  // 状态
  list: Product[];
  current: Product | null;
  loading: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  selectedIds: string[];
  
  // 筛选和搜索
  filters: {
    keyword?: string;
    category?: string;
    status?: string;
    priceRange?: [number, number];
  };
  
  // 操作
  fetchList: (params?: Partial<PaginationParams>) => Promise<void>;
  fetchProduct: (id: string) => Promise<void>;
  createProduct: (data: any) => Promise<Product | null>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  batchDelete: (ids: string[]) => Promise<void>;
  batchUpdateStatus: (ids: string[], status: Product['status']) => Promise<void>;
  setSelected: (ids: string[]) => void;
  setFilters: (filters: any) => void;
  clearCurrent: () => void;
  reset: () => void;
}

export default function useProductModel(): ProductModel {
  const [list, setList] = useState<Product[]>([]);
  const [current, setCurrent] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState<any>({});

  // 获取商品列表
  const fetchList = useCallback(async (params?: Partial<PaginationParams>) => {
    setLoading(true);
    try {
      const requestParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...filters,
        ...params,
      };
      
      const response = await productService.getProductList(requestParams);
      
      if (response.success && response.data) {
        setList(response.data.list);
        setPagination({
          current: response.data.page,
          pageSize: response.data.pageSize,
          total: response.data.total,
        });
      }
    } catch (error) {
      console.error('Failed to fetch product list:', error);
      message.error('获取商品列表失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, filters]);

  // 获取商品详情
  const fetchProduct = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await productService.getProduct(id);
      if (response.success && response.data) {
        setCurrent(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      message.error('获取商品详情失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 创建商品
  const createProduct = useCallback(async (data: any): Promise<Product | null> => {
    setLoading(true);
    try {
      const response = await productService.createProduct(data);
      if (response.success && response.data) {
        message.success('创建商品成功');
        await fetchList(); // 刷新列表
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to create product:', error);
      message.error('创建商品失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchList]);

  // 更新商品
  const updateProduct = useCallback(async (id: string, data: Partial<Product>) => {
    setLoading(true);
    try {
      const response = await productService.updateProduct(id, data);
      if (response.success && response.data) {
        message.success('更新商品成功');
        setCurrent(response.data);
        await fetchList(); // 刷新列表
      }
    } catch (error) {
      console.error('Failed to update product:', error);
      message.error('更新商品失败');
    } finally {
      setLoading(false);
    }
  }, [fetchList]);

  // 删除商品
  const deleteProduct = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await productService.deleteProduct(id);
      if (response.success) {
        message.success('删除商品成功');
        await fetchList(); // 刷新列表
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      message.error('删除商品失败');
    } finally {
      setLoading(false);
    }
  }, [fetchList]);

  // 批量删除
  const batchDelete = useCallback(async (ids: string[]) => {
    setLoading(true);
    try {
      const response = await productService.batchDeleteProducts(ids);
      if (response.success) {
        message.success(`成功删除 ${ids.length} 个商品`);
        setSelectedIds([]);
        await fetchList();
      }
    } catch (error) {
      console.error('Failed to batch delete products:', error);
      message.error('批量删除失败');
    } finally {
      setLoading(false);
    }
  }, [fetchList]);

  // 批量更新状态
  const batchUpdateStatus = useCallback(async (ids: string[], status: Product['status']) => {
    setLoading(true);
    try {
      const response = await productService.batchUpdateProductStatus(ids, status);
      if (response.success) {
        message.success(`成功更新 ${ids.length} 个商品状态`);
        setSelectedIds([]);
        await fetchList();
      }
    } catch (error) {
      console.error('Failed to batch update status:', error);
      message.error('批量更新状态失败');
    } finally {
      setLoading(false);
    }
  }, [fetchList]);

  // 设置选中项
  const setSelected = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  // 设置筛选条件
  const setFiltersCallback = useCallback((newFilters: any) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current: 1 })); // 重置页码
  }, []);

  // 清除当前商品
  const clearCurrent = useCallback(() => {
    setCurrent(null);
  }, []);

  // 重置状态
  const reset = useCallback(() => {
    setList([]);
    setCurrent(null);
    setSelectedIds([]);
    setFilters({});
    setPagination({
      current: 1,
      pageSize: 20,
      total: 0,
    });
  }, []);

  return {
    // 状态
    list,
    current,
    loading,
    pagination,
    selectedIds,
    filters,
    
    // 操作
    fetchList,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    batchDelete,
    batchUpdateStatus,
    setSelected,
    setFilters: setFiltersCallback,
    clearCurrent,
    reset,
  };
}