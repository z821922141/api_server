import { Context } from "$api/context.ts";
export function GET(ctx: Context): Response {
    try {
        const { response, socket } = Deno.upgradeWebSocket(ctx.request);
        socket.onopen = () => console.log("socket opened");
        socket.onmessage = (e) => {
            console.log("socket message:", e.data);
            socket.send(new Date().toString());
        };
        socket.onerror = (e) => console.log("socket errored:", e);
        socket.onclose = () => console.log("socket closed");
        return response
    } catch (err){
        return ctx.responseNoFound();
    }

    
}
export function POST(ctx: Context): Response {
    return new Response("POST")
}