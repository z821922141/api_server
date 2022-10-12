import {
    ResponseJson,
} from "./types.ts";
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
export function responseSuccess(
    data?: Record<string, unknown> | null,
    message?: string,
    init?: ResponseInit,
): Response {
    const json = {
        code: 200,
        data: data ??= null,
        message: message ??= "成功",
    };
    return response(json, init);
}
/**
 * 响应失败
 * 参数 data - 响应的数据
 * 参数 message - 响应的提示
 * 参数 init - 响应参数
 * 返回 Response
 */
export function responseFail(
    data?: Record<string, unknown> | null,
    message?: string,
    init?: ResponseInit,
): Response {
    const json = {
        code: 500,
        data: data ??= null,
        message: message ??= "失败",
    };
    return response(json, init);
}
/**
 * 响应资源未找到
 * 参数 data - 响应的数据
 * 参数 message - 响应的提示
 * 参数 init - 响应参数
 * 返回 Response
 */
export function responseNoFound(
    data?: Record<string, unknown> | null,
    message?: string,
    init?: ResponseInit,
): Response {
    const json = {
        code: 404,
        data: data ??= null,
        message: message ??= "资源未找到",
    };
    return response(json, init);
}