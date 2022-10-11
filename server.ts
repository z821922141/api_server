import { RouterConfig, RunOptions, RequestMethod } from "./types.ts";
import { ConnInfo, serve } from "./import.ts";
import { Context } from "./context.ts";
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
  options.staticDir ??= "/statics";
  options.routePrefixPath ??= "";
  Context.routerInit(routerConfig, options)
  await serve(Context.handler, options);
}


