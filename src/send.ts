import {
    SendJson,
    RequestMethod
} from "./types.ts";
import { dateFormat } from "./import.ts";
import { Context } from "./context.ts";
import {
    log
} from "./logger.ts";

/**
 * 响应 
 */
export class Send {
    /* 请求上下文*/
    readonly context: Context;
    /* 响应报文 */
    readonly init?: ResponseInit;
    /**
     * 构造函数 
     */
    constructor(context: Context, init?: ResponseInit) {
        this.context = context
        this.init = this.responseInit(init)
    }
    /**
     * 响应
     * 参数 body - 响应数据
     * 返回 Response 
     */
    send(body: SendJson): Response {
        body.code ??= 200;
        body.data ??= null;
        body.message ??= "";
        body.time ??= dateFormat(new Date(), "yyyy-MM-dd HH:mm:ss.SSS")
        body.log ??= undefined
        this.sendLog(body)
        return new Response(JSON.stringify({
            code: body.code,
            data: body.data,
            message: body.message,
            time: body.time
        }), this.init)
    }
    /**
     * 响应成功
     * 参数 body - 响应的数据
     * 返回 Response
     */
    sendSuccess(body?: SendJson): Response {
        const json = {
            code: 200,
            data: body?.data ?? null,
            message: body?.message ?? "成功",
            log: body?.log ?? undefined
        };
        return this.send(json);
    }
    /**
     * 响应失败
     * 参数 body - 响应的数据
     * 返回 Response
     */
    sendFail(body?: SendJson): Response {
        const json = {
            code: 500,
            data: body?.data ?? null,
            message: body?.message ?? "失败",
            log: body?.log ?? undefined
        };
        return this.send(json);
    }
    /**
     * 响应资源未找到
     * 参数 body - 响应的数据
     * 返回 Response
     */
    sendNoFound(body?: SendJson): Response {
        const json = {
            code: 404,
            data: body?.data ?? null,
            message: body?.message ?? "资源未找到",
            log: body?.log ?? undefined
        };
        return this.send(json);
    }
    /**
     * 响应报文初始化 
     * 参数 init - 响应报文
     */
    responseInit(init?: ResponseInit): ResponseInit {
        const status = init?.status ?? 200
        const statusText = init?.statusText
        let headers = {
            "content-type": "application/json",
            ...this.cors(),
        }
        if (init?.headers) {
            headers = {
                ...headers,
                ...init?.headers,
            }
        }
        return {
            status,
            headers,
            statusText,
        }
    }
    /**
     * 跨域响应头报文
     * 返回 HeadersInit - 响应头
     */
    cors(): HeadersInit {
        const request = this.context.request
        const header = request.headers
        const method = request.method
        const origin = header.get("origin")
        const maxAge = header.get("access-control-max-age")
        const nowHeader: Record<string, string> = {}
        if (origin) {
            nowHeader["Access-Control-Allow-Origin"] = origin
            nowHeader["Access-Control-Allow-Methods"] = method
            if (method === RequestMethod.OPTIONS) {
                nowHeader["Access-Control-Allow-Headers"] = header.get("access-control-request-headers") ?? ""
            }
            nowHeader["Access-Control-Allow-Credentials"] = "true"
            if (maxAge) {
                nowHeader["Access-Control-Max-Age"] = maxAge
            }
        }
        return nowHeader
    }
    /**
     * 响应日志
     * 参数 data - 日志数据
     */
    sendLog(data: SendJson) {
        setTimeout(() => {
            if (data.log === undefined) return
            if (data.log.baseJson === undefined) return
            data.log.baseJson.responseData = {
                code: data.code,
                data: data.data,
                message: data.message,
                time: data.time
            }
            if (data.log.json !== undefined) {
                data.log.baseJson.data = data.log.json
            }
            if (data.log.error !== undefined) {
                data.log.baseJson.error = data.log.error.toString()
                log.error(`${JSON.stringify(data.log.baseJson)}`)
                return
            }
            log.info(JSON.stringify(data.log.baseJson))
        });

    }
}