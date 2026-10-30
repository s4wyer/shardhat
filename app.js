import {
  formatBytes,
  formatDuration,
  parseShareUrl,
  extractShareUrlFromLocation,
  shareLocationUrl,
  summarizeDescriptor,
} from "./url-parser.js";
import {
  prewarmSharedSdk,
  evictSharedSdk,
  releaseDescriptor,
  resolveShareDescriptor,
  openObjectDownloadStream,
} from "./sia-client.js";
import {
  registerDownloadServiceWorker,
  acquireDownloadSink,
} from "./download-sink.js";

const REQUEST_TIMEOUT_MS = 15000;
const ICON_DOWNLOAD_PATH = "M21 15v6H3v-6M7 10l5 5 5-5M12 15V3";
const ICON_CANCEL_PATH = "M6 6l12 12M18 6L6 18";

registerDownloadServiceWorker();

// DOM Elements
const lookupCard = document.getElementById("lookup-card");
const lookupForm = document.getElementById("lookup-form");
const shareUrlInput = document.getElementById("share-url-input");
const lookupBtn = document.getElementById("lookup-btn");
const cancelLookupBtn = document.getElementById("cancel-lookup-btn");
const changeLinkBtn = document.getElementById("change-link-btn");

const fileCard = document.getElementById("file-card");
const fileNameInput = document.getElementById("file-name-input");
const fileSizeDisplay = document.getElementById("file-size-display");
const fileNetworkSummary = document.getElementById("file-network-summary");
const fileExpiryDisplay = document.getElementById("file-expiry-display");

const downloadBtn = document.getElementById("download-btn");
const downloadBtnLabel = downloadBtn.querySelector("span");
const downloadBtnIconPath = downloadBtn.querySelector("svg path");
const downloadAlert = document.getElementById("download-alert");
const alertMessage = document.getElementById("alert-message");

const progressContainer = document.getElementById("progress-container");
const progressBar = document.getElementById("progress-bar");
const progressBarFill = document.getElementById("progress-bar-fill");
const progressStatus = document.getElementById("progress-status");
const progressPercent = document.getElementById("progress-percent");

const techObjectId = document.getElementById("tech-object-id");
const techSharingKey = document.getElementById("tech-sharing-key");
const techEncryptionKey = document.getElementById("tech-encryption-key");
const techRedundancy = document.getElementById("tech-redundancy");
const techValidity = document.getElementById("tech-validity");
const swarmCount = document.getElementById("swarm-count");
const techHostRows = document.getElementById("tech-host-rows");

let currentData = null;
let activeLookupController = null;
let activeDownloadController = null;
let isAcquiringSink = false;

function showError(msg) {
  alertMessage.textContent = msg || "An unexpected error occurred.";
  downloadAlert.style.display = "block";
}

function hideError() {
  downloadAlert.style.display = "none";
  alertMessage.textContent = "";
}

function setProgress(pct, statusText, isDanger = false) {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  progressBarFill.style.width = `${clamped}%`;
  progressBarFill.style.backgroundColor = isDanger
    ? "var(--danger-bar)"
    : "var(--action-bg)";
  if (progressBar) {
    progressBar.setAttribute("aria-valuenow", String(clamped));
  }
  progressStatus.textContent = statusText;
}

function setLookupBusy(busy) {
  lookupBtn.disabled = busy;
  lookupBtn.textContent = busy ? "Resolving..." : "Retrieve file";
  lookupForm.setAttribute("aria-busy", String(busy));
  cancelLookupBtn.style.display = busy || currentData ? "inline-flex" : "none";
}

function setDownloadButtonState(isDownloading) {
  if (isDownloading) {
    downloadBtnLabel.textContent = "Cancel download";
    downloadBtn.classList.add("is-cancelling");
    if (downloadBtnIconPath) {
      downloadBtnIconPath.setAttribute("d", ICON_CANCEL_PATH);
    }
    fileNameInput.readOnly = true;
    fileNameInput.title =
      "Filename cannot be changed during an active download";
  } else {
    downloadBtnLabel.textContent = "Download file";
    downloadBtn.classList.remove("is-cancelling");
    if (downloadBtnIconPath) {
      downloadBtnIconPath.setAttribute("d", ICON_DOWNLOAD_PATH);
    }
    fileNameInput.readOnly = false;
    fileNameInput.title = "Click to rename before downloading";
  }
}

function syncUrlBar(rawUrl) {
  try {
    const nextUrl = shareLocationUrl(window.location.href, rawUrl);
    window.history.replaceState(null, "", nextUrl.toString());
  } catch (_) {}
}

function showLookupView() {
  hideError();
  lookupCard.style.display = "flex";
  fileCard.style.display = "none";
  changeLinkBtn.style.display = "none";
  cancelLookupBtn.style.display = currentData ? "inline-flex" : "none";
  shareUrlInput.focus();
  shareUrlInput.select();
}

function showFileView() {
  lookupCard.style.display = "none";
  fileCard.style.display = "flex";
  changeLinkBtn.style.display = "inline-flex";
}

function renderHostSwarmRows(hostsMap) {
  techHostRows.textContent = "";
  let rowIdx = 1;
  hostsMap.forEach((roots, hostKey) => {
    for (const root of roots) {
      const tr = document.createElement("tr");

      const tdIdx = document.createElement("td");
      tdIdx.className = "cell-index";
      tdIdx.textContent = String(rowIdx++);

      const tdKey = document.createElement("td");
      tdKey.title = hostKey;
      const codeKey = document.createElement("code");
      codeKey.textContent = hostKey;
      tdKey.appendChild(codeKey);

      const tdRoot = document.createElement("td");
      tdRoot.title = root;
      const codeRoot = document.createElement("code");
      codeRoot.textContent = root;
      tdRoot.appendChild(codeRoot);

      tr.append(tdIdx, tdKey, tdRoot);
      techHostRows.appendChild(tr);
    }
  });
}

function displayFile(parsed, descriptor) {
  const summary = summarizeDescriptor(parsed, descriptor);
  if (currentData && currentData.descriptor !== descriptor) {
    releaseDescriptor(currentData.descriptor);
    if (
      currentData.parsed.indexerOrigin !== parsed.indexerOrigin ||
      currentData.parsed.sharingKey !== parsed.sharingKey
    ) {
      evictSharedSdk(
        currentData.parsed.indexerOrigin,
        currentData.parsed.sharingKey,
      );
    }
  }

  currentData = {
    parsed,
    descriptor,
    totalBytes: summary.totalBytes,
    fallbackName: summary.fallbackName,
    defaultFilename: summary.defaultFilename,
  };

  prewarmSharedSdk(parsed.indexerOrigin, parsed.sharingKey);

  // Reset progress UI from any prior file
  progressContainer.style.display = "none";
  setProgress(0, "Ready", false);
  progressPercent.textContent = "0%";
  setDownloadButtonState(false);
  downloadBtn.disabled = false;

  fileNameInput.value = summary.defaultFilename;
  fileSizeDisplay.textContent = formatBytes(summary.totalBytes);
  fileNetworkSummary.textContent = `${summary.totalHosts} Storage Nodes`;

  if (!summary.expiryDate) {
    fileExpiryDisplay.textContent = "Sharing key access";
    fileExpiryDisplay.style.color = "";
  } else if (summary.isLongLived) {
    fileExpiryDisplay.textContent = "Long-lived link";
    fileExpiryDisplay.style.color = "";
  } else if (summary.isExpired) {
    fileExpiryDisplay.textContent = `Expired on ${summary.expiryDate.toLocaleDateString()}`;
    fileExpiryDisplay.style.color = "var(--danger-text)";
  } else {
    fileExpiryDisplay.textContent = `Expires ${summary.expiryDate.toLocaleDateString()}`;
    fileExpiryDisplay.style.color = "";
  }

  techObjectId.textContent = parsed.objectId;
  techObjectId.title = parsed.objectId;
  if (techSharingKey) {
    techSharingKey.textContent = parsed.sharingKey;
    techSharingKey.title = parsed.sharingKey;
  }
  techEncryptionKey.textContent = parsed.encryptionKey;
  techEncryptionKey.title = parsed.encryptionKey;
  techRedundancy.textContent =
    summary.parityShards === null
      ? "Not supplied by indexer"
      : `${summary.minShards} data / ${summary.parityShards} parity shards (first slab)`;
  techValidity.textContent = !summary.expiryDate
    ? "Managed by the sharing key owner"
    : `${summary.expiryDate.toUTCString()}${summary.isExpired ? " (EXPIRED)" : ""}`;
  swarmCount.textContent = String(summary.totalHosts);

  renderHostSwarmRows(summary.hostsMap);
  showFileView();
  downloadBtn.focus();
}

async function resolveLink(parsed) {
  if (activeDownloadController || isAcquiringSink) return;
  if (activeLookupController) {
    activeLookupController.abort();
  }

  const controller = new AbortController();
  activeLookupController = controller;
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  setLookupBusy(true);
  syncUrlBar(parsed.rawUrl);
  hideError();

  try {
    const descriptor = await resolveShareDescriptor(parsed, controller.signal);
    if (controller.signal.aborted || activeLookupController !== controller) {
      releaseDescriptor(descriptor);
      return;
    }
    displayFile(parsed, descriptor);
  } catch (err) {
    if (activeLookupController !== controller) return;
    if (err && err.name === "AbortError") {
      if (activeLookupController === controller) {
        showError(
          "Request timed out while resolving share link. Please check your connection and try again.",
        );
      }
      return;
    }
    showError(err instanceof Error ? err.message : String(err));
  } finally {
    clearTimeout(timeoutId);
    if (activeLookupController === controller) {
      activeLookupController = null;
      setLookupBusy(false);
    }
  }
}

async function handleDownload() {
  if (!currentData || isAcquiringSink) return;

  if (activeDownloadController) {
    activeDownloadController.abort();
    return;
  }

  if (typeof WebTransport === "undefined") {
    showError(
      "Your browser does not support WebTransport (HTTP/3 QUIC), which is required to stream directly from Sia storage hosts. Please use Chrome, Edge, or Firefox.",
    );
    return;
  }

  const { parsed, descriptor, totalBytes, fallbackName } = currentData;
  const rawInputName = fileNameInput.value.trim();
  const saveName = rawInputName || parsed.filename || fallbackName;
  const abortController = new AbortController();

  isAcquiringSink = true;
  downloadBtn.disabled = true;
  changeLinkBtn.disabled = true;
  hideError();

  let sink = null;
  try {
    sink = await acquireDownloadSink(saveName, abortController);
  } catch (err) {
    showError(
      `Could not open the download destination: ${err instanceof Error ? err.message : String(err)}`,
    );
    return;
  } finally {
    isAcquiringSink = false;
    downloadBtn.disabled = false;
    changeLinkBtn.disabled = false;
  }

  if (!sink) {
    return; // User cancelled the native file save picker
  }

  activeDownloadController = abortController;
  changeLinkBtn.disabled = true;
  hideError();
  setDownloadButtonState(true);
  progressContainer.style.display = "flex";
  setProgress(0, "Initializing Sia WebTransport SDK...", false);
  progressPercent.textContent = "0%";

  let reader = null;

  // Ensure reader is aborted immediately when user cancels download
  const onCancelDownload = () => {
    if (reader) {
      reader.cancel().catch(() => {});
    }
  };
  abortController.signal.addEventListener("abort", onCancelDownload, {
    once: true,
  });

  try {
    const { reader: objReader, size: objSize } = await openObjectDownloadStream(
      parsed,
      descriptor,
      (stageText) => setProgress(0, stageText, false),
      abortController.signal,
    );
    reader = objReader;

    const expectedBytes = objSize ?? totalBytes;
    await sink.prepare(expectedBytes);

    let bytesReceived = 0;
    const startTime = performance.now();
    let lastSampleTime = startTime;
    let lastSampleBytes = 0;
    let smoothedSpeed = 0;
    let lastUiUpdate = 0;

    while (true) {
      if (abortController.signal.aborted) {
        throw new DOMException("Download cancelled", "AbortError");
      }

      const { done, value } = await reader.read();
      if (abortController.signal.aborted) {
        throw new DOMException("Download cancelled", "AbortError");
      }
      if (done) break;
      if (bytesReceived + value.byteLength > expectedBytes) {
        throw new Error("Received more data than the expected file size.");
      }

      await sink.write(value);
      bytesReceived += value.byteLength;

      const now = performance.now();
      if (
        now - lastUiUpdate >= 120 ||
        (expectedBytes > 0 && bytesReceived >= expectedBytes)
      ) {
        const dtSec = (now - lastSampleTime) / 1000;
        if (dtSec >= 0.25) {
          const instantSpeed = (bytesReceived - lastSampleBytes) / dtSec;
          smoothedSpeed =
            smoothedSpeed === 0
              ? instantSpeed
              : smoothedSpeed * 0.7 + instantSpeed * 0.3;
          lastSampleTime = now;
          lastSampleBytes = bytesReceived;
        }

        const fallbackSpeed =
          bytesReceived / Math.max(0.001, (now - startTime) / 1000);
        const displaySpeed = smoothedSpeed > 0 ? smoothedSpeed : fallbackSpeed;
        const pct =
          expectedBytes > 0
            ? Math.min(100, Math.round((bytesReceived / expectedBytes) * 100))
            : 0;

        let etaSuffix = "";
        if (expectedBytes > bytesReceived && displaySpeed > 0) {
          const etaFormatted = formatDuration(
            (expectedBytes - bytesReceived) / displaySpeed,
          );
          if (etaFormatted) {
            etaSuffix = ` · ~${etaFormatted} left`;
          }
        }

        lastUiUpdate = now;
        progressPercent.textContent = `${pct}%`;
        const totalDisplay =
          expectedBytes > 0 ? formatBytes(expectedBytes) : "Unknown";
        setProgress(
          pct,
          `Downloading: ${formatBytes(bytesReceived)} / ${totalDisplay} (${formatBytes(displaySpeed)}/s${etaSuffix})`,
          false,
        );
      }
    }

    abortController.signal.throwIfAborted();
    if (bytesReceived !== expectedBytes) {
      throw new Error(
        `Incomplete download: expected ${formatBytes(expectedBytes)}, received ${formatBytes(bytesReceived)}.`,
      );
    }
    setProgress(100, "Writing and finalizing file to disk...", false);
    await sink.close();

    const totalElapsedSec = Math.max(
      0.001,
      (performance.now() - startTime) / 1000,
    );
    const avgSpeed = bytesReceived / totalElapsedSec;
    progressPercent.textContent = "100%";
    setProgress(
      100,
      `Complete — ${formatBytes(bytesReceived)} in ${formatDuration(totalElapsedSec)} (${formatBytes(avgSpeed)}/s)`,
      false,
    );
  } catch (err) {
    if (reader) {
      try {
        await reader.cancel();
      } catch (_) {}
    }
    try {
      await sink.abort(err);
    } catch (_) {}

    const isCancelled =
      (err && err.name === "AbortError") || abortController.signal.aborted;
    if (isCancelled) {
      progressPercent.textContent = "Cancelled";
      setProgress(0, "Download cancelled.", false);
    } else {
      evictSharedSdk(parsed.indexerOrigin, parsed.sharingKey);
      progressPercent.textContent = "Failed";
      setProgress(100, "Download interrupted.", true);
      const rawMsg = err instanceof Error ? err.message : String(err);
      if (
        rawMsg.includes("404") ||
        rawMsg.toLowerCase().includes("not found")
      ) {
        showError(
          "Object is not attached to the supplied sharing key, or is no longer pinned.",
        );
      } else {
        showError(`Download failed: ${rawMsg}`);
      }
    }
  } finally {
    try {
      reader?.releaseLock();
    } catch (_) {}
    abortController.signal.removeEventListener("abort", onCancelDownload);
    if (activeDownloadController === abortController) {
      activeDownloadController = null;
    }
    setDownloadButtonState(false);
    downloadBtn.disabled = false;
    changeLinkBtn.disabled = false;
  }
}

// Warn before closing tab while a download is actively streaming
window.addEventListener("beforeunload", (e) => {
  if (activeDownloadController) {
    e.preventDefault();
    e.returnValue = "";
  }
});

lookupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  try {
    const parsed = parseShareUrl(shareUrlInput.value);
    resolveLink(parsed);
  } catch (err) {
    showError(err instanceof Error ? err.message : String(err));
  }
});

changeLinkBtn.addEventListener("click", () => {
  if (activeDownloadController || isAcquiringSink) return;
  if (activeLookupController) {
    activeLookupController.abort();
    activeLookupController = null;
  }
  if (activeDownloadController) {
    activeDownloadController.abort();
  }
  syncUrlBar(null);
  setLookupBusy(false);
  showLookupView();
});

cancelLookupBtn.addEventListener("click", () => {
  if (activeLookupController) {
    activeLookupController.abort();
    activeLookupController = null;
  }
  setLookupBusy(false);
  if (currentData) {
    hideError();
    showFileView();
    syncUrlBar(currentData.parsed.rawUrl);
    downloadBtn.focus();
  } else {
    syncUrlBar(null);
    hideError();
    shareUrlInput.focus();
  }
});

downloadBtn.addEventListener("click", handleDownload);

fileNameInput.addEventListener("blur", () => {
  if (currentData && !fileNameInput.value.trim()) {
    fileNameInput.value = currentData.defaultFilename;
  }
});

fileNameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    fileNameInput.blur();
  } else if (e.key === "Escape") {
    e.preventDefault();
    if (currentData) {
      fileNameInput.value = currentData.defaultFilename;
    }
    fileNameInput.blur();
  }
});

// Handle browser navigation (back/forward)
window.addEventListener("popstate", () => {
  if (activeDownloadController || isAcquiringSink) {
    syncUrlBar(currentData.parsed.rawUrl);
    return;
  }
  const link = extractShareUrlFromLocation(window.location);
  if (!link) {
    activeLookupController?.abort();
    activeLookupController = null;
    setLookupBusy(false);
    showLookupView();
    return;
  }
  if (link && (!currentData || currentData.parsed.rawUrl !== link)) {
    shareUrlInput.value = link;
    try {
      const parsed = parseShareUrl(link);
      resolveLink(parsed);
    } catch (err) {
      showError(err instanceof Error ? err.message : String(err));
    }
  }
});

// Initialize from URL query parameters or hash if present
const initialLink = extractShareUrlFromLocation(window.location);
if (initialLink) {
  // Remove legacy query credentials before metadata requests or a later reload.
  syncUrlBar(initialLink);
  shareUrlInput.value = initialLink;
  try {
    const parsed = parseShareUrl(initialLink);
    resolveLink(parsed);
  } catch (err) {
    showError(err instanceof Error ? err.message : String(err));
  }
}
