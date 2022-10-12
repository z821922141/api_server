import { run, GLOBAL } from "$api/server.ts";
import { routerConfig } from "./router.config.ts";

await run(routerConfig);

