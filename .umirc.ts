import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {
    configProvider: {
      theme: {
        token: {
          colorPrimary: '#1890ff',
        },
      },
    },
  },
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: 'XianyuAutoAgent 管理后台',
    locale: false,
  },
  routes: [
    {
      path: '/login',
      component: './Login',
      layout: false,
    },
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      name: '控制台',
      path: '/dashboard',
      component: './Dashboard',
      icon: 'DashboardOutlined',
    },
    {
      name: '商品管理',
      path: '/products',
      icon: 'ShopOutlined',
      routes: [
        {
          name: '商品列表',
          path: '/products/list',
          component: './ProductList',
        },
        {
          name: '创建商品',
          path: '/products/create',
          component: './ProductCreate',
        },
        {
          name: '闲鱼同步',
          path: '/products/sync',
          component: './XianyuSync',
        },
        {
          name: '发货记录',
          path: '/products/delivery-records',
          component: './DeliveryRecords',
        },
        {
          name: '编辑商品',
          path: '/products/edit/:id',
          component: './ProductEdit',
          hideInMenu: true,
        },
      ],
    },
    {
      name: '系统设置',
      path: '/settings',
      icon: 'SettingOutlined',
      routes: [
        {
          name: '基础设置',
          path: '/settings/basic',
          component: './Settings',
        },
        {
          name: 'Cookie 配置',
          path: '/settings/cookies',
          component: './CookieConfig',
        },
      ],
    },
  ],
  npmClient: 'pnpm',
  mock: false, // 禁用 mock，使用真实后端
  proxy: {
    '/api': {
      target: 'http://localhost:5001',
      changeOrigin: true,
      pathRewrite: { '^/api': '/api' },
    },
    '/ws': {
      target: 'ws://localhost:5001',
      ws: true,
      changeOrigin: true,
    },
  },
  define: {
    API_BASE_URL: process.env.NODE_ENV === 'development'
      ? 'http://localhost:5001'
      : 'https://your-api-domain.com',
  },
  hash: true,
  outputPath: 'dist',
  publicPath: '/',
  targets: {
    chrome: 80,
  },
  lessLoader: {
    modifyVars: {
      '@primary-color': '#1890ff',
    },
  },
  headScripts: [
    {
      src: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js',
      async: true,
    },
  ],
  scripts: [],
  styles: [
    `
    .ant-layout-sider-collapsed .ant-menu-item-icon {
      font-size: 16px;
    }
    .monaco-editor-container {
      border: 1px solid #d9d9d9;
      border-radius: 6px;
      overflow: hidden;
    }
    .product-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: all 0.3s ease;
    }
    `,
  ],
});