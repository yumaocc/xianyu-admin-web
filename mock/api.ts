import type { Request, Response } from 'express';

// Mock数据
const mockProducts = [
  {
    id: '1',
    itemId: 'iphone14pro_001',
    title: 'iPhone 14 Pro 深空黑色 128GB',
    desc: '全新未拆封 iPhone 14 Pro，深空黑色，128GB存储容量，支持5G网络',
    price: 7999,
    soldPrice: 8999,
    category: '电子产品',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    hasCustomPrompts: true,
    syncStatus: 'synced',
  },
  {
    id: '2',
    itemId: 'keyboard_razer_001',
    title: 'Razer 雷蛇 猎魂光蛛 机械键盘',
    desc: '雷蛇光轴机械键盘，RGB背光，青轴手感',
    price: 899,
    soldPrice: 1299,
    category: '电子产品',
    status: 'active',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-16T00:00:00Z',
    hasCustomPrompts: false,
    syncStatus: 'pending',
  },
];

const mockStats = {
  totalProducts: 156,
  totalValue: 234567.89,
  aiConfigRate: 78.5,
  todaySyncCount: 23,
  activeProducts: 134,
  errorCount: 2,
};

export default {
  // 登录
  'POST /api/auth/login': (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === '123456') {
      res.json({
        success: true,
        data: {
          token: 'mock-token-123456',
          user: {
            id: '1',
            username: 'admin',
            email: 'admin@example.com',
            role: 'admin',
            createdAt: '2024-01-01T00:00:00Z',
          },
          expiresIn: 86400,
        },
      });
    } else {
      res.json({
        success: false,
        message: '用户名或密码错误',
      });
    }
  },

  // 获取当前用户
  'GET /api/auth/me': (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        createdAt: '2024-01-01T00:00:00Z',
      },
    });
  },

  // 获取系统统计
  'GET /api/system/stats': (req: Request, res: Response) => {
    res.json({
      success: true,
      data: mockStats,
    });
  },

  // 获取商品列表
  'GET /api/products': (req: Request, res: Response) => {
    const { page = 1, pageSize = 20 } = req.query;
    const start = (Number(page) - 1) * Number(pageSize);
    const end = start + Number(pageSize);

    res.json({
      success: true,
      data: {
        list: mockProducts.slice(start, end),
        total: mockProducts.length,
        page: Number(page),
        pageSize: Number(pageSize),
      },
    });
  },

  // 获取商品详情
  'GET /api/products/:id': (req: Request, res: Response) => {
    const { id } = req.params;
    const product = mockProducts.find(p => p.id === id);
    
    if (product) {
      res.json({
        success: true,
        data: product,
      });
    } else {
      res.json({
        success: false,
        message: '商品不存在',
      });
    }
  },

  // 创建商品
  'POST /api/products': (req: Request, res: Response) => {
    const newProduct = {
      id: String(Date.now()),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      hasCustomPrompts: false,
      syncStatus: 'pending',
      status: 'draft',
    };

    mockProducts.push(newProduct);

    res.json({
      success: true,
      data: newProduct,
    });
  },

  // 获取商品提示词
  'GET /api/products/:id/prompts': (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        price: '这是价格相关的提示词模板，当前商品价格是 {price} 元',
        tech: '这是技术相关的提示词模板，商品名称：{title}',
        default: '欢迎咨询商品 {title}，价格 {price} 元，{desc}',
        classify: '商品分类：{category}，适合对 {title} 感兴趣的用户',
      },
    });
  },

  // 更新提示词
  'PUT /api/products/:id/prompts': (req: Request, res: Response) => {
    setTimeout(() => {
      res.json({
        success: true,
        message: '提示词更新成功',
      });
    }, 500);
  },

  // 预览提示词
  'POST /api/prompts/preview': (req: Request, res: Response) => {
    const { content, productInfo } = req.body;
    
    let preview = content;
    const variables: Record<string, string> = {};

    // 简单的变量替换
    if (productInfo) {
      Object.entries(productInfo).forEach(([key, value]) => {
        const placeholder = `{${key}}`;
        if (content.includes(placeholder)) {
          preview = preview.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
          variables[key] = String(value);
        }
      });
    }

    res.json({
      success: true,
      data: {
        preview,
        variables,
        wordCount: preview.length,
      },
    });
  },

  // 获取同步状态
  'GET /api/sync/status': (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        id: 'sync_' + Date.now(),
        status: 'completed',
        progress: 100,
        message: '同步完成',
        startTime: new Date(Date.now() - 60000).toISOString(),
        endTime: new Date().toISOString(),
        affectedItems: 5,
      },
    });
  },

  // 触发手动同步
  'POST /api/sync/manual': (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        syncId: 'sync_' + Date.now(),
        message: '同步任务已启动',
      },
    });
  },

  // 获取自动同步设置
  'GET /api/sync/auto': (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        enabled: true,
        interval: 60,
        lastSync: new Date(Date.now() - 3600000).toISOString(),
        nextSync: new Date(Date.now() + 3600000).toISOString(),
      },
    });
  },

  // 更新自动同步设置
  'POST /api/sync/auto': (req: Request, res: Response) => {
    res.json({
      success: true,
      message: '自动同步设置已更新',
    });
  },

  // 测试连接
  'POST /api/sync/test-connection': (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        connected: true,
        latency: 45,
        version: '1.0.0',
        message: '连接正常',
      },
    });
  },

  // 获取通知
  'GET /api/system/notifications': (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        list: [],
        total: 0,
        unreadCount: 0,
      },
    });
  },
};