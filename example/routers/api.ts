
import { Context } from "$api/context.ts";

export function GET(ctx:Context){
    console.log(ctx.request)
    return ctx.sendSuccess()
}
