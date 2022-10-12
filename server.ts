import { RequestMethod, RouterConfig, RunOptions } from "./types.ts";
import { bold, ConnInfo, green, serve, parse } from "./import.ts";
import { Context } from "./context.ts";
import { Logger, log } from "./logger.ts"
/* 全局变量 */
export const GLOBAL: Record<string, unknown> = parse(Deno.args)
/**
 * 获取GLOBAL 
 */
export function getGlobal() {
  return GLOBAL
}
/**
 * 启动服务
 * 参数 routerConfig - 路由配置
 * 参数 options - 服务启动参数
 */
export async function run(
  routerConfig: RouterConfig,
  options: RunOptions = {},
) {
  options.port ??= 10000;
  options.hostname ??= "localhost";
  options.staticDir ??= "/statics";
  options.routePrefixPath ??= "";
  options.onListen ??= function ({ port, hostname }) {
    const url = `http://${hostname}:${port}`;
    console.log(`服务启动成功：${green(bold(url))}`);
  };
  GLOBAL.runOptions = options
  /* 路由初始化 */
  Context.routerInit(routerConfig, options);
  /* 日志初始化 */
  options.logger = Logger.baseInfoInit(options.logger)
  log.error("test")
  /* 冻结全局变量GLOBAL */
  Object.freeze(GLOBAL)
  await serve(Context.handler, options);
}
