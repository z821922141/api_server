import { Context } from "./context.ts";
export function GET(ctx: Context): Response{
    
    return new Response("GET")
}
export function POST(ctx: Context): Response{
    return new Response("POST")
}