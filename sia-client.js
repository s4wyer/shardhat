import init, { SharedSdk } from "./pkg/sia_storage_wasm.js";

let wasmInitPromise = null;
const sharedSdkCache = new Map();

export function ensureWasm() {
  if (!wasmInitPromise) {
    wasmInitPromise = init().catch((err) => {
      wasmInitPromise = null;
      throw err;
    });
  }
  return wasmInitPromise;
}

export async function getSharedSdk(indexerOrigin, sharingKeySeed) {
  await ensureWasm();
  const cacheKey = `${indexerOrigin}|${sharingKeySeed}`;
  if (sharedSdkCache.has(cacheKey)) {
    return sharedSdkCache.get(cacheKey);
  }
  const sdkPromise = SharedSdk.connect(indexerOrigin, sharingKeySeed).catch(
    (err) => {
      if (sharedSdkCache.get(cacheKey) === sdkPromise)
        sharedSdkCache.delete(cacheKey);
      throw err;
    },
  );
  sharedSdkCache.set(cacheKey, sdkPromise);
  return sdkPromise;
}

export function prewarmSharedSdk(indexerOrigin, sharingKeySeed) {
  getSharedSdk(indexerOrigin, sharingKeySeed).catch(() => {});
}

export function evictSharedSdk(indexerOrigin, sharingKeySeed) {
  const cacheKey = `${indexerOrigin}|${sharingKeySeed}`;
  const existing = sharedSdkCache.get(cacheKey);
  sharedSdkCache.delete(cacheKey);
  if (existing && typeof existing.then === "function") {
    existing
      .then((sdk) => {
        try {
          sdk.free();
        } catch (_) {}
      })
      .catch(() => {});
  }
}

export function releaseDescriptor(descriptor) {
  if (descriptor && descriptor.pinnedObj) {
    try {
      descriptor.pinnedObj.free();
    } catch (_) {}
    descriptor.pinnedObj = null;
  }
}

function raceWithSignal(
  promise,
  signal,
  abortMessage = "Request aborted",
  dispose = () => {},
) {
  if (!signal) return promise;
  if (signal.aborted) {
    promise.then(dispose, () => {});
    return Promise.reject(new DOMException(abortMessage, "AbortError"));
  }
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      signal.removeEventListener("abort", onAbort);
      reject(new DOMException(abortMessage, "AbortError"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (val) => {
        signal.removeEventListener("abort", onAbort);
        if (signal.aborted) {
          dispose(val);
          return;
        }
        resolve(val);
      },
      (err) => {
        signal.removeEventListener("abort", onAbort);
        reject(err);
      },
    );
  });
}

export async function resolveShareDescriptor(parsed, signal) {
  signal?.throwIfAborted();
  if (parsed.apiUrl) {
    const resp = await fetch(parsed.apiUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "omit",
      referrerPolicy: "no-referrer",
      cache: "no-store",
      signal,
    });

    if (!resp.ok) {
      if (resp.status === 401 || resp.status === 403) {
        throw new Error("Link signature has expired or is unauthorized.");
      }
      if (resp.status === 404) {
        throw new Error("Object not found or no longer pinned to storage.");
      }
      throw new Error(`Storage server returned HTTP ${resp.status}.`);
    }

    let descriptor;
    try {
      descriptor = await resp.json();
    } catch (_) {
      signal?.throwIfAborted();
      throw new Error(
        "Received malformed metadata response from storage server.",
      );
    }

    if (
      !descriptor ||
      typeof descriptor !== "object" ||
      Array.isArray(descriptor) ||
      (descriptor.slabs !== undefined && !Array.isArray(descriptor.slabs)) ||
      (descriptor.size !== undefined &&
        (!Number.isSafeInteger(descriptor.size) || descriptor.size < 0))
    ) {
      throw new Error("Storage server returned an invalid object descriptor.");
    }
    return descriptor;
  }

  const sdk = await raceWithSignal(
    getSharedSdk(parsed.indexerOrigin, parsed.sharingKey),
    signal,
    "Request timed out while resolving share link.",
  );

  const pinnedObj = await raceWithSignal(
    sdk.object(parsed.objectId),
    signal,
    "Request timed out while resolving share link.",
    (object) => object.free(),
  );

  if (signal && signal.aborted) {
    try {
      pinnedObj.free();
    } catch (_) {}
    throw new DOMException("Request aborted", "AbortError");
  }

  try {
    return { pinnedObj, size: pinnedObj.size(), slabs: pinnedObj.slabs() };
  } catch (error) {
    pinnedObj.free();
    throw error;
  }
}

export async function openObjectDownloadStream(
  parsed,
  descriptor,
  onStageChange,
  abortSignal,
) {
  if (abortSignal && abortSignal.aborted) {
    throw new DOMException("Download cancelled", "AbortError");
  }

  const sdk = await raceWithSignal(
    getSharedSdk(parsed.indexerOrigin, parsed.sharingKey),
    abortSignal,
    "Download cancelled",
  );

  if (!descriptor.pinnedObj) {
    onStageChange("Fetching object slab layout from indexer...");
    descriptor.pinnedObj = await raceWithSignal(
      sdk.object(parsed.objectId),
      abortSignal,
      "Download cancelled",
      (object) => object.free(),
    );
  }
  const pinnedObj = descriptor.pinnedObj;

  if (abortSignal && abortSignal.aborted) {
    throw new DOMException("Download cancelled", "AbortError");
  }

  onStageChange("Connecting to Sia storage nodes over WebTransport...");
  const size = pinnedObj.size();
  if (!Number.isSafeInteger(size) || size < 0)
    throw new Error("Indexer returned an invalid file size.");
  const stream = sdk.download(pinnedObj);
  const reader = stream.getReader();

  return {
    reader,
    size,
  };
}
