import { run } from "$api/server.ts";
import { routerConfig } from "./router.config.ts";

await run(routerConfig, { port: 8000 });
