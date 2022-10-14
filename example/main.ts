
import { run } from "$api/server.ts";
import { routerConfig } from "./router.config.ts";

/**
 * 初始函数
 */
async function init() {
   
}

await run(routerConfig, init,{routePrefixPath: "/v1/api",});
