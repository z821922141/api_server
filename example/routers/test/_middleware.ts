import { Context } from "$api/context.ts";

function middleware2(ctx: Context): Response {
    console.log(ctx)
    return new Response("hh")
}
export const MIDDLEWARE = [middleware2]