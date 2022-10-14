
import { dev } from "$api/dev.ts";

await dev(import.meta.resolve("./main.ts"))
