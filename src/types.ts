import { ServeInit } from "./import.ts";
import { Context } from "./context.ts";

/**
 * 全局变量
 */
export interface Global {
  /* 服务运行参数 */
  args: Record<string, unknown>;
  /* 启动参数 */
  runOption: RunOptions;
}
/**
 * 启动参数
 */
export type RunOptions = ServeInit & {
  /* 静态目录 */
  staticDir?: string;
  /* 路由前缀路径 */
  routePrefixPath?: string;
  /* 日志配置 */
  logger?: LoggerBaseInfo;
};

/**
 * 路由配置
 */
export interface RouterConfig {
  /* 路由 */
  routers: Record<string, unknown>;
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
export interface SendJson {
  /* 状态码 */
  code?: number;
  /* 数据 */
  data?: Record<string, unknown> | null;
  /* 提示*/
  message?: string;
  /* 返回时间 */
  time?: string;
  /* 日志 */
  log?: LogWriteInfo
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
/**
 * 日志等级
 */
export enum LogLevel {
  /* 正常信息 */
  INFO = "info",
  /* 错误 */
  ERROR = "error",
}
/**
 *  日志收集器基础信息
 */
export interface LoggerBaseInfo {
  /* 是否启动 默认：true */
  readonly run?: boolean;
  /* 目录 */
  readonly dir?: string;
  /* 单个日志文件最大大小 默认：10MB 1024*1024*10 */
  readonly fileSize?: number;
}
/**
 * 日志方法
 */
export interface Log {
  /* 正常信息 */
  info: (text: string) => void;
  /* 错误信息 */
  error: (text: string) => void;
}
/**
 * 日志写入的信息 
 */
export interface LogWriteInfo {
  /* 写入的json */
  json?: Record<string, unknown>
  /* 写入的基础json */
  baseJson?: Record<string, unknown>
  /* 错误信息 */
  error?: Error
}