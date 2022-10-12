/* 项目名称 */
let projectName = "myProject";
/* 用户输入项目名 */
const name = prompt("项目名称：");
if (name !== null) {
  projectName = name;
}
/* 用户确认是否需要vscode开发配置 */
const vsCode = confirm("是否需要vsCode开发配置？");
/* 创建项目目录 */
await Deno.mkdir(projectName);
/* 创建vscode开发配置文件 */
if (vsCode === true) {
  const vaCodeDir = `./${projectName}/.vscode`;
  await Deno.mkdir(vaCodeDir);
  const extensionsJson = `
{
  "recommendations": [
    "denoland.vscode-deno",
    "sastan.twind-intellisense",
  ],
}`;
  await Deno.writeTextFile(
    `${vaCodeDir}/extensions.json`,
    extensionsJson,
  );
  const settingsJson = `
{
  "deno.enable": true,
  "deno.lint": true,
  "editor.defaultFormatter": "denoland.vscode-deno"
}`;
  await Deno.writeTextFile(
    `${vaCodeDir}/settings.json`,
    settingsJson,
  );
}
/* 生成配置deno.json、import_map.json文件 */
const denoJson = `
{
  "tasks": {
      "dev": "deno run -A --watch=./routers --check main.ts --env=dev",
      "test": "deno compile -A --import-map=import_map.json main.ts --env=test",
      "release": "deno compile -A --import-map=import_map.json main.ts --env=release"
  },
  "importMap": "./import_map.json"
}`;
await Deno.writeTextFile(
  `${projectName}/deno.json`,
  denoJson,
);
const importMapJson = `
{
  "imports": {
      "$/":"./"
  }
}`;
await Deno.writeTextFile(
  `${projectName}/import_map.json`,
  importMapJson,
);
/* 创建路由目录 */
await Deno.mkdir(`./${projectName}/routers`);
/* 创建静态目录 */
await Deno.mkdir(`./${projectName}/statics`);
/* 创建main主入口文件 */
const main = `
import { run } from "$api/server.ts";
import { routerConfig } from "./router.config.ts";

/**
 * 初始函数
 */
async function init() {

}

await run(routerConfig, init);
`;
await Deno.writeTextFile(
  `${projectName}/main.ts`,
  main,
);
/* 创建dev开发入口文件 */
const dev = `
import { dev } from "$api/dev.ts";

await dev(import.meta.resolve("./main.ts"))
`;
await Deno.writeTextFile(
  `${projectName}/dev.ts`,
  dev,
);
