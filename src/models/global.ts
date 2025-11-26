import { useState, useCallback, useEffect } from "react";
import { message } from "antd";
import type { User, SystemStats, NotificationMessage } from "@/types";
import * as authService from "@/services/auth";
import * as systemService from "@/services/system";
import { authStorage } from "@/utils/storage";

export interface GlobalModel {
  // 状态
  user: User | null;
  authenticated: boolean;
  stats: SystemStats | null;
  notifications: NotificationMessage[];
  unreadCount: number;
  loading: boolean;
  sidebarCollapsed: boolean;
  theme: "light" | "dark";

  // WebSocket 连接
  wsConnected: boolean;

  // 操作
  login: (credentials: any) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  toggleSidebar: () => void;
  toggleTheme: () => void;
  // initWebSocket: () => void;
  // closeWebSocket: () => void;
  reset: () => void;
}

let ws: WebSocket | null = null;

export default function useGlobalModel(): GlobalModel {
  const [user, setUser] = useState<User | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [wsConnected, setWsConnected] = useState(false);

  // 登录
  const login = useCallback(async (credentials: any): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      if (response.success && response.data) {
        const { token, user: userData } = response.data;
        authStorage.setToken(token);
        authStorage.setUserInfo(userData);
        setUser(userData);
        setAuthenticated(true);
        message.success("登录成功");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      message.error("登录失败");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // 退出登录
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      authStorage.clear();
      setUser(null);
      setAuthenticated(false);
      // closeWebSocket();
      message.success("已退出登录");
    }
  }, []);

  // 获取当前用户
  const fetchCurrentUser = useCallback(async () => {
    const token = authStorage.getToken();
    if (!token) {
      setAuthenticated(false);
      return;
    }

    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
        authStorage.setUserInfo(response.data);
        setAuthenticated(true);
      } else {
        // Token 无效，清除并跳转登录
        authStorage.clear();
        setAuthenticated(false);
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      authStorage.clear();
      setAuthenticated(false);
    }
  }, []);

  // 获取统计数据
  const fetchStats = useCallback(async () => {
    try {
      const response = await systemService.getSystemStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, []);

  // 获取通知
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await systemService.getNotifications({
        page: 1,
        pageSize: 50,
      });
      if (response.success && response.data) {
        setNotifications(response.data.list);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, []);

  // 标记通知已读
  const markNotificationRead = useCallback(async (id: string) => {
    try {
      const response = await systemService.markNotificationRead(id);
      if (response.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark notification read:", error);
    }
  }, []);

  // 切换侧边栏
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
    localStorage.setItem("sidebar_collapsed", (!sidebarCollapsed).toString());
  }, [sidebarCollapsed]);

  // 切换主题
  const toggleTheme = useCallback(() => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  }, [theme]);

  // 初始化 WebSocket (暂时禁用)
  // const initWebSocket = useCallback(() => {
  //   if (ws && ws.readyState === WebSocket.OPEN) {
  //     return;
  //   }

  //   const wsUrl = `ws://localhost:5000/ws`;
  //   ws = new WebSocket(wsUrl);

  //   ws.onopen = () => {
  //     console.log('WebSocket connected');
  //     setWsConnected(true);
  //   };

  //   ws.onmessage = (event) => {
  //     try {
  //       const message = JSON.parse(event.data);
  //
  //       switch (message.type) {
  //         case 'stats_update':
  //           setStats(message.data);
  //           break;
  //         case 'notification':
  //           setNotifications(prev => [message.data, ...prev]);
  //           if (!message.data.read) {
  //             setUnreadCount(prev => prev + 1);
  //           }
  //           break;
  //         case 'sync_status':
  //           // 可以在这里处理同步状态更新
  //           break;
  //         case 'error':
  //           message.error(message.data.message || '发生错误');
  //           break;
  //         default:
  //           console.log('Unknown WebSocket message:', message);
  //       }
  //     } catch (error) {
  //       console.error('Failed to parse WebSocket message:', error);
  //     }
  //   };

  //   ws.onclose = () => {
  //     console.log('WebSocket disconnected');
  //     setWsConnected(false);
  //
  //     // 自动重连
  //     if (authenticated) {
  //       setTimeout(() => {
  //         initWebSocket();
  //       }, 3000);
  //     }
  //   };

  //   ws.onerror = (error) => {
  //     console.error('WebSocket error:', error);
  //     setWsConnected(false);
  //   };
  // }, [authenticated]);

  // // 关闭 WebSocket
  // const closeWebSocket = useCallback(() => {
  //   if (ws) {
  //     ws.close();
  //     ws = null;
  //     setWsConnected(false);
  //   }
  // }, []);

  // 重置状态
  const reset = useCallback(() => {
    setUser(null);
    setAuthenticated(false);
    setStats(null);
    setNotifications([]);
    setUnreadCount(0);
    // closeWebSocket();
  }, []);

  // 初始化时从本地存储恢复状态
  useEffect(() => {
    // 恢复侧边栏状态
    const savedCollapsed = localStorage.getItem("sidebar_collapsed");
    if (savedCollapsed) {
      setSidebarCollapsed(savedCollapsed === "true");
    }

    // 恢复主题
    const savedTheme = localStorage.getItem("theme") as "light" | "dark";
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }

    // 检查登录状态
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // 当认证状态变化时，处理 WebSocket 连接 (暂时禁用 WebSocket)
  useEffect(() => {
    if (authenticated) {
      // initWebSocket();  // 暂时禁用
      fetchStats();
      fetchNotifications();
    } else {
      // closeWebSocket();  // 暂时禁用
    }
  }, [authenticated, fetchStats, fetchNotifications]);

  return {
    // 状态
    user,
    authenticated,
    stats,
    notifications,
    unreadCount,
    loading,
    sidebarCollapsed,
    theme,
    wsConnected,

    // 操作
    login,
    logout,
    fetchCurrentUser,
    fetchStats,
    fetchNotifications,
    markNotificationRead,
    toggleSidebar,
    toggleTheme,
    // initWebSocket,
    // closeWebSocket,
    reset,
  };
}
