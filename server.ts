import { RequestMethod, RouterConfig, RunOptions } from "./types.ts";
import { bold, ConnInfo, green, serve } from "./import.ts";
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
  options.hostname ??= "localhost";
  options.staticDir ??= "/statics";
  options.routePrefixPath ??= "";
  options.onListen ??= function ({ port, hostname }) {
    const url = `http://${hostname}:${port}`;
    console.log(`服务启动成功：${green(bold(url))}`);
  };
  Context.routerInit(routerConfig, options);
  await serve(Context.handler, options);
}
