import { ConnInfo, ServeInit } from "./import.ts";
/**
 * 启动参数
 */
export type RunOptions = ServeInit & {
  /* 静态目录 */
  staticDir?: string;
  /* 路由前缀路径 */
  routePrefix?: string;
};
/**
 * 请求连接上下文
 */
export type Context = ConnInfo & {
  
};
/**
 * 路由配置
 */
export interface RouterConfig {
  /* 路由 */
  router: Record<string, string>;
}
