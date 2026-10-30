export const DEFAULT_INDEXER_ORIGIN = "https://sia.storage";

const HEX_64_RE = /^[0-9a-fA-F]{64}$/;
const LONG_LIVED_EXPIRY_THRESHOLD = 4000000000;

export function formatBytes(bytes) {
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  if (bytes < 1) {
    return `${bytes.toFixed(1).replace(/\.0$/, "")} B`;
  }
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    sizes.length - 1,
  );
  const value = bytes / Math.pow(k, i);
  return `${i === 0 ? Math.round(value).toString() : value.toFixed(1).replace(/\.0$/, "")} ${sizes[i]}`;
}

export function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "";
  const totalSec = Math.ceil(seconds);
  if (totalSec < 60) return `${totalSec}s`;
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  if (mins < 60) return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hours}h ${remMins}m`;
}

export function parseShareUrl(raw) {
  if (typeof raw !== "string") {
    throw new Error("Please enter a share link.");
  }

  // Strip surrounding whitespace and accidental wrapping quotes or brackets
  const trimmed = raw
    .trim()
    .replace(/^['"<]+|['">]+$/g, "")
    .trim();
  if (!trimmed) {
    throw new Error("Please enter a share link.");
  }

  let urlObj;
  try {
    urlObj = new URL(trimmed);
  } catch (_) {
    throw new Error(
      "Invalid URL format. Please enter a complete https:// share link.",
    );
  }

  if (urlObj.protocol !== "https:" && urlObj.protocol !== "http:") {
    throw new Error("Share link must use HTTP or HTTPS protocol.");
  }
  if (urlObj.username || urlObj.password) {
    throw new Error("Share links must not contain a username or password.");
  }

  const hashParams = new URLSearchParams(
    urlObj.hash ? urlObj.hash.replace(/^#/, "") : "",
  );
  const hashSharingKey = (
    hashParams.get("sharing_key") ||
    urlObj.searchParams.get("sharing_key") ||
    ""
  ).trim();
  const hashObjectId = (
    hashParams.get("object") ||
    urlObj.searchParams.get("object") ||
    ""
  ).trim();
  const filename = (
    hashParams.get("filename") ||
    hashParams.get("name") ||
    urlObj.searchParams.get("filename") ||
    urlObj.searchParams.get("name") ||
    ""
  ).trim();
  if (hashSharingKey && !HEX_64_RE.test(hashSharingKey)) {
    throw new Error("Invalid sharing key: expected a 64-character hex string.");
  }
  if (hashObjectId && !HEX_64_RE.test(hashObjectId)) {
    throw new Error(
      "Invalid Object ID format: expected 64-character hex string.",
    );
  }

  // Format A: Direct #sharing_key=<64-hex>&object=<64-hex> URL
  if (HEX_64_RE.test(hashSharingKey) && HEX_64_RE.test(hashObjectId)) {
    let indexerOrigin = DEFAULT_INDEXER_ORIGIN;
    const rawIndexer = urlObj.searchParams.get("indexer");
    if (rawIndexer) {
      try {
        const parsedIndexer = new URL(rawIndexer);
        if (
          !["http:", "https:"].includes(parsedIndexer.protocol) ||
          parsedIndexer.username ||
          parsedIndexer.password
        )
          throw new Error();
        indexerOrigin = parsedIndexer.origin;
      } catch (_) {
        throw new Error(
          "Invalid indexer URL. Use a complete HTTP or HTTPS URL.",
        );
      }
    }
    return {
      rawUrl: trimmed,
      objectId: hashObjectId.toLowerCase(),
      indexerOrigin,
      apiUrl: null,
      sv: null,
      encryptionKey: `SharingKey (${hashSharingKey.substring(0, 12)}…)`,
      sharingKey: hashSharingKey.toLowerCase(),
      filename,
    };
  }

  if (hashObjectId && !hashSharingKey) {
    throw new Error(
      "Link is missing a sharing key. Expected #sharing_key=<64-hex>&object=<64-hex>.",
    );
  }

  // Format B: Standard /objects/<id>/shared?sc=...&ss=...&sv=...#encryption_key=...&sharing_key=...
  const pathParts = urlObj.pathname.split("/").filter(Boolean);
  if (
    pathParts.length !== 3 ||
    pathParts[0] !== "objects" ||
    pathParts[2] !== "shared"
  ) {
    throw new Error(
      'Invalid share link path. Expected "/objects/<id>/shared" or "#sharing_key=...&object=...".',
    );
  }

  const objectId = pathParts[1];
  if (!HEX_64_RE.test(objectId)) {
    throw new Error(
      "Invalid Object ID format: expected 64-character hex string.",
    );
  }

  const sc = urlObj.searchParams.get("sc");
  const ss = urlObj.searchParams.get("ss");
  const sv = urlObj.searchParams.get("sv");
  if (!sc || !ss || !sv) {
    throw new Error(
      "Link is missing required cryptographic query parameters (sc, ss, sv).",
    );
  }

  if (!/^\d+$/.test(sv)) {
    throw new Error("Link contains an invalid validity timestamp (sv).");
  }

  const svNum = Number.parseInt(sv, 10);
  if (!Number.isSafeInteger(svNum) || svNum <= 0 || svNum > 8640000000000) {
    throw new Error("Link contains an invalid validity timestamp (sv).");
  }

  const encryptionKey = (hashParams.get("encryption_key") || "").trim();
  if (!encryptionKey) {
    throw new Error(
      "Link is missing the #encryption_key parameter required for client-side decryption.",
    );
  }

  if (!hashSharingKey) {
    throw new Error(
      "Link is missing a sharing key. Please append #sharing_key=<64-hex> (or &sharing_key=<64-hex>) to your share link.",
    );
  }

  return {
    rawUrl: trimmed,
    objectId: objectId.toLowerCase(),
    indexerOrigin: urlObj.origin,
    apiUrl: `${urlObj.origin}${urlObj.pathname}${urlObj.search}`,
    sv: svNum,
    encryptionKey,
    sharingKey: hashSharingKey.toLowerCase(),
    filename,
  };
}

// Fragments stay in the browser and are never included in HTTP requests.
export function shareLocationUrl(location, rawUrl) {
  const next = new URL(location);
  for (const key of [
    "url", "sc", "ss", "sv", "indexer", "sharing_key", "encryption_key",
    "object", "filename", "name",
  ]) next.searchParams.delete(key);
  next.hash = rawUrl ? `url=${encodeURIComponent(rawUrl)}` : "";
  return next;
}

export function extractShareUrlFromLocation(locationObj) {
  if (!locationObj) return null;
  const search = locationObj.search || "";
  const hash = locationObj.hash || "";

  if (hash.startsWith("#url=")) {
    const link = new URLSearchParams(hash.slice(1)).get("url")?.trim();
    return link && /^https?:\/\//i.test(link) ? link : null;
  }

  let linkParam = null;

  // Check if search contains ?url= or &url=
  const urlMatch = search.match(/(?:[?&])url=(.+)/);
  if (urlMatch) {
    const rawAfterUrl = urlMatch[1];
    if (/^https?%3A/i.test(rawAfterUrl)) {
      const urlParams = new URLSearchParams(search);
      linkParam = urlParams.get("url");
    } else if (/^https?:\/\//i.test(rawAfterUrl)) {
      // Raw unencoded URL pasted in search bar: preserve complete target URL
      linkParam = rawAfterUrl;
    } else {
      const urlParams = new URLSearchParams(search);
      linkParam = urlParams.get("url");
    }
  }

  // If linkParam is present and lacks hash, but locationObj.hash exists (browser placed hash at the end of location):
  if (linkParam && !linkParam.includes("#") && hash) {
    linkParam += hash;
  } else if (!linkParam && hash) {
    const hashBody = hash.replace(/^#/, "").trim();
    if (/^https?:\/\//i.test(hashBody)) {
      linkParam = hashBody;
    } else if (
      hashBody.includes("sharing_key=") &&
      hashBody.includes("object=")
    ) {
      const searchPart = search || "";
      linkParam = `${locationObj.origin}${locationObj.pathname}${searchPart}#${hashBody}`;
    }
  }

  return linkParam && /^https?:\/\//i.test(linkParam.trim())
    ? linkParam.trim()
    : null;
}

export function summarizeDescriptor(parsed, descriptor) {
  const slabs = Array.isArray(descriptor.slabs) ? descriptor.slabs : [];
  const hasSize = Number.isSafeInteger(descriptor.size) && descriptor.size >= 0;
  let totalBytes = hasSize ? descriptor.size : 0;
  let minShards = null;
  let slabTotalShards = null;
  let foundSlabWithSectors = false;
  const hostsMap = new Map();

  for (const slab of slabs) {
    if (!slab || typeof slab !== "object") continue;
    if (!hasSize && Number.isSafeInteger(slab.length) && slab.length > 0) {
      totalBytes += slab.length;
    }
    const shardVal = slab.minShards ?? slab.min_shards;
    if (minShards === null && Number.isSafeInteger(shardVal) && shardVal > 0) {
      minShards = shardVal;
    }
    const sectors = Array.isArray(slab.sectors) ? slab.sectors : [];
    if (sectors.length > 0 && !foundSlabWithSectors) {
      slabTotalShards = sectors.length;
      foundSlabWithSectors = true;
    }
    for (const sec of sectors) {
      const hk = sec && (sec.hostKey || sec.host_key);
      const root = sec && sec.root;
      if (typeof hk === "string" && typeof root === "string") {
        if (!hostsMap.has(hk)) hostsMap.set(hk, new Set());
        hostsMap.get(hk).add(root);
      }
    }
  }

  const totalHosts = hostsMap.size;
  const parityShards =
    minShards !== null && foundSlabWithSectors
      ? Math.max(0, slabTotalShards - minShards)
      : null;
  const isLongLived = parsed.sv > LONG_LIVED_EXPIRY_THRESHOLD;
  const expiryDate = parsed.sv === null ? null : new Date(parsed.sv * 1000);
  const isExpired = expiryDate !== null && expiryDate.getTime() <= Date.now();
  const fallbackName = `sia_${parsed.objectId.substring(0, 10)}.bin`;

  // Attempt to extract filename from pinnedObj metadata if not specified in link
  let metadataFilename = "";
  if (
    !parsed.filename &&
    descriptor.pinnedObj &&
    typeof descriptor.pinnedObj.metadata === "function"
  ) {
    try {
      const rawMeta = descriptor.pinnedObj.metadata();
      if (rawMeta && rawMeta.length > 0) {
        const text = new TextDecoder("utf-8", { fatal: true }).decode(rawMeta);
        try {
          const json = JSON.parse(text);
          if (json && typeof (json.name || json.filename) === "string") {
            metadataFilename = (json.name || json.filename).trim();
          }
        } catch (_) {
          if (/^[\w.\- ]+$/i.test(text.trim())) {
            metadataFilename = text.trim();
          }
        }
      }
    } catch (_) {}
  }

  const defaultFilename = parsed.filename || metadataFilename || fallbackName;

  return {
    totalBytes,
    minShards,
    parityShards,
    totalHosts,
    hostsMap,
    isLongLived,
    expiryDate,
    isExpired,
    fallbackName,
    defaultFilename,
  };
}
