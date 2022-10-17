## 介绍

deno的一个轻量专注于写api的web服务库

## 功能

- 路由

- 中间件

- 静态目录

## 源码目录

```
.
├── docs
├── example
├── src
├── cli.ts
├── mod.ts
└── README.md
```

- `docs` 是库的使用文档

- `example` 是一些测试示例

- `src` 是库源码

- `cli.ts` 是搭建项目的脚手架

- `mod.ts` 是所有模块集合

## 库使用

使用CLI创建项目

```
deno run -A https://deno.land/x/api_server@0.0.1/cli.ts
```

使用配置命令启动项目

```
deno task dev
```

## 了解更多请查看[docs](./docs/mod.md)以及example下的示例代码
