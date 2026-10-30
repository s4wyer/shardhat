self.addEventListener("install", (event) =>
  event.waitUntil(self.skipWaiting()),
);
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim()),
);

const downloads = new Map();
const downloadPrefix = new URL("./_download/", self.registration.scope)
  .pathname;
const MAX_CHUNK_BYTES = 1024 * 1024;

self.addEventListener("message", (event) => {
  const { type, uuid, filename, size, version } = event.data || {};
  const port = event.ports?.[0];
  if (
    type !== "start-download" ||
    version !== 2 ||
    !port ||
    event.source?.type !== "window" ||
    !/^[\da-f-]{36}$/i.test(uuid) ||
    downloads.has(uuid) ||
    typeof filename !== "string" ||
    !Number.isSafeInteger(size) ||
    size < 0
  )
    return;

  const entry = {
    filename,
    size,
    controller: null,
    chunk: null,
    pullResolve: null,
    ended: false,
    received: 0,
  };
  let finish;
  entry.finished = new Promise((resolve) => {
    finish = resolve;
  });

  const cleanup = () => {
    clearTimeout(entry.timeout);
    downloads.delete(uuid);
    entry.pullResolve?.();
    entry.pullResolve = null;
    entry.chunk = null;
    port.close();
    finish();
  };
  entry.fail = (message) => {
    port.postMessage({ type: "error", message });
    entry.controller?.error(new Error(message));
    cleanup();
  };
  const pump = () => {
    if (entry.chunk && entry.pullResolve) {
      const bytes = entry.chunk.byteLength;
      entry.controller.enqueue(entry.chunk);
      entry.chunk = null;
      entry.pullResolve();
      entry.pullResolve = null;
      port.postMessage({ type: "ack", bytes });
    }
    if (entry.ended && !entry.chunk && entry.controller) {
      entry.controller.close();
      port.postMessage({ type: "complete" });
      cleanup();
    }
  };
  entry.streamSource = {
    start(controller) {
      entry.controller = controller;
      clearTimeout(entry.timeout);
      port.postMessage({ type: "opened" });
    },
    pull() {
      return new Promise((resolve) => {
        entry.pullResolve = resolve;
        pump();
      });
    },
    cancel() {
      port.postMessage({ type: "cancelled" });
      cleanup();
    },
  };
  port.onmessage = ({ data }) => {
    if (data?.type === "chunk") {
      if (
        !(data.data instanceof ArrayBuffer) ||
        data.data.byteLength > MAX_CHUNK_BYTES ||
        entry.chunk ||
        entry.ended
      ) {
        entry.fail("Invalid download chunk.");
        return;
      }
      entry.received += data.data.byteLength;
      if (entry.received > size) {
        entry.fail("Download exceeded its expected size.");
        return;
      }
      entry.chunk = new Uint8Array(data.data);
      pump();
    } else if (data?.type === "end") {
      if (entry.received !== size) {
        entry.fail("Download ended before its expected size.");
        return;
      }
      entry.ended = true;
      pump();
    } else if (data?.type === "abort") {
      entry.fail("Download cancelled.");
    }
  };
  entry.timeout = setTimeout(
    () => entry.fail("Browser download did not start. Please retry."),
    60000,
  );
  downloads.set(uuid, entry);
  port.postMessage({ type: "ready" });
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (
    url.origin !== self.location.origin ||
    !url.pathname.startsWith(downloadPrefix)
  )
    return;
  const uuid = url.pathname.slice(downloadPrefix.length);
  if (!/^[\da-f-]{36}$/i.test(uuid)) return;
  const entry = downloads.get(uuid);
  if (!entry || entry.controller || event.request.method !== "GET") {
    event.respondWith(
      new Response("Download unavailable. Please retry from the file page.", {
        status: 404,
      }),
    );
    return;
  }

  event.waitUntil(entry.finished);
  const stream = new ReadableStream(entry.streamSource, { highWaterMark: 0 });
  const ascii = entry.filename.replace(/[^\x20-\x7e]|["\\]/g, "_");
  const encoded = encodeURIComponent(entry.filename).replace(
    /['()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
  const headers = {
    "Content-Type": "application/octet-stream",
    "Content-Disposition": `attachment; filename="${ascii}"; filename*=UTF-8''${encoded}`,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  };
  if (entry.size > 0) headers["Content-Length"] = String(entry.size);
  event.respondWith(new Response(stream, { headers }));
});
