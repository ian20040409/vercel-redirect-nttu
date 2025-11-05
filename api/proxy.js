export default async function handler(req, res) {
  try {
    const target = process.env.NGROK_TARGET;
    if (!target) { res.status(500).send("Missing NGROK_TARGET"); return; }

    const incomingPath = req.url.replace(/^\/api\/proxy/, "") || "/";
    let upstream = new URL(incomingPath, target).toString();

    // Clone headers, add bypass
    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) {
      if (Array.isArray(v)) headers.set(k, v.join(", "));
      else if (typeof v === "string") headers.set(k, v);
    }

    headers.set("ngrok-skip-browser-warning", "true");
    

    const init = { method: req.method, headers, redirect: "manual" };
    if (req.method !== "GET" && req.method !== "HEAD") {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      init.body = Buffer.concat(chunks);
    }

    // Follow redirects internally
    let resp;
    for (let i = 0; i < 5; i++) {
      resp = await fetch(upstream, init);
      const loc = resp.headers.get("location");
      if ([301,302,303,307,308].includes(resp.status) && loc) {
        upstream = new URL(loc, upstream).toString();
        continue;
      }
      break;
    }
    if (!resp) { res.status(502).send("Upstream failed"); return; }

    const ct = resp.headers.get("content-type") || "application/octet-stream";
    const buf = Buffer.from(await resp.arrayBuffer());

    if (ct.toLowerCase().includes("text/html")) {
      const ngrokOrigin = new URL(target).origin;
      const vercelOrigin = "https://" + (req.headers["x-forwarded-host"] || req.headers.host);
      const text = buf.toString("utf8").split(ngrokOrigin).join(vercelOrigin);
      res.setHeader("content-type", ct);
      res.status(resp.status).send(text);
      return;
    }

    res.status(resp.status);
    res.setHeader("content-type", ct);
    res.send(buf);
  } catch (e) {
    res.status(502).send("Proxy error: " + (e?.message || String(e)));
  }
}