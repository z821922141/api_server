import { Context } from "$api/context.ts";
export function GET(ctx: Context): Response{
    console.log(ctx)
    return new Response("GET")
}
export function POST(ctx: Context): Response{
    return new Response("POST")
}