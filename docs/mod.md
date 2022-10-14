## 1 CLI生成项目的目录结构介绍

```
.
├── routers
├── statics
├── deno.json
├── dev.ts
├── import_map.json
└── router.config.ts
```

### 1.1 routers

是约定的放置路由文件以及中间件文件的目录，不能更改

### 1.2 statics

是默认生成的放置静态文件的目录，可通过启动函数参数指向自定义目录

### 1.3 deno.json

项目的配置文件

```
{
  "tasks": {
      "dev": "deno run -A --watch=./routers --check dev.ts --env=dev",
      "test": "deno compile -A --import-map=import_map.json main.ts --env=test",
      "release": "deno compile -A --import-map=import_map.json main.ts --env=release"
  },
  "importMap": "./import_map.json"
}
```

#### `tasks` deno任务

```
deno task dev
```

开发下的启动命令，主要是运行dev开发文件动态配置路由以及中间件router.config.ts，以及设定一个env环境为dev

```
deno task test
```

打包整个项目,env环境为test的可执行文件

```
deno task release
```

打包整个项目,env环境为release的可执行文件

#### `importMap` 需要用到的库的导入映射文件

### 1.4 dev.ts

开发环境下主要用到的文件，请勿改动，用于动态配置routers目录下的路由文件以及中间件文件

### 1.5 import_map.json

库的映射文件，需要引入新的库可以在该文件添加

### 1.6 main.ts

项目入口文件

### 1.7 router.config.ts

动态生成的路由和中间件配置文件，请勿改动

## 2 内置函数接口等

### 2.1 run

服务启动函数，开发者只需要专注`options`:[RunOptions](../src/types.ts)启动参数

```
/**
 * 启动服务
 * 参数 routerConfig - 路由配置
 * 参数 fn - 初始函数
 * 参数 options - 服务启动参数
 */
export async function run(routerConfig: RouterConfig, fn?: () => Promise<void> | void, options?: RunOptions)
```

示例

```
async function init() {
    console.log(1)
}

await run(routerConfig, init,{port:8080});
```

### 2.2 路由

路由都需要创建再routers目录下面，路由路径为子目录路径+文件名

示例

```
.
├── routers
        ├── api.ts
```

在 routers目录下创建api.ts文件，就是创建一个api 路由

```
// api.ts

import { Context } from "$api/context.ts";

export function GET(ctx:Context){
    console.log(ctx.request)
    return ctx.sendSuccess()
}
```

上面示例创建了一个get请求的api 返回一个Response，`ctx`:[Context](../src/context.ts)为请求上下文

访问 如：http://localhost:10000/api 可获取到返回信息

支持创建 `GET`、`POST`、`PUT`、`DELETE`、`HEAD`、`PATCH`、`OPTIONS`
，函数名就是请求方式，需要为大写，切export导出该函数，每个路由都支持写多个请求方式

### 2.2 中间件

中间件都需要创建再routers目录下面，固定文件名`_middleware.ts`，每个子目录下路由都会优先执行当前目录下的中间件

示例

```
.
├── routers
        ├── _middleware.ts
        ├── api.ts
```

```
//_middleware.ts

import { Context } from "$api/context.ts";

interface Test {
    str: string
}

function minddleware1(ctx: Context) {
    const test = {
        str: "测试"
    }
    ctx.setState<Test>("test", test)
    return ctx.next()
}
function minddleware2(ctx: Context) {
    console.log(ctx.getState<Test>("test"))
    return ctx.next()
}

export const MIDDLEWARE = [minddleware1, minddleware2]
```

上面示例创建了一个中间件文件，写入了两个中间件函数，函数1创建了一个数据，函数2获取到该数据，请求上下文的`next`函数会依次执行后面的函数

访问 如：http://localhost:10000/api 会先执行这两个中间件

中间件文件需要导出一个名为`MIDDLEWARE` 类型数组的常量或变量

## 3 RunOptions 启动参数详解

```
{
    port: 10000,
    hostname: "localhost",
    staticDir: "/statics",
    routePrefixPath: "",
    logger: {
        run: true,
        dir: undefined,
        fileSize: 1024 * 1024 * 10,
    }
}
```

`port` 服务启动端口，默认：10000

`hostname` 服务主机名称，默认：localhost

`staticDir` 静态文件目录，存放静态文件的目录，注意设置该目录后顶层路由不要使用该目录名，默认：/statics

`routePrefixPath`
路由路径前缀，如设置值为"/v1/api"，所有路由访问路径前面都会加上该路径，http://localhost:10000/v1/api/api， 默认：空

`logger` [LoggerBaseInfo](../src/types.ts) 日志基础配置

### 3.1 LoggerBaseInfo 日志基础配置详解

```
{
    run: true,
    dir: undefined,
    fileSize: 1024 * 1024 * 10,
}
```

`run` 是否启动日志，该参数只影响终端控制台打印的请求基本日志，非env开发环境该参数不生效，默认：true

`dir` 记录日志的目录，该参数设置了值之后会把日志写入到该目录下，默认：undefined

`fileSize` 单个日志文件的大小，单位字节（B），默认：1024 * 1024 * 10 (10MB)

## 4 Context 请求上下文详解

### 4.1 主要成员常量

`request` 请求资源信息

`connInfo` 请求的连接信息

`requestTime` 请求时间

`state` 存储数据，需要使用成员函数setState设置，以及getState获取

### 4.2 主要成员函数

`next` 中间件需要执行该函数才可以执行后面的其他中间件或路由函数

`setState` 设置state的泛型方法，setState<T>(key, value)

`getState` 获取state的泛型方法，getState<T>(key)

`send` `sendSuccess` `sendFail` `sendNoFound` 响应数据函数，使用这些函数且设置了日志目录，会写入响应日志到日志目录内

## 5 getGlobal 获取内置的全局常量，不可修改

```
import { getGlobal } from "$api/server.ts";

console.log(getGlobal().args.env) // env
```
