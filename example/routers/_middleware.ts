import { Context } from "$api/context.ts";
interface Test {
    a: number
}
function middleware1(ctx: Context): Response {
    const test: Test = {
        a: 1
    }
    ctx.setState<Test>("test",test)
    let nowTest = ctx.getState<Test>("test")
  
    test.a = 2
    return ctx.next()
}
export const MIDDLEWARE = [middleware1]