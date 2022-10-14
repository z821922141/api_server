
import { Context } from "$api/context.ts";

interface Test {
    str: string
}

function minddleware1(ctx: Context) {
    const test = {
        str: "测试"
    }
    ctx.setState<Test>("test", test)
    return ctx.next()
}
function minddleware2(ctx: Context) {
    console.log(ctx.getState<Test>("test"))
    return ctx.next()
}

export const MIDDLEWARE = [minddleware1, minddleware2]