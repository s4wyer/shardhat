import { formatBytes } from "./url-parser.js";

const MAX_IN_MEMORY_BLOB_BYTES = 512 * 1024 * 1024;
const SW_CHUNK_BYTES = 1024 * 1024;
const SW_TIMEOUT_MS = 30000;
let swRegistrationPromise = null;

export function registerDownloadServiceWorker() {
  if ("serviceWorker" in navigator && !swRegistrationPromise) {
    swRegistrationPromise = navigator.serviceWorker
      .register("./sw-download.js")
      .catch(() => {
        swRegistrationPromise = null;
        return null;
      });
  }
  return swRegistrationPromise;
}

export function sanitizeFilename(name, fallback = "download.bin") {
  if (typeof name !== "string") return fallback;
  let sanitized = name
    .toWellFormed()
    .replace(/[\/\\?*:"<>|]/g, "_")
    .replace(/[\x00-\x1f\x7f\u202a-\u202e\u2066-\u2069]/g, "")
    .trim()
    .replace(/^[\s.]+|[\s.]+$/g, "");
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(sanitized))
    sanitized = `_${sanitized}`;
  const encoder = new TextEncoder();
  while (encoder.encode(sanitized).length > 240)
    sanitized = Array.from(sanitized).slice(0, -1).join("");
  return sanitized || fallback;
}

async function resolveActiveServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  const container = navigator.serviceWorker;
  if (container.controller) return container.controller;
  registerDownloadServiceWorker();
  return new Promise((resolve) => {
    const finish = () => {
      clearTimeout(timeout);
      container.removeEventListener("controllerchange", onChange);
      resolve(container.controller || null);
    };
    const onChange = () => {
      if (container.controller) finish();
    };
    const timeout = setTimeout(finish, 2500);
    container.addEventListener("controllerchange", onChange);
    onChange();
    swRegistrationPromise?.then((registration) => {
      if (!registration) finish();
    });
  });
}

/** Call from the click handler to preserve file-picker user activation. */
export async function acquireDownloadSink(saveName, abortController) {
  const safeSaveName = sanitizeFilename(saveName);
  const { signal } = abortController;
  signal.throwIfAborted();

  if (typeof window.showSaveFilePicker === "function") {
    let handle;
    try {
      handle = await window.showSaveFilePicker({ suggestedName: safeSaveName });
    } catch (error) {
      if (error.name === "AbortError") return null;
      if (error.name !== "SecurityError" && error.name !== "NotAllowedError")
        throw error;
    }
    if (handle) {
      signal.throwIfAborted();
      const writable = await handle.createWritable();
      return {
        async prepare() {
          signal.throwIfAborted();
        },
        async write(chunk) {
          signal.throwIfAborted();
          await writable.write(chunk);
        },
        async close() {
          signal.throwIfAborted();
          await writable.close();
        },
        async abort() {
          try {
            await writable.abort();
          } catch (_) {}
        },
      };
    }
  }

  let port = null;
  let iframe = null;
  let pending = null;
  let failure = null;
  let memoryBytes = 0;
  const memoryChunks = [];
  const cleanup = () => {
    signal.removeEventListener("abort", onAbort);
    port?.close();
    port = null;
    if (iframe) {
      const oldFrame = iframe;
      iframe = null;
      setTimeout(() => oldFrame.remove(), 1000);
    }
    memoryChunks.length = 0;
  };
  const fail = (error) => {
    failure ||= error;
    pending?.reject(failure);
  };
  const onAbort = () =>
    fail(signal.reason || new DOMException("Download cancelled", "AbortError"));
  const waitFor = (type, send) => {
    signal.throwIfAborted();
    if (failure) return Promise.reject(failure);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () =>
          fail(
            new Error(
              "Browser download stopped responding. Please retry or reload the page.",
            ),
          ),
        SW_TIMEOUT_MS,
      );
      const settle = (callback, value) => {
        clearTimeout(timer);
        pending = null;
        callback(value);
      };
      pending = {
        type,
        resolve: (value) => settle(resolve, value),
        reject: (error) => settle(reject, error),
      };
      try {
        send();
      } catch (error) {
        fail(error);
      }
    });
  };
  signal.addEventListener("abort", onAbort, { once: true });

  return {
    async prepare(expectedBytes) {
      if (!Number.isSafeInteger(expectedBytes) || expectedBytes < 0)
        throw new Error("Invalid download size.");
      const sw = await resolveActiveServiceWorker();
      signal.throwIfAborted();
      if (!sw) {
        if (expectedBytes > MAX_IN_MEMORY_BLOB_BYTES) {
          throw new Error(
            `This file is ${formatBytes(expectedBytes)}, exceeding the ${formatBytes(MAX_IN_MEMORY_BLOB_BYTES)} in-memory limit. Reload the page or use a browser with direct-to-disk downloads.`,
          );
        }
        return;
      }
      const channel = new MessageChannel();
      port = channel.port1;
      port.onmessage = ({ data }) => {
        if (data?.type === "cancelled") {
          abortController.abort();
        } else if (data?.type === "error") {
          fail(new Error(data.message || "Browser download failed."));
        } else if (data?.type === pending?.type) {
          pending.resolve(data);
        }
      };
      const uuid = crypto.randomUUID();
      await waitFor("ready", () =>
        sw.postMessage(
          {
            type: "start-download",
            version: 2,
            uuid,
            filename: safeSaveName,
            size: expectedBytes,
          },
          [channel.port2],
        ),
      );
      await waitFor("opened", () => {
        iframe = document.createElement("iframe");
        iframe.hidden = true;
        iframe.src = new URL(`./_download/${uuid}`, window.location.href).href;
        document.body.appendChild(iframe);
      });
    },
    async write(chunk) {
      signal.throwIfAborted();
      if (failure) throw failure;
      if (port) {
        for (
          let offset = 0;
          offset < chunk.byteLength;
          offset += SW_CHUNK_BYTES
        ) {
          const buffer = chunk.buffer.slice(
            chunk.byteOffset + offset,
            chunk.byteOffset +
              Math.min(offset + SW_CHUNK_BYTES, chunk.byteLength),
          );
          await waitFor("ack", () =>
            port.postMessage({ type: "chunk", data: buffer }, [buffer]),
          );
        }
      } else {
        memoryBytes += chunk.byteLength;
        if (memoryBytes > MAX_IN_MEMORY_BLOB_BYTES) {
          memoryChunks.length = 0;
          throw new Error(
            `Download exceeded the ${formatBytes(MAX_IN_MEMORY_BLOB_BYTES)} in-memory limit. Use a browser with direct-to-disk downloads.`,
          );
        }
        memoryChunks.push(chunk.slice());
      }
    },
    async close() {
      signal.throwIfAborted();
      if (failure) throw failure;
      if (port) {
        await waitFor("complete", () => port.postMessage({ type: "end" }));
      } else {
        const blob = new Blob(memoryChunks, {
          type: "application/octet-stream",
        });
        const blobUrl = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = blobUrl;
        anchor.download = safeSaveName;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      }
      cleanup();
    },
    async abort(error) {
      fail(error || new DOMException("Download cancelled", "AbortError"));
      try {
        port?.postMessage({ type: "abort" });
      } finally {
        cleanup();
      }
    },
  };
}
