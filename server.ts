import { Global, RouterConfig, RunOptions } from "./types.ts";
import { argsParse, bold, green, serve } from "./import.ts";
import { Context } from "./context.ts";
import { log, Logger } from "./logger.ts";
/* 全局变量 */
let GLOBAL: Global;
/**
 * 获取GLOBAL
 */
export function getGlobal() {
  return GLOBAL;
}
/**
 * 启动服务
 * 参数 routerConfig - 路由配置
 * 参数 options - 服务启动参数
 */
export async function run(
  routerConfig: RouterConfig,
  fn?: () => Promise<void> | void,
  options?: RunOptions,
) {
  /* 初始启动参数 */
  const nowOptions: RunOptions = {
    port: options?.port ?? 10000,
    hostname: options?.hostname ?? "localhost",
    staticDir: options?.staticDir ?? "/statics",
    routePrefixPath: options?.routePrefixPath ?? "",
    onListen: options?.onListen ?? function ({ port, hostname }) {
      const url = `http://${hostname}:${port}`;
      console.log(`服务启动成功：${green(bold(url))}`);
    },
    logger: Logger.baseInfoInit(options?.logger),
  };
  /* 初始化GLOBAL 全局变量 */
  GLOBAL = {
    args: argsParse(Deno.args),
    runOption: nowOptions,
  };
  /* 路由初始化 */
  Context.routerInit(routerConfig, nowOptions);
  /* 冻结全局变量GLOBAL */
  Object.freeze(GLOBAL);
  /* 执行函数 */
  fn && await fn();
  await serve(Context.handler, nowOptions);
}
