import {
    ResponseJson,
} from "./types.ts";
import { dateFormat } from "./import.ts";
import {
    log
} from "./logger.ts";
/**
  * 响应
  * 参数 data - 响应的数据
  * 参数 init - 响应参数
  * 返回 Response
  */
export function response(data: ResponseJson, init?: ResponseInit): Response {
    data.code ??= 200;
    data.data ??= null;
    data.message ??= "";
    data.responseTime ??= dateFormat(new Date(), "yyyy-MM-dd HH:mm:ss.SSS")
    data.log ??= undefined
    responseLog(data)
    return new Response(JSON.stringify({
        code: data.code,
        data: data.data,
        message: data.message,
        responseTime: data.responseTime
    }), {
        status: init?.status ?? 200,
        headers: init?.headers ?? {
            "content-type": "application/json",
            "Access-Control-Allow-Origin": "http://localhost:8080",
            "Access-Control-Allow-Headers": "test,aa",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "OPTIONS",
            // "access-control-expose-headers":"",
            // "Access-Control-Max-Age": "0",
        },
        statusText: init?.statusText ?? "",
    });
}
/**
 * 响应成功
 * 参数 data - 响应的数据
 * 参数 init - 响应参数
 * 返回 Response
 */
export function responseSuccess(
    data?: ResponseJson,
    init?: ResponseInit,
): Response {
    const json = {
        code: data?.code ?? 200,
        data: data?.data ?? null,
        message: data?.message ?? "成功",
        log: data?.log ?? undefined
    };
    return response(json, init);
}
/**
 * 响应失败
 * 参数 data - 响应的数据
 * 参数 init - 响应参数
 * 返回 Response
 */
export function responseFail(
    data?: ResponseJson,
    init?: ResponseInit,
): Response {
    const json = {
        code: data?.code ?? 500,
        data: data?.data ?? null,
        message: data?.message ?? "失败",
        log: data?.log ?? undefined
    };
    return response(json, init);
}
/**
 * 响应资源未找到
 * 参数 data - 响应的数据
 * 参数 init - 响应参数
 * 返回 Response
 */
export function responseNoFound(
    data?: ResponseJson,
    init?: ResponseInit,
): Response {
    const json = {
        code: data?.code ?? 404,
        data: data?.data ?? null,
        message: data?.message ?? "资源未找到",
        log: data?.log ?? undefined
    };
    return response(json, init);
}
/**
 * 响应日志
 * 参数 data - 日志数据
 */
export function responseLog(data: ResponseJson) {
    setTimeout(() => {
        if (data.log === undefined) return
        if (data.log.baseJson === undefined) return
        data.log.baseJson.responseData = {
            code: data.code,
            data: data.data,
            message: data.message,
            responseTime: data.responseTime
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