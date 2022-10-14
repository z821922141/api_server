import { ConnInfo, dateFormat, bold, green, yellow, serveDir } from "./import.ts";
import {
  Handler,
  RequestMethod,
  SendJson,
  RouterConfig,
  RunOptions,
  Env
} from "./types.ts";
import {
  Send
} from "./send.ts";
import { getGlobal } from "./server.ts";
import {
  log
} from "./logger.ts";
/* 路由配置 */
const ROUTERS: Record<
  RequestMethod,
  Record<string, Array<(ctx: Context) => Response>>
> = {
  "GET": {},
  "POST": {},
  "PUT": {},
  "DELETE": {},
  "HEAD": {},
  "OPTIONS": {},
  "PATCH": {},
  "MIDDLEWARE": {},
};
/* 中间件配置 */
const MIDDLEWARE: Record<string, Array<(ctx: Context) => Response>> = {};
/* 服务启动参数 */
let OPTIONS: RunOptions;
/**
 *  请求上下文
 */
export class Context {
  /* 请求资源 */
  readonly request: Request;
  /* 请求的连接信息 */
  readonly connInfo: ConnInfo;
  /* 请求时间 */
  readonly requestTime: string;
  /* 数据 */
  private state: Record<string, unknown> = {};
  /* 请求处理函数组 */
  private handler: Array<(ctx: Context) => Response>;
  /* 当前请求的处理函数下标 */
  private handlerIndex: number;

  /**
   * 构造函数
   */
  private constructor(
    request: Request,
    connInfo: ConnInfo,
    handler: Array<(ctx: Context) => Response>,
    handlerIndex: number,
  ) {
    this.request = request;
    this.connInfo = connInfo;
    this.handler = handler;
    this.handlerIndex = handlerIndex;
    this.requestTime = dateFormat(new Date(), "yyyy-MM-dd HH:mm:ss.SSS");
  }
  /**
   * 请求处理函数
   * 参数 request - 请求资源
   * 参数 connInfo - 请求的连接信息
   */
  static handler(request: Request, connInfo: ConnInfo) {
    const baseJson = Context.getRequestInfo(request, connInfo)
    const method = (request.method as RequestMethod);
    const route = new URL(request.url).pathname;
    /* 过滤 favicon.ico*/
    if (route.startsWith("/favicon.ico")) {
      return new Response();
    }
    Context.log(baseJson)
    /* 检测是否为文件路由 */
    const staticDir = getGlobal()?.runOption?.staticDir
    if (route.startsWith(staticDir ?? "")) {
      return serveDir(request, { quiet: true });
    }
    const methodInfo = ROUTERS[method];
    if (methodInfo === undefined) {
      return new Send(new Context(request, connInfo, [], 0)).sendNoFound({ data: { method, route }, log: { baseJson, error: new Error() } });
    }
    const handlerList = methodInfo[route];
    if (handlerList === undefined) {
      return new Send(new Context(request, connInfo, [], 0)).sendNoFound({ data: { method, route }, log: { baseJson, error: new Error() } });
    }
    const cxt = new Context(request, connInfo, handlerList, 0);
    return handlerList[cxt.handlerIndex](cxt);
  }
  /**
   * 执行下一请求处理函数
   */
  next() {
    this.handlerIndex++;
    if(this.handlerIndex===this.handler.length){
      throw Error("没有下一函数执行！！！")
    }
    return this.handler[this.handlerIndex](this);
  }
  /**
   * 获取 State数据
   * 参数 key - 获取的key
   * 返回 unknown - 对应key的值
   */
  getState<T>(key: string): T {
    const value = this.state[key];
    return (value as T);
  }
  /**
   * 设置 State数据
   * 参数 key -设置的key
   * 参数 value - 设置的值
   */
  setState<T>(key: string, value: T) {
    this.state[key] = value;
  }
  /**
   * 响应
   * 参数 data - 响应的数据
   * 参数 init - 响应参数
   * 返回 Response
   */
  send(data: SendJson, init?: ResponseInit): Response {
    if (data.log !== undefined) {
      data.log.baseJson ??= this.getRequestInfo()
    }
    return new Send(this, init).send(data);
  }
  /**
   * 响应成功
   * 参数 data - 响应的数据
   * 参数 init - 响应参数
   * 返回 Response
   */
  sendSuccess(data?: SendJson, init?: ResponseInit): Response {
    if (data?.log !== undefined) {
      data.log.baseJson ??= this.getRequestInfo()
    }
    return new Send(this, init).sendSuccess(data);
  }
  /**
   * 响应失败
   * 参数 data - 响应的数据
   * 参数 init - 响应参数
   * 返回 Response
   */
  sendFail(data?: SendJson, init?: ResponseInit): Response {
    if (data?.log !== undefined) {
      data.log.baseJson ??= this.getRequestInfo()
    }
    return new Send(this, init).sendFail(data);
  }
  /**
   * 响应资源未找到
   * 参数 data - 响应的数据
   * 参数 init - 响应参数
   * 返回 Response
   */
  sendNoFound(data?: SendJson, init?: ResponseInit): Response {
    if (data?.log !== undefined) {
      data.log.baseJson ??= this.getRequestInfo()
    }
    return new Send(this, init).sendNoFound(data);
  }
  /**
   * 获取请求基本信息
   * 返回 Record<string, unknown> - 获取后的信息 
   */
  getRequestInfo(): Record<string, unknown> {
    return {
      method: (this.request.method as RequestMethod),
      route: new URL(this.request.url).pathname,
      requestTime: this.requestTime,
      ip: this.connInfo.remoteAddr,
      userAgent: this.request.headers.get("user-agent")
    }
  }
  /**
   * 静态的获取请求基本信息
   * 参数 request - 请求资源
   * 参数 connInfo - 请求的连接信息
   * 返回 Record<string, unknown> - 获取后的信息 
   */
  static getRequestInfo(request: Request, connInfo: ConnInfo): Record<string, unknown> {
    return {
      method: (request.method as RequestMethod),
      route: new URL(request.url).pathname,
      requestTime: dateFormat(new Date(), "yyyy-MM-dd HH:mm:ss.SSS"),
      ip: connInfo.remoteAddr,
      userAgent: request.headers.get("user-agent")
    }
  }
  /**
   * 日志打印 
   * 参数 json - 打印的数据
   * 参数 connInfo - 请求的连接信息
   */
  static log(json: Record<string, unknown>) {
    setTimeout(() => {
      if (getGlobal().args.env === Env.DEV && getGlobal()?.runOption?.logger?.run === true) {
        const info = `{method: ${green(bold(json.method as string))}, route: ${green(bold(json.route as string))}, requestTime: ${yellow(bold(json.requestTime as string))}, ip: ${JSON.stringify(json.ip)}}`;
        console.log(info);
      }
      log.info(JSON.stringify(json))
    });
  }
  /**
   * 路由初始化
   * 参数 routerConfig - 路由配置
   * 参数 options - 服务启动参数
   */
  static routerInit(routerConfig: RouterConfig, options: RunOptions) {
    OPTIONS = options;
    const configList = Object.entries(routerConfig.routers);
    for (const [key, value] of configList) {
      const nowKey = key.replace("./routers", "");
      const handler = (value as Handler);
      if (
        nowKey.endsWith("/_middleware.ts") && handler.MIDDLEWARE !== undefined
      ) {
        this.middlewareInit(nowKey, handler.MIDDLEWARE);
      }
    }
    for (const [key, value] of configList) {
      let nowKey = key.replace("./routers", "");
      nowKey = nowKey.substring(0, nowKey.length - 3);
      if (nowKey.endsWith("/_middleware.ts")) {
        continue;
      }
      const handler = (value as Handler);
      if (handler.GET !== undefined) {
        this.routerSet(nowKey, handler.GET, RequestMethod.GET);
      }
      if (handler.POST !== undefined) {
        this.routerSet(nowKey, handler.POST, RequestMethod.POST);
      }
      if (handler.PUT !== undefined) {
        this.routerSet(nowKey, handler.PUT, RequestMethod.PUT);
      }
      if (handler.DELETE !== undefined) {
        this.routerSet(nowKey, handler.DELETE, RequestMethod.DELETE);
      }
      if (handler.HEAD !== undefined) {
        this.routerSet(nowKey, handler.HEAD, RequestMethod.HEAD);
      }
      if (handler.PATCH !== undefined) {
        this.routerSet(nowKey, handler.PATCH, RequestMethod.PATCH);
      }
      if (handler.OPTIONS !== undefined) {
        this.routerSet(nowKey, handler.OPTIONS, RequestMethod.OPTIONS);
      }
    }
  }
  /**
   * 路由设置
   * 参数 path - 路由路径
   * 参数 fns - 路由对应处理函数
   * 参数 method - 路由请求方式
   */
  static routerSet(
    path: string,
    fn: (ctx: Context) => Response,
    method: RequestMethod,
  ) {
    const middleware = Object.entries(MIDDLEWARE);
    const route = OPTIONS.routePrefixPath + path;
    if (ROUTERS[method][route] === undefined) {
      ROUTERS[method][route] = [];
    }
    for (const [key, value] of middleware) {
      if (path.indexOf(key) === 0) {
        ROUTERS[method][route] = [...ROUTERS[method][route], ...value];
      }
    }
    ROUTERS[method][route].push(fn);
  }
  /**
   * 中间件初始化
   * 参数 path - 中间件对应路径
   * 参数 fns - 中间件对应处理函数
   */
  static middlewareInit(path: string, fns: Array<(ctx: Context) => Response>) {
    const nowPath = path.replace("_middleware.ts", "");
    MIDDLEWARE[nowPath] = fns;
  }
}
