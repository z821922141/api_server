import { Context } from "$api/context.ts";

function middleware1(ctx: Context): Response {
    return ctx.next()
}
export const MIDDLEWARE = [middleware1]