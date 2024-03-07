const PORT = 3000;
console.log("Serving on port", PORT);

const fs = require("fs");

Bun.serve({
    port: PORT,
    fetch: async (req) => {
        const host = req.headers.get("host");
        const url = req.url;
        const path = url.split(host)[1];
        console.log(path);
        if (path === "/") {
            return new Response(Bun.file("index.html"));
        }
        const file0 = `.${path}`;
        // if (path.endsWith("/") || path.endsWith(".html")) {
        //     return new Response(Bun.file(file0));
        // }
        return new Response(Bun.file(file0));
    }
})
