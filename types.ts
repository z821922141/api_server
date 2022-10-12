import { ServeInit } from "./import.ts";
import { Context } from "./context.ts";
import { LoggerBaseInfo } from "./logger.ts";
/**
 * 启动参数
 */
export type RunOptions = ServeInit & {
  /* 静态目录 */
  staticDir?: string;
  /* 路由前缀路径 */
  routePrefixPath?: string;
  /* 日志配置 */
  logger?: LoggerBaseInfo
};

/**
 * 路由配置
 */
export interface RouterConfig {
  /* 路由 */
  routers: Record<string, Handler>;
}

/**
 *  请求处理
 */
export interface Handler {
  /* GET请求 */
  GET?: (ctx: Context) => Response;
  /* POST请求 */
  POST?: (ctx: Context) => Response;
  /* PUT请求 */
  PUT?: (ctx: Context) => Response;
  /* DELETE请求 */
  DELETE?: (ctx: Context) => Response;
  /* HEAD请求 */
  HEAD?: (ctx: Context) => Response;
  /* PATCH请求 */
  PATCH?: (ctx: Context) => Response;
  /* OPTIONS请求 */
  OPTIONS?: (ctx: Context) => Response;
  /* MIDDLEWARE中间件 */
  MIDDLEWARE?: Array<(ctx: Context) => Response>;
}
/**
 * 请求方式
 */
export enum RequestMethod {
  /* GET请求 */
  GET = "GET",
  /* POST请求 */
  POST = "POST",
  /* PUT请求 */
  PUT = "PUT",
  /* DELETE请求 */
  DELETE = "DELETE",
  /* HEAD请求 */
  HEAD = "HEAD",
  /* PATCH请求 */
  PATCH = "PATCH",
  /* OPTIONS请求 */
  OPTIONS = "OPTIONS",
  /* MIDDLEWARE中间件 */
  MIDDLEWARE = "MIDDLEWARE",
}

/**
 * 相应json
 */
export interface ResponseJson {
  /* 状态码 */
  code: number;
  /* 数据 */
  data: Record<string, unknown> | null;
  /* 提示*/
  message: string;
}
/**
 * 当前环境
 */
export enum Env {
  /* 开发 */
  DEV = "dev",
  /* 测试 */
  TEST = "test",
  /* 正式发布 */
  RELEASE = "release",
}