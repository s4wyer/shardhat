# Shardhat

Download shared files from the [Sia](https://sia.tech) network in the browser. Shards are fetched from storage hosts over WebTransport using `sia_storage_wasm`, then reconstructed and decrypted locally.

## Usage

Paste a share link into the page, or pass it in the `url` fragment parameter:

```javascript
const link = `${location.origin}/#url=${encodeURIComponent(shareLink)}`;
```

## Share link formats

Signed object URL:

```text
https://sia.storage/objects/<object-id>/shared?sc=<context>&ss=<signature>&sv=<expiry>#encryption_key=<key>&sharing_key=<key>&filename=<name>
```

`sc`, `ss`, `sv`, `encryption_key`, and `sharing_key` (64-character hex seed) are required. `filename` (or `name`) is optional.

Downloads use `SharedSdk.object()` and authenticate through the user-supplied sharing key (`#sharing_key=<64-hex>`). The `encryption_key` fragment is displayed for inspection; it is not passed to the SDK. A signed metadata URL alone does not grant access without an attached sharing key.

Sharing key and object ID:

```text
https://sia.storage/?indexer=<origin>#sharing_key=<key>&object=<object-id>&filename=<name>
```

`sharing_key` and `object` are required. `indexer` defaults to `https://sia.storage`. Invalid overrides are rejected.

## Download behavior

The file picker streams to the selected file when supported. Otherwise, a service worker sends chunks into a native browser download. Its private message channel waits for consumption before sending the next chunk, limiting the bridge to one outstanding chunk of at most 1 MiB. Hosting under a subdirectory is supported.

When neither streaming option is available, the Blob fallback buffers at most 512 MiB. Files above that limit are rejected before transfer.

## Running locally

```bash
npm run dev
```

## Acknowledgements

[sialo_browser](https://github.com/Alrighttt/sialo_browser)
