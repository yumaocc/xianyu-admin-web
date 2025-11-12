import { RunTimeLayoutConfig } from '@umijs/max';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { authStorage } from './utils/storage';

// 全局初始状态
export async function getInitialState(): Promise<{
  currentUser?: any;
  token?: string;
}> {
  const token = authStorage.getToken();
  const userInfo = authStorage.getUserInfo();
  
  return {
    currentUser: userInfo,
    token,
  };
}

// 布局配置
export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  return {
    title: 'XianyuAutoAgent 管理端',
    logo: '🛒',
    menu: {
      locale: false,
    },
    rightContentRender: false, // 修复类型错误
    onPageChange: (location) => {
      const token = authStorage.getToken();
      const currentPath = location?.pathname || window.location.pathname;
      
      // 如果没有登录且不在登录页，跳转到登录页
      if (!token && currentPath !== '/login') {
        // 使用replace而不是href，避免路由冲突
        setTimeout(() => {
          window.location.replace('/login');
        }, 0);
      }
    },
  };
};

// 全局配置
export function rootContainer(container: React.ReactElement) {
  return (
    <ConfigProvider locale={zhCN}>
      {container}
    </ConfigProvider>
  );
}