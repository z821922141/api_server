
/**
 * 开发函数 用于生成路由配置文件
 * 参数 mainUrl - 项目主入口文件路径
 */
export async function dev(mainUrl: string) {
    await writeRouterConfig()
    /* 执行main主入口文件 */
    await import(mainUrl)
}
/**
 * 写入路由配置文件 
 */
async function writeRouterConfig() {
    const routerBaseUrl = "./routers"
    let list: Array<Deno.DirEntry> = []
    list = await getAllRouter(routerBaseUrl, list)
    let importStr = ""
    let routerStr = ""
    for (const [index, item] of list.entries()) {
        const module = `$${index}`
        importStr += `import * as ${module} from "${item.name}";\n`
        routerStr += `"${item.name}": ${module},\n    `
    }
    const routerConfig = `
/* 路由配置文件，请勿改动！！！ */ \n
${importStr}\nexport const routerConfig = {
  routers: {
    ${routerStr}
  },
};`
    const routerConfigUrl = `./router.config.ts`
    await Deno.writeTextFile(routerConfigUrl, routerConfig,);
}
/**
 * 获取routers 所以文件
 * 参数 dir - 目录
 * 参数 list - 当前路由文件列表
 * 返回 Deno.DirEntry - 获取的文件信息
 */
async function getAllRouter(dir: string, list: Array<Deno.DirEntry>): Promise<Deno.DirEntry[]> {
    const routerDir = Deno.readDir(dir)
    const tempList: Array<Deno.DirEntry> = []
    for await (const item of routerDir) {
        tempList.push(item)
    }
    tempList.sort((a, b) => `${a.name}`.localeCompare(`${b.name}`))
    tempList.sort((a, b) => Number(a.isDirectory) - Number(b.isDirectory))
    for (const item of tempList) {
        item.name = `${dir}/${item.name}`
        if (item.isDirectory === true) {
            await getAllRouter(item.name, list)
            continue
        }
        if (item.name.endsWith(".ts") === true) {
            list.push(item)
            continue
        }
    }
    return list
}