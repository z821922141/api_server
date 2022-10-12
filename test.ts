new Worker(new URL("./worker.ts", import.meta.url).href, { type: "module" });
console.log(new URL("./worker.ts", import.meta.url).href)
console.log(1)
