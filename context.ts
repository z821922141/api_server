import { ConnInfo } from "./import.ts";
import {
  Handler,
  RequestMethod,
  ResponseJson,
  RouterConfig,
  RunOptions,
} from "./types.ts";
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
let OPTIONS: RunOptions = {};
/**
 *  请求上下文
 */
export class Context {
  /* 请求资源 */
  readonly request: Request;
  /* 请求的连接信息 */
  readonly connInfo: ConnInfo;
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
  }
  /**
   * 请求处理函数
   * 参数 request - 请求资源
   * 参数 connInfo - 请求的连接信息
   */
  static handler(request: Request, connInfo: ConnInfo) {
    const method = (request.method as RequestMethod);
    const route = new URL(request.url).pathname;
    const methodInfo = ROUTERS[method];
    if (methodInfo === undefined) {
      return Context.responseNoFound({ method, route });
    }
    const handlerList = methodInfo[route];
    if (handlerList === undefined) {
      return Context.responseNoFound({ method, route });
    }
    const cxt = new Context(request, connInfo, handlerList, 0);
    return handlerList[cxt.handlerIndex](cxt);
  }
  /**
   * 执行下一函数
   */
  next() {
    this.handlerIndex++;
    return this.handler[this.handlerIndex](this);
  }
  /**
   * 响应
   * 参数 data - 响应的数据
   * 参数 init - 响应参数
   * 返回 Response
   */
  static response(data: ResponseJson, init?: ResponseInit): Response {
    data.code ??= 200;
    data.data ??= null;
    data.message ??= "";
    return new Response(JSON.stringify(data), {
      status: init?.status ?? 200,
      headers: init?.headers ?? {
        "content-type": "application/json;charset=UTF-8",
      },
      statusText: init?.statusText ?? "",
    });
  }
  /**
   * 响应成功
   * 参数 data - 响应的数据
   * 参数 message - 响应的提示
   * 参数 init - 响应参数
   * 返回 Response
   */
  static responseSuccess(
    data?: Record<string, unknown> | null,
    message?: string,
    init?: ResponseInit,
  ): Response {
    const json = {
      code: 200,
      data: data ??= null,
      message: message ??= "成功",
    };
    return this.response(json, init);
  }
  /**
   * 响应失败
   * 参数 data - 响应的数据
   * 参数 message - 响应的提示
   * 参数 init - 响应参数
   * 返回 Response
   */
  static responseFail(
    data?: Record<string, unknown> | null,
    message?: string,
    init?: ResponseInit,
  ): Response {
    const json = {
      code: 500,
      data: data ??= null,
      message: message ??= "失败",
    };
    return this.response(json, init);
  }
  /**
   * 响应资源未找到
   * 参数 data - 响应的数据
   * 参数 message - 响应的提示
   * 参数 init - 响应参数
   * 返回 Response
   */
  static responseNoFound(
    data?: Record<string, unknown> | null,
    message?: string,
    init?: ResponseInit,
  ): Response {
    const json = {
      code: 404,
      data: data ??= null,
      message: message ??= "资源未找到",
    };
    return this.response(json, init);
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
    for (const [key, value] of middleware) {
      if (path.indexOf(key) === 0) {
        if (ROUTERS[method][route] === undefined) {
          ROUTERS[method][route] = [];
        }
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
