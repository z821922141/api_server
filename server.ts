import { RouterConfig, RunOptions } from "./types.ts";
import { ConnInfo, serve } from "./import.ts";
/**
 * 启动服务
 * 参数 routerConfig - 路由配置
 * 参数 options - 服务启动参数
 */
export async function run(
  routerConfig: RouterConfig,
  options: RunOptions = {},
) {
  const watcher = Deno.watchFs("./routers");
  for await (const event of watcher) {
    console.log(">>>> event", event);
    // { kind: "create", paths: [ "/foo.txt" ] }
 }
  console.log(watcher)
  options.port ??= 10000;
  await serve(handler, options);
}

/**
 * 请求处理函数
 */
export async function handler(request: Request, connInfo: ConnInfo) {
  console.log(request.method);
  console.log(new URL(request.url));
  console.log(request.mode);
  return new Response("test");
}
