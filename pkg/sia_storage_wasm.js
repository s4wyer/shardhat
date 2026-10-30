/* @ts-self-types="./sia_storage_wasm.d.ts" */

/**
 * An application key used for authentication with the indexer.
 *
 * AppKeys are derived from a BIP-39 recovery phrase during registration.
 * They can be exported as a 32-byte seed and re-imported for future
 * connections. The key must be stored securely — anyone with access
 * can authenticate as the user.
 */
export class AppKey {
    static __wrap(ptr) {
        const obj = Object.create(AppKey.prototype);
        obj.__wbg_ptr = ptr;
        AppKeyFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        AppKeyFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_appkey_free(ptr, 0);
    }
    /**
     * Exports the AppKey as a 32-byte seed (Uint8Array).
     * @returns {Uint8Array}
     */
    export() {
        const ret = wasm.appkey_export(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * Imports an AppKey from a 32-byte seed (Uint8Array).
     * @param {Uint8Array} seed
     */
    constructor(seed) {
        const ptr0 = passArray8ToWasm0(seed, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.appkey_new(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0];
        AppKeyFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Returns the ed25519 public key as a string (e.g. "ed25519:abc123...").
     * @returns {string}
     */
    publicKey() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.appkey_publicKey(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Signs a message and returns the 64-byte ed25519 signature (Uint8Array).
     * @param {Uint8Array} message
     * @returns {Uint8Array}
     */
    sign(message) {
        const ptr0 = passArray8ToWasm0(message, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.appkey_sign(this.__wbg_ptr, ptr0, len0);
        var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v2;
    }
    /**
     * Verifies a signature for a given message.
     * Returns true if the signature is valid.
     * @param {Uint8Array} message
     * @param {Uint8Array} signature
     * @returns {boolean}
     */
    verifySignature(message, signature) {
        const ptr0 = passArray8ToWasm0(message, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(signature, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.appkey_verifySignature(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] !== 0;
    }
}
if (Symbol.dispose) AppKey.prototype[Symbol.dispose] = AppKey.prototype.free;

/**
 * SDK Builder — handles the connection and registration flow with an indexer.
 */
export class Builder {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        BuilderFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_builder_free(ptr, 0);
    }
    /**
     * Connects using a pre-authorized key, bypassing the interactive approval
     * flow, and returns a Sdk. `preAuthorizedKeySeed` is the 32-byte
     * pre-authorized private key (Uint8Array); `mnemonic` derives the app key.
     * @param {Uint8Array} pre_authorized_key_seed
     * @param {string} mnemonic
     * @returns {Promise<Sdk>}
     */
    connectPreAuthorized(pre_authorized_key_seed, mnemonic) {
        const ptr0 = passArray8ToWasm0(pre_authorized_key_seed, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(mnemonic, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.builder_connectPreAuthorized(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        return ret;
    }
    /**
     * Attempts to connect using an existing AppKey.
     * Returns a Sdk if the key is valid, or undefined if not registered.
     * @param {AppKey} app_key
     * @returns {Promise<Sdk | undefined>}
     */
    connected(app_key) {
        _assertClass(app_key, AppKey);
        const ret = wasm.builder_connected(this.__wbg_ptr, app_key.__wbg_ptr);
        return ret;
    }
    /**
     * Returns whether `mnemonic` derives an application key that is already
     * registered with the indexer. Unlike `register`, the builder remains
     * usable. Only valid after `waitForApproval` has resolved.
     * @param {string} mnemonic
     * @returns {Promise<boolean>}
     */
    matchesExistingAppKey(mnemonic) {
        const ptr0 = passStringToWasm0(mnemonic, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.builder_matchesExistingAppKey(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * @param {string} indexer_url
     * @param {AppMetadata} app
     */
    constructor(indexer_url, app) {
        const ptr0 = passStringToWasm0(indexer_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.builder_new(ptr0, len0, app);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0];
        BuilderFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Returns whether the connect key the user approved with already has an
     * account for this application. Only valid after `waitForApproval` has
     * resolved.
     *
     * The connect key may have accounts under more than one recovery phrase.
     * Use `matchesExistingAppKey` to check a particular phrase.
     * @returns {boolean}
     */
    reconnecting() {
        const ret = wasm.builder_reconnecting(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] !== 0;
    }
    /**
     * Completes registration and returns a Sdk instance.
     *
     * A different recovery phrase registers a new application key even when
     * `reconnecting()` is true.
     * @param {string} mnemonic
     * @returns {Promise<Sdk>}
     */
    register(mnemonic) {
        const ptr0 = passStringToWasm0(mnemonic, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.builder_register(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * Requests connection approval from the indexer.
     * @returns {Promise<void>}
     */
    requestConnection() {
        const ret = wasm.builder_requestConnection(this.__wbg_ptr);
        return ret;
    }
    /**
     * Returns the approval URL the user must visit.
     * @returns {string}
     */
    responseUrl() {
        let deferred2_0;
        let deferred2_1;
        try {
            const ret = wasm.builder_responseUrl(this.__wbg_ptr);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Waits for the user to approve the connection request.
     * @returns {Promise<void>}
     */
    waitForApproval() {
        const ret = wasm.builder_waitForApproval(this.__wbg_ptr);
        return ret;
    }
}
if (Symbol.dispose) Builder.prototype[Symbol.dispose] = Builder.prototype.free;

class IntoUnderlyingByteSource {
    static __wrap(ptr) {
        const obj = Object.create(IntoUnderlyingByteSource.prototype);
        obj.__wbg_ptr = ptr;
        IntoUnderlyingByteSourceFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        IntoUnderlyingByteSourceFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_intounderlyingbytesource_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get autoAllocateChunkSize() {
        const ret = wasm.intounderlyingbytesource_autoAllocateChunkSize(this.__wbg_ptr);
        return ret >>> 0;
    }
    cancel() {
        const ptr = this.__destroy_into_raw();
        wasm.intounderlyingbytesource_cancel(ptr);
    }
    /**
     * @param {ReadableByteStreamController} controller
     * @returns {Promise<any>}
     */
    pull(controller) {
        const ret = wasm.intounderlyingbytesource_pull(this.__wbg_ptr, controller);
        return ret;
    }
    /**
     * @param {ReadableByteStreamController} controller
     */
    start(controller) {
        wasm.intounderlyingbytesource_start(this.__wbg_ptr, controller);
    }
    /**
     * @returns {ReadableStreamType}
     */
    get type() {
        const ret = wasm.intounderlyingbytesource_type(this.__wbg_ptr);
        return __wbindgen_enum_ReadableStreamType[ret];
    }
}
if (Symbol.dispose) IntoUnderlyingByteSource.prototype[Symbol.dispose] = IntoUnderlyingByteSource.prototype.free;

class IntoUnderlyingSink {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        IntoUnderlyingSinkFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_intounderlyingsink_free(ptr, 0);
    }
    /**
     * @param {any} reason
     * @returns {Promise<any>}
     */
    abort(reason) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.intounderlyingsink_abort(ptr, reason);
        return ret;
    }
    /**
     * @returns {Promise<any>}
     */
    close() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.intounderlyingsink_close(ptr);
        return ret;
    }
    /**
     * @param {any} chunk
     * @returns {Promise<any>}
     */
    write(chunk) {
        const ret = wasm.intounderlyingsink_write(this.__wbg_ptr, chunk);
        return ret;
    }
}
if (Symbol.dispose) IntoUnderlyingSink.prototype[Symbol.dispose] = IntoUnderlyingSink.prototype.free;

class IntoUnderlyingSource {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        IntoUnderlyingSourceFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_intounderlyingsource_free(ptr, 0);
    }
    cancel() {
        const ptr = this.__destroy_into_raw();
        wasm.intounderlyingsource_cancel(ptr);
    }
    /**
     * @param {ReadableStreamDefaultController} controller
     * @returns {Promise<any>}
     */
    pull(controller) {
        const ret = wasm.intounderlyingsource_pull(this.__wbg_ptr, controller);
        return ret;
    }
}
if (Symbol.dispose) IntoUnderlyingSource.prototype[Symbol.dispose] = IntoUnderlyingSource.prototype.free;

/**
 * The indexer's record for a sharing key, including how many objects it grants
 * access to and how much space they use. The counts are a snapshot, not a live
 * view.
 */
export class KeyRecord {
    static __wrap(ptr) {
        const obj = Object.create(KeyRecord.prototype);
        obj.__wbg_ptr = ptr;
        KeyRecordFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        KeyRecordFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_keyrecord_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get description() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.keyrecord_description(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The key this record describes.
     * @returns {SharingKey}
     */
    get key() {
        const ret = wasm.keyrecord_key(this.__wbg_ptr);
        return SharingKey.__wrap(ret);
    }
    /**
     * A snapshot of how many objects the key grants access to and how much
     * space they use.
     * @returns {KeyStats}
     */
    get stats() {
        const ret = wasm.keyrecord_stats(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
}
if (Symbol.dispose) KeyRecord.prototype[Symbol.dispose] = KeyRecord.prototype.free;

/**
 * An object event from the indexer.
 */
export class ObjectEvent {
    static __wrap(ptr) {
        const obj = Object.create(ObjectEvent.prototype);
        obj.__wbg_ptr = ptr;
        ObjectEventFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ObjectEventFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_objectevent_free(ptr, 0);
    }
    /**
     * @returns {boolean}
     */
    get deleted() {
        const ret = wasm.objectevent_deleted(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {string}
     */
    get id() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.objectevent_id(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Returns the object associated with this event, if it exists.
     * @returns {PinnedObject | undefined}
     */
    get object() {
        const ret = wasm.objectevent_object(this.__wbg_ptr);
        return ret === 0 ? undefined : PinnedObject.__wrap(ret);
    }
    /**
     * Returns the time the event occurred.
     * @returns {Date}
     */
    get updatedAt() {
        const ret = wasm.objectevent_updatedAt(this.__wbg_ptr);
        return ret;
    }
}
if (Symbol.dispose) ObjectEvent.prototype[Symbol.dispose] = ObjectEvent.prototype.free;

/**
 * An object listed without its slabs, as `SharedSdk.objectSummaries` returns
 * it. It describes the object but cannot be downloaded. Fetch the full
 * object with `SharedSdk.object(id)` to download it.
 */
export class ObjectSummary {
    static __wrap(ptr) {
        const obj = Object.create(ObjectSummary.prototype);
        obj.__wbg_ptr = ptr;
        ObjectSummaryFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ObjectSummaryFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_objectsummary_free(ptr, 0);
    }
    /**
     * The creation time.
     * @returns {Date}
     */
    get createdAt() {
        const ret = wasm.objectsummary_createdAt(this.__wbg_ptr);
        return ret;
    }
    /**
     * The object's ID as a hex string.
     * @returns {string}
     */
    get id() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.objectsummary_id(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The object's decrypted metadata.
     * @returns {Uint8Array}
     */
    get metadata() {
        const ret = wasm.objectsummary_metadata(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * The object's size in bytes.
     * @returns {number}
     */
    get size() {
        const ret = wasm.objectsummary_size(this.__wbg_ptr);
        return ret;
    }
    /**
     * The last updated time.
     * @returns {Date}
     */
    get updatedAt() {
        const ret = wasm.objectsummary_updatedAt(this.__wbg_ptr);
        return ret;
    }
}
if (Symbol.dispose) ObjectSummary.prototype[Symbol.dispose] = ObjectSummary.prototype.free;

/**
 * A packed upload handle for efficiently uploading multiple objects
 * together. Objects are packed into shared slabs to avoid wasting storage.
 *
 * ```js
 * const packed = sdk.uploadPacked();
 * await packed.add(file1.stream());
 * await packed.add(file2.stream());
 * const objects = await packed.finalize();
 * for (const obj of objects) await sdk.pinObject(obj);
 * ```
 */
export class PackedUpload {
    static __wrap(ptr) {
        const obj = Object.create(PackedUpload.prototype);
        obj.__wbg_ptr = ptr;
        PackedUploadFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PackedUploadFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_packedupload_free(ptr, 0);
    }
    /**
     * Adds a new object to the upload. The data is read until EOF and packed into
     * the current slab. Returns the number of bytes consumed; call
     * [finalize](Self::finalize) once all objects have been added to get the
     * resulting objects.
     *
     * If the reader errors part-way, it's safe to continue calling
     * [add](Self::add); no object is registered for the failed call. Or call
     * [finalize](Self::finalize) to collect the objects added so far. Bytes
     * read before the error remain in the current slab as padding and stay
     * counted in [length](Self::length) and [remaining](Self::remaining).
     *
     * ```js
     * const packed = sdk.uploadPacked();
     * await packed.add(file.stream());
     * await packed.add(blob.stream());
     * const objects = await packed.finalize();
     * ```
     * @param {ReadableStream} stream
     * @returns {Promise<number>}
     */
    add(stream) {
        const ret = wasm.packedupload_add(this.__wbg_ptr, stream);
        return ret;
    }
    /**
     * Cancels the packed upload. Immediately interrupts any in-flight `add`
     * and aborts all pending slab uploads.
     */
    cancel() {
        wasm.packedupload_cancel(this.__wbg_ptr);
    }
    /**
     * Finalizes the packed upload and returns the resulting objects.
     * Each object must be pinned separately with `sdk.pinObject()`.
     * @returns {Promise<PinnedObject[]>}
     */
    finalize() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.packedupload_finalize(ptr);
        return ret;
    }
    /**
     * Total bytes added so far across all objects.
     * @returns {number}
     */
    length() {
        const ret = wasm.packedupload_length(this.__wbg_ptr);
        return ret;
    }
    /**
     * Optimal size of each slab in bytes.
     * @returns {number}
     */
    optimalDataSize() {
        const ret = wasm.packedupload_optimalDataSize(this.__wbg_ptr);
        return ret;
    }
    /**
     * Bytes remaining until the current slab is full. Adding objects that
     * fit within this size avoids starting a new slab and minimizes padding.
     * @returns {number}
     */
    remaining() {
        const ret = wasm.packedupload_remaining(this.__wbg_ptr);
        return ret;
    }
    /**
     * Number of slabs in the upload.
     * @returns {number}
     */
    slabs() {
        const ret = wasm.packedupload_slabs(this.__wbg_ptr);
        return ret;
    }
}
if (Symbol.dispose) PackedUpload.prototype[Symbol.dispose] = PackedUpload.prototype.free;

/**
 * An object stored on the Sia network. JS holds this as an opaque handle
 * and passes it back to Rust for operations like pin, download, share, and
 * metadata updates. The internal state (encryption keys, slab data) cannot
 * be serialized to JS.
 */
export class PinnedObject {
    static __wrap(ptr) {
        const obj = Object.create(PinnedObject.prototype);
        obj.__wbg_ptr = ptr;
        PinnedObjectFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PinnedObjectFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pinnedobject_free(ptr, 0);
    }
    /**
     * Returns the creation time.
     * @returns {Date}
     */
    createdAt() {
        const ret = wasm.pinnedobject_createdAt(this.__wbg_ptr);
        return ret;
    }
    /**
     * Returns the encoded (on-network) size after erasure coding.
     * @returns {number}
     */
    encodedSize() {
        const ret = wasm.pinnedobject_encodedSize(this.__wbg_ptr);
        return ret;
    }
    /**
     * Returns the object's ID as a hex string.
     * @returns {string}
     */
    id() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.pinnedobject_id(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Returns the object's metadata as raw bytes.
     * @returns {Uint8Array}
     */
    metadata() {
        const ret = wasm.pinnedobject_metadata(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * Creates a new empty object.
     */
    constructor() {
        const ret = wasm.pinnedobject_new();
        this.__wbg_ptr = ret;
        PinnedObjectFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Opens a previously sealed object.
     * @param {AppKey} app_key
     * @param {SealedObject} sealed_obj
     * @returns {PinnedObject}
     */
    static open(app_key, sealed_obj) {
        _assertClass(app_key, AppKey);
        const ret = wasm.pinnedobject_open(app_key.__wbg_ptr, sealed_obj);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PinnedObject.__wrap(ret[0]);
    }
    /**
     * Seals the object for offline storage.
     * @param {AppKey} app_key
     * @returns {SealedObject}
     */
    seal(app_key) {
        _assertClass(app_key, AppKey);
        const ret = wasm.pinnedobject_seal(this.__wbg_ptr, app_key.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Returns the total size of the object in bytes.
     * @returns {number}
     */
    size() {
        const ret = wasm.pinnedobject_size(this.__wbg_ptr);
        return ret;
    }
    /**
     * Returns the slabs that make up the object.
     * @returns {Slab[]}
     */
    slabs() {
        const ret = wasm.pinnedobject_slabs(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Returns a new object truncated to the requested length.
     * @param {bigint} length
     * @returns {PinnedObject}
     */
    truncate(length) {
        const ret = wasm.pinnedobject_truncate(this.__wbg_ptr, length);
        return PinnedObject.__wrap(ret);
    }
    /**
     * Updates the object's metadata.
     * @param {Uint8Array} metadata
     */
    updateMetadata(metadata) {
        const ptr0 = passArray8ToWasm0(metadata, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.pinnedobject_updateMetadata(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * Returns the last updated time.
     * @returns {Date}
     */
    updatedAt() {
        const ret = wasm.pinnedobject_updatedAt(this.__wbg_ptr);
        return ret;
    }
}
if (Symbol.dispose) PinnedObject.prototype[Symbol.dispose] = PinnedObject.prototype.free;

/**
 * The main Sia storage SDK. Provides methods for uploading, downloading,
 * and managing objects on the Sia storage network via an indexer.
 */
export class Sdk {
    static __wrap(ptr) {
        const obj = Object.create(Sdk.prototype);
        obj.__wbg_ptr = ptr;
        SdkFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SdkFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_sdk_free(ptr, 0);
    }
    /**
     * Returns account information from the indexer.
     * @returns {Account}
     */
    account() {
        const ret = wasm.sdk_account(this.__wbg_ptr);
        return ret;
    }
    /**
     * Returns the AppKey used by this SDK instance.
     * @returns {AppKey}
     */
    appKey() {
        const ret = wasm.sdk_appKey(this.__wbg_ptr);
        return AppKey.__wrap(ret);
    }
    /**
     * Creates a sharing key. Attach objects to it with `Sdk.shareObject`.
     * @param {string} description
     * @param {Date | null} [expires_at]
     * @returns {Promise<SharingKey>}
     */
    createSharingKey(description, expires_at) {
        const ptr0 = passStringToWasm0(description, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.sdk_createSharingKey(this.__wbg_ptr, ptr0, len0, isLikeNone(expires_at) ? 0 : addToExternrefTable0(expires_at));
        return ret;
    }
    /**
     * Deletes an object from the indexer by its hex ID.
     * @param {string} key_hex
     * @returns {Promise<void>}
     */
    deleteObject(key_hex) {
        const ptr0 = passStringToWasm0(key_hex, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.sdk_deleteObject(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * Downloads an object and returns a `ReadableStream` of `Uint8Array` chunks.
     *
     * ```js
     * // as a blob
     * const stream = sdk.download(obj);
     * const blob = await new Response(stream).blob();
     *
     * // as a stream
     * for await (const chunk of sdk.download(obj)) {
     *   console.log('got', chunk.length, 'bytes');
     * }
     * ```
     * @param {PinnedObject} object
     * @param {DownloadOptions} [options]
     * @returns {ReadableStream}
     */
    download(object, options) {
        _assertClass(object, PinnedObject);
        const ret = wasm.sdk_download(this.__wbg_ptr, object.__wbg_ptr, isLikeNone(options) ? 0 : addToExternrefTable0(options));
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Returns a list of usable hosts, optionally filtered by a HostQuery.
     * @param {HostQuery | null} [query]
     * @returns {Host[]}
     */
    hosts(query) {
        const ret = wasm.sdk_hosts(this.__wbg_ptr, isLikeNone(query) ? 0 : addToExternrefTable0(query));
        return ret;
    }
    /**
     * Places `object` on this indexer, moving only the shards it will not
     * accept as they stand.
     *
     * `source` is the indexer that currently holds the object: it knows where
     * the sectors live and can read them, which this one may not be able to
     * do at all. The object keeps its ID, so the result is the same object in
     * two places rather than a copy.
     *
     * `onProgress` is called with a `RepairEvent` as each shard starts and
     * finishes. One shard can take seconds, so a caller that only saw
     * completions would show nothing at all while the first was in progress.
     * @param {PinnedObject} object
     * @param {Sdk} source
     * @param {Function | null} [on_progress]
     * @returns {RepairReport}
     */
    migrateObject(object, source, on_progress) {
        _assertClass(object, PinnedObject);
        _assertClass(source, Sdk);
        const ret = wasm.sdk_migrateObject(this.__wbg_ptr, object.__wbg_ptr, source.__wbg_ptr, isLikeNone(on_progress) ? 0 : addToExternrefTable0(on_progress));
        return ret;
    }
    /**
     * Retrieves an object from the indexer by its hex ID.
     * Returns a `PinnedObject` handle for use with download, share, seal, etc.
     * @param {string} key_hex
     * @returns {Promise<PinnedObject>}
     */
    object(key_hex) {
        const ptr0 = passStringToWasm0(key_hex, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.sdk_object(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * Returns object events for syncing local state with the indexer.
     * @param {ObjectsCursor | null | undefined} cursor
     * @param {number} limit
     * @returns {Promise<ObjectEvent[]>}
     */
    objectEvents(cursor, limit) {
        const ret = wasm.sdk_objectEvents(this.__wbg_ptr, cursor, limit);
        return ret;
    }
    /**
     * Resolves a share URL (sia://...) and returns the shared object.
     * The encryption key is extracted from the URL fragment (never sent
     * to the indexer).
     * @param {string} share_url
     * @returns {Promise<PinnedObject>}
     */
    objectFromShareUrl(share_url) {
        const ptr0 = passStringToWasm0(share_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.sdk_objectFromShareUrl(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * What this indexer makes of an object, without changing anything.
     *
     * Answered from the host list already in memory, so it costs nothing and
     * contacts no host. Ask it of two SDKs and you get two answers, which is
     * the point: an object is readable wherever `minShards` sectors survive,
     * but is only accepted by an indexer holding contracts with nearly all
     * the hosts it sits on.
     * @param {PinnedObject} object
     * @returns {ObjectHealth}
     */
    objectHealth(object) {
        _assertClass(object, PinnedObject);
        const ret = wasm.sdk_objectHealth(this.__wbg_ptr, object.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Generates a signed share URL for an object. Anyone with the URL can
     * download and decrypt the object until `validUntil`.
     * @param {PinnedObject} object
     * @param {Date} valid_until
     * @returns {string}
     */
    objectShareUrl(object, valid_until) {
        let deferred2_0;
        let deferred2_1;
        try {
            _assertClass(object, PinnedObject);
            const ret = wasm.sdk_objectShareUrl(this.__wbg_ptr, object.__wbg_ptr, valid_until);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Pins an object to the indexer so it persists beyond temporary storage.
     * @param {PinnedObject} object
     * @returns {Promise<void>}
     */
    pinObject(object) {
        _assertClass(object, PinnedObject);
        const ret = wasm.sdk_pinObject(this.__wbg_ptr, object.__wbg_ptr);
        return ret;
    }
    /**
     * Prunes unused slabs from the indexer.
     *
     * `before` prunes only slabs pinned before that date. Omitting it leaves
     * the cutoff to the indexer.
     * @param {Date | null} [before]
     * @returns {Promise<void>}
     */
    pruneSlabs(before) {
        const ret = wasm.sdk_pruneSlabs(this.__wbg_ptr, isLikeNone(before) ? 0 : addToExternrefTable0(before));
        return ret;
    }
    /**
     * Deletes a sharing key along with all of its attachments, revoking
     * recipients' access. Account tokens already issued stay valid until they
     * expire, so a download in flight can keep reading for up to five minutes.
     * @param {SharingKey} key
     * @returns {Promise<void>}
     */
    revokeSharingKey(key) {
        _assertClass(key, SharingKey);
        const ret = wasm.sdk_revokeSharingKey(this.__wbg_ptr, key.__wbg_ptr);
        return ret;
    }
    /**
     * Attaches an object to a sharing key, re-sealing its encryption keys under
     * the key so recipients can decrypt it. Attaching an already-attached
     * object replaces its re-sealed keys, so a failed call can be retried.
     * @param {SharingKey} key
     * @param {PinnedObject} object
     * @returns {Promise<void>}
     */
    shareObject(key, object) {
        _assertClass(key, SharingKey);
        _assertClass(object, PinnedObject);
        const ret = wasm.sdk_shareObject(this.__wbg_ptr, key.__wbg_ptr, object.__wbg_ptr);
        return ret;
    }
    /**
     * Lists and decrypts a page of the objects a sharing key grants access to.
     * @param {SharingKey} key
     * @param {number} offset
     * @param {number} limit
     * @returns {Promise<PinnedObject[]>}
     */
    sharedObjects(key, offset, limit) {
        _assertClass(key, SharingKey);
        const ret = wasm.sdk_sharedObjects(this.__wbg_ptr, key.__wbg_ptr, offset, limit);
        return ret;
    }
    /**
     * Fetches the indexer's record for a key, including its counts.
     * @param {SharingKey} key
     * @returns {Promise<KeyRecord>}
     */
    sharingKey(key) {
        _assertClass(key, SharingKey);
        const ret = wasm.sdk_sharingKey(this.__wbg_ptr, key.__wbg_ptr);
        return ret;
    }
    /**
     * Lists the account's sharing keys, most recently created first.
     * @param {number} offset
     * @param {number} limit
     * @returns {Promise<KeyRecord[]>}
     */
    sharingKeys(offset, limit) {
        const ret = wasm.sdk_sharingKeys(this.__wbg_ptr, offset, limit);
        return ret;
    }
    /**
     * Detaches an object from a sharing key, leaving the key and its other
     * attachments in place.
     * @param {SharingKey} key
     * @param {string} id
     * @returns {Promise<void>}
     */
    unshareObject(key, id) {
        _assertClass(key, SharingKey);
        const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.sdk_unshareObject(this.__wbg_ptr, key.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * Updates an object's metadata on the indexer.
     * @param {PinnedObject} object
     * @returns {Promise<void>}
     */
    updateObjectMetadata(object) {
        _assertClass(object, PinnedObject);
        const ret = wasm.sdk_updateObjectMetadata(this.__wbg_ptr, object.__wbg_ptr);
        return ret;
    }
    /**
     * Uploads data from a `ReadableStream` to the Sia network.
     *
     * Pass an existing `PinnedObject` to append new slabs to it, or `null`
     * for a new upload. Appending changes the object's ID — the caller must
     * re-pin and update any references to the old ID.
     *
     * ```js
     * const obj = await sdk.upload(new PinnedObject(), file.stream());
     * await sdk.pinObject(obj);
     * ```
     * @param {PinnedObject} object
     * @param {ReadableStream} source
     * @param {UploadOptions} [options]
     * @returns {Promise<PinnedObject>}
     */
    upload(object, source, options) {
        _assertClass(object, PinnedObject);
        var ptr0 = object.__destroy_into_raw();
        const ret = wasm.sdk_upload(this.__wbg_ptr, ptr0, source, isLikeNone(options) ? 0 : addToExternrefTable0(options));
        return ret;
    }
    /**
     * Starts a packed upload for efficiently uploading multiple small objects.
     * Objects smaller than the slab size (~40 MiB) are packed into shared slabs
     * to avoid wasting storage. Call `add(data)` for each object, then
     * `finalize()` to get the resulting `PinnedObject` handles.
     * @param {PackedUploadOptions} [options]
     * @returns {PackedUpload}
     */
    uploadPacked(options) {
        const ret = wasm.sdk_uploadPacked(this.__wbg_ptr, isLikeNone(options) ? 0 : addToExternrefTable0(options));
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PackedUpload.__wrap(ret[0]);
    }
}
if (Symbol.dispose) Sdk.prototype[Symbol.dispose] = Sdk.prototype.free;

/**
 * A read-only SDK for the objects a sharing key grants access to.
 *
 * Unlike `Sdk`, it authenticates with a sharing key rather than an app key and
 * cannot upload, pin, or delete. Downloads are paid for by the key's owner.
 */
export class SharedSdk {
    static __wrap(ptr) {
        const obj = Object.create(SharedSdk.prototype);
        obj.__wbg_ptr = ptr;
        SharedSdkFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SharedSdkFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_sharedsdk_free(ptr, 0);
    }
    /**
     * Connects to `indexerUrl` as the recipient of the sharing key derived
     * from `seed`, which is the hex string the key's owner handed out.
     * @param {string} indexer_url
     * @param {string} seed
     * @returns {Promise<SharedSdk>}
     */
    static connect(indexer_url, seed) {
        const ptr0 = passStringToWasm0(indexer_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(seed, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.sharedsdk_connect(ptr0, len0, ptr1, len1);
        return ret;
    }
    /**
     * Streams a shared object's data.
     * @param {PinnedObject} object
     * @param {DownloadOptions} [options]
     * @returns {ReadableStream}
     */
    download(object, options) {
        _assertClass(object, PinnedObject);
        const ret = wasm.sharedsdk_download(this.__wbg_ptr, object.__wbg_ptr, isLikeNone(options) ? 0 : addToExternrefTable0(options));
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Returns the hosts serving this key's objects, optionally filtered by a
     * HostQuery. Mirrors `Sdk.hosts()` but is scoped to the sharing key, so the
     * set is already limited to hosts holding its objects.
     * @param {HostQuery | null} [query]
     * @returns {Host[]}
     */
    hosts(query) {
        const ret = wasm.sharedsdk_hosts(this.__wbg_ptr, isLikeNone(query) ? 0 : addToExternrefTable0(query));
        return ret;
    }
    /**
     * Fetches and decrypts one object the key grants access to.
     * @param {string} id
     * @returns {Promise<PinnedObject>}
     */
    object(id) {
        const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.sharedsdk_object(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * Lists a page of the objects the key grants access to without their
     * slabs, which is much smaller and faster than `objects`. Each summary
     * has the object's id, size, decrypted metadata and timestamps.
     * @param {number} offset
     * @param {number} limit
     * @returns {Promise<ObjectSummary[]>}
     */
    objectSummaries(offset, limit) {
        const ret = wasm.sharedsdk_objectSummaries(this.__wbg_ptr, offset, limit);
        return ret;
    }
    /**
     * Lists and decrypts a page of the objects the key grants access to.
     * @param {number} offset
     * @param {number} limit
     * @returns {Promise<PinnedObject[]>}
     */
    objects(offset, limit) {
        const ret = wasm.sharedsdk_objects(this.__wbg_ptr, offset, limit);
        return ret;
    }
    /**
     * Fetches the sharing key's stats from the indexer.
     * @returns {Promise<KeyStats>}
     */
    stats() {
        const ret = wasm.sharedsdk_stats(this.__wbg_ptr);
        return ret;
    }
}
if (Symbol.dispose) SharedSdk.prototype[Symbol.dispose] = SharedSdk.prototype.free;

/**
 * A sharing key, granting read-only access to the objects attached to it.
 *
 * It is just the credential; the operations that use it live on `Sdk`.
 */
export class SharingKey {
    static __wrap(ptr) {
        const obj = Object.create(SharingKey.prototype);
        obj.__wbg_ptr = ptr;
        SharingKeyFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SharingKeyFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_sharingkey_free(ptr, 0);
    }
    /**
     * Imports a sharing key from the hex seed its owner handed out.
     *
     * Pass the string returned by [seed](Self::seed).
     * @param {string} seed
     * @returns {SharingKey}
     */
    static fromSeed(seed) {
        const ptr0 = passStringToWasm0(seed, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.sharingkey_fromSeed(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return SharingKey.__wrap(ret[0]);
    }
    /**
     * The key's public half, which identifies it.
     * @returns {string}
     */
    get publicKey() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.sharingkey_publicKey(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Returns the seed a recipient needs to read the key's objects, as hex.
     *
     * It is the whole credential. Pair it with the indexer's url in
     * `SharedSdk.connect`.
     * @returns {string}
     */
    seed() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.sharingkey_seed(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) SharingKey.prototype[Symbol.dispose] = SharingKey.prototype.free;

/**
 * Calculates the encoded size of data after erasure coding.
 * @param {number} data_size
 * @param {number} data_shards
 * @param {number} parity_shards
 * @returns {number}
 */
export function encodedSize(data_size, data_shards, parity_shards) {
    const ret = wasm.encodedSize(data_size, data_shards, parity_shards);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0];
}

/**
 * Generates a new BIP-39 12-word recovery phrase.
 * @returns {string}
 */
export function generateRecoveryPhrase() {
    let deferred1_0;
    let deferred1_1;
    try {
        const ret = wasm.generateRecoveryPhrase();
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}

/**
 * Set up panic hook and tokio runtime for browser use.
 *
 * Call `setLogger` to receive log messages.
 */
export function init() {
    wasm.init();
}

/**
 * Sets a logging callback to receive log messages from the SDK.
 *
 * The callback receives formatted log messages as strings.
 * `level` should be one of: "off", "error", "warn", "info", "debug", "trace".
 * @param {(message: string) => void} callback
 * @param {"off" | "error" | "warn" | "info" | "debug" | "trace"} level
 */
export function setLogger(callback, level) {
    wasm.setLogger(callback, level);
}

/**
 * Validates a BIP-39 recovery phrase.
 * @param {string} phrase
 */
export function validateRecoveryPhrase(phrase) {
    const ptr0 = passStringToWasm0(phrase, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.validateRecoveryPhrase(ptr0, len0);
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg_Error_92b29b0548f8b746: function(arg0, arg1) {
            const ret = Error(getStringFromWasm0(arg0, arg1));
            return ret;
        },
        __wbg_Number_9a4e0ecb0fa16705: function(arg0) {
            const ret = Number(arg0);
            return ret;
        },
        __wbg_String_8564e559799eccda: function(arg0, arg1) {
            const ret = String(arg1);
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_bigint_get_as_i64_d968e41184ae354f: function(arg0, arg1) {
            const v = arg1;
            const ret = typeof(v) === 'bigint' ? v : undefined;
            getDataViewMemory0().setBigInt64(arg0 + 8 * 1, isLikeNone(ret) ? BigInt(0) : ret, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
        },
        __wbg___wbindgen_boolean_get_fa956cfa2d1bd751: function(arg0) {
            const v = arg0;
            const ret = typeof(v) === 'boolean' ? v : undefined;
            return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
        },
        __wbg___wbindgen_debug_string_c25d447a39f5578f: function(arg0, arg1) {
            const ret = debugString(arg1);
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_in_aca499c5de7ff5e5: function(arg0, arg1) {
            const ret = arg0 in arg1;
            return ret;
        },
        __wbg___wbindgen_is_bigint_2f76dc55065b4273: function(arg0) {
            const ret = typeof(arg0) === 'bigint';
            return ret;
        },
        __wbg___wbindgen_is_function_1ff95bcc5517c252: function(arg0) {
            const ret = typeof(arg0) === 'function';
            return ret;
        },
        __wbg___wbindgen_is_null_ea9085d691f535d3: function(arg0) {
            const ret = arg0 === null;
            return ret;
        },
        __wbg___wbindgen_is_object_a27215656b807791: function(arg0) {
            const val = arg0;
            const ret = typeof(val) === 'object' && val !== null;
            return ret;
        },
        __wbg___wbindgen_is_undefined_c05833b95a3cf397: function(arg0) {
            const ret = arg0 === undefined;
            return ret;
        },
        __wbg___wbindgen_jsval_eq_e659fcf7b0e32763: function(arg0, arg1) {
            const ret = arg0 === arg1;
            return ret;
        },
        __wbg___wbindgen_jsval_loose_eq_db4c3b15f63fc170: function(arg0, arg1) {
            const ret = arg0 == arg1;
            return ret;
        },
        __wbg___wbindgen_number_get_394265ed1e1b84ee: function(arg0, arg1) {
            const obj = arg1;
            const ret = typeof(obj) === 'number' ? obj : undefined;
            getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
        },
        __wbg___wbindgen_string_get_b0ca35b86a603356: function(arg0, arg1) {
            const obj = arg1;
            const ret = typeof(obj) === 'string' ? obj : undefined;
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_throw_344f42d3211c4765: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg__wbg_cb_unref_fffb441def202758: function(arg0) {
            arg0._wbg_cb_unref();
        },
        __wbg_abort_8bae0f33e7833997: function(arg0) {
            arg0.abort();
        },
        __wbg_abort_962541bfa57985c4: function(arg0) {
            const ret = arg0.abort();
            return ret;
        },
        __wbg_abort_eee9248a6d680839: function(arg0, arg1) {
            arg0.abort(arg1);
        },
        __wbg_append_01c74e5c6b58aa64: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
            arg0.append(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
        }, arguments); },
        __wbg_arrayBuffer_3b637f0fa65c5351: function() { return handleError(function (arg0) {
            const ret = arg0.arrayBuffer();
            return ret;
        }, arguments); },
        __wbg_buffer_54b87055582c8a81: function(arg0) {
            const ret = arg0.buffer;
            return ret;
        },
        __wbg_byobRequest_06b654bb15590436: function(arg0) {
            const ret = arg0.byobRequest;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_byteLength_41862ca4020b9c43: function(arg0) {
            const ret = arg0.byteLength;
            return ret;
        },
        __wbg_byteOffset_d42e18c4441f628b: function(arg0) {
            const ret = arg0.byteOffset;
            return ret;
        },
        __wbg_call_8a2dd23819f8a60a: function() { return handleError(function (arg0, arg1) {
            const ret = arg0.call(arg1);
            return ret;
        }, arguments); },
        __wbg_call_a6e5c5dce5018821: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = arg0.call(arg1, arg2);
            return ret;
        }, arguments); },
        __wbg_call_e3b662382210db98: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            const ret = arg0.call(arg1, arg2, arg3);
            return ret;
        }, arguments); },
        __wbg_cancel_3983a93e24cc66b3: function(arg0) {
            const ret = arg0.cancel();
            return ret;
        },
        __wbg_cancel_70eb325a477a4d18: function(arg0) {
            const ret = arg0.cancel();
            return ret;
        },
        __wbg_catch_c1a60df4c30d76d3: function(arg0, arg1) {
            const ret = arg0.catch(arg1);
            return ret;
        },
        __wbg_clearTimeout_6b8d9a38b9263d65: function(arg0) {
            const ret = clearTimeout(arg0);
            return ret;
        },
        __wbg_close_1e6096d41f7ce5d0: function(arg0) {
            const ret = arg0.close();
            return ret;
        },
        __wbg_close_249a23304523681b: function() { return handleError(function (arg0) {
            arg0.close();
        }, arguments); },
        __wbg_close_72d318d9c16e83ef: function() { return handleError(function (arg0) {
            arg0.close();
        }, arguments); },
        __wbg_close_9aa4d8117c23924b: function(arg0) {
            arg0.close();
        },
        __wbg_closed_90dc91afa732ed57: function(arg0) {
            const ret = arg0.closed;
            return ret;
        },
        __wbg_createBidirectionalStream_f9081daa37bad3ee: function(arg0) {
            const ret = arg0.createBidirectionalStream();
            return ret;
        },
        __wbg_done_11408d3db12f8f67: function(arg0) {
            const ret = arg0.done;
            return ret;
        },
        __wbg_done_89b2b13e91a60321: function(arg0) {
            const ret = arg0.done;
            return ret;
        },
        __wbg_enqueue_6d83b4c6281bafd6: function() { return handleError(function (arg0, arg1) {
            arg0.enqueue(arg1);
        }, arguments); },
        __wbg_error_a6fa202b58aa1cd3: function(arg0, arg1) {
            let deferred0_0;
            let deferred0_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                console.error(getStringFromWasm0(arg0, arg1));
            } finally {
                wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
            }
        },
        __wbg_fetch_9dad4fe911207b37: function(arg0) {
            const ret = fetch(arg0);
            return ret;
        },
        __wbg_fetch_b5951fc96f52f786: function(arg0, arg1) {
            const ret = arg0.fetch(arg1);
            return ret;
        },
        __wbg_getRandomValues_cc7f052a444bb2ce: function() { return handleError(function (arg0, arg1) {
            globalThis.crypto.getRandomValues(getArrayU8FromWasm0(arg0, arg1));
        }, arguments); },
        __wbg_getReader_7455d080fa48369b: function(arg0) {
            const ret = arg0.getReader();
            return ret;
        },
        __wbg_getReader_9838808cf6e83f4f: function() { return handleError(function (arg0, arg1) {
            const ret = arg0.getReader(arg1);
            return ret;
        }, arguments); },
        __wbg_getReader_bf34f92ee19c42b4: function() { return handleError(function (arg0) {
            const ret = arg0.getReader();
            return ret;
        }, arguments); },
        __wbg_getTime_d6f070c088c9b5ed: function(arg0) {
            const ret = arg0.getTime();
            return ret;
        },
        __wbg_getWriter_d71a99bcd847ccef: function() { return handleError(function (arg0) {
            const ret = arg0.getWriter();
            return ret;
        }, arguments); },
        __wbg_get_78f252d074a84d0b: function() { return handleError(function (arg0, arg1) {
            const ret = Reflect.get(arg0, arg1);
            return ret;
        }, arguments); },
        __wbg_get_c7eb1f358a7654df: function() { return handleError(function (arg0, arg1) {
            const ret = Reflect.get(arg0, arg1);
            return ret;
        }, arguments); },
        __wbg_get_done_670108eb06ecbe46: function(arg0) {
            const ret = arg0.done;
            return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
        },
        __wbg_get_unchecked_6e0ad6d2a41b06f6: function(arg0, arg1) {
            const ret = arg0[arg1 >>> 0];
            return ret;
        },
        __wbg_get_value_f465f5be30aa0963: function(arg0) {
            const ret = arg0.value;
            return ret;
        },
        __wbg_get_with_ref_key_6412cf3094599694: function(arg0, arg1) {
            const ret = arg0[arg1];
            return ret;
        },
        __wbg_has_8374cf06984d8bfc: function() { return handleError(function (arg0, arg1) {
            const ret = Reflect.has(arg0, arg1);
            return ret;
        }, arguments); },
        __wbg_headers_cf9c80f30e2a4eff: function(arg0) {
            const ret = arg0.headers;
            return ret;
        },
        __wbg_instanceof_ArrayBuffer_4480b9e0068a8adb: function(arg0) {
            let result;
            try {
                result = arg0 instanceof ArrayBuffer;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_Date_e54edffdcb007f5f: function(arg0) {
            let result;
            try {
                result = arg0 instanceof Date;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_Error_1fdac9f13a8181ba: function(arg0) {
            let result;
            try {
                result = arg0 instanceof Error;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_Response_c8b64b2256f01bec: function(arg0) {
            let result;
            try {
                result = arg0 instanceof Response;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_Uint8Array_309b927aaf7a3fc7: function(arg0) {
            let result;
            try {
                result = arg0 instanceof Uint8Array;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_isArray_0677c962b281d01a: function(arg0) {
            const ret = Array.isArray(arg0);
            return ret;
        },
        __wbg_isSafeInteger_04f36e4056f1b851: function(arg0) {
            const ret = Number.isSafeInteger(arg0);
            return ret;
        },
        __wbg_iterator_6f722e4a93058b71: function() {
            const ret = Symbol.iterator;
            return ret;
        },
        __wbg_keyrecord_new: function(arg0) {
            const ret = KeyRecord.__wrap(arg0);
            return ret;
        },
        __wbg_length_1f0964f4a5e2c6d8: function(arg0) {
            const ret = arg0.length;
            return ret;
        },
        __wbg_length_370319915dc99107: function(arg0) {
            const ret = arg0.length;
            return ret;
        },
        __wbg_message_8326fb1d549bebc5: function(arg0) {
            const ret = arg0.message;
            return ret;
        },
        __wbg_new_0_3da9e97f24fc69be: function() {
            const ret = new Date();
            return ret;
        },
        __wbg_new_0d809930cd1354c6: function() { return handleError(function () {
            const ret = new Headers();
            return ret;
        }, arguments); },
        __wbg_new_227d7c05414eb861: function() {
            const ret = new Error();
            return ret;
        },
        __wbg_new_32b398fb48b6d94a: function() {
            const ret = new Array();
            return ret;
        },
        __wbg_new_4339b2a2675a03e3: function() { return handleError(function () {
            const ret = new AbortController();
            return ret;
        }, arguments); },
        __wbg_new_aec3e25493d729fe: function(arg0, arg1) {
            try {
                var state0 = {a: arg0, b: arg1};
                var cb0 = (arg0, arg1) => {
                    const a = state0.a;
                    state0.a = 0;
                    try {
                        return wasm_bindgen__convert__closures_____invoke__h2e2eca41a5fa27e4(a, state0.b, arg0, arg1);
                    } finally {
                        state0.a = a;
                    }
                };
                const ret = new Promise(cb0);
                return ret;
            } finally {
                state0.a = 0;
            }
        },
        __wbg_new_b667d279fd5aa943: function(arg0, arg1) {
            const ret = new Error(getStringFromWasm0(arg0, arg1));
            return ret;
        },
        __wbg_new_cc984128914cfc6f: function(arg0) {
            const ret = new Date(arg0);
            return ret;
        },
        __wbg_new_cd45aabdf6073e84: function(arg0) {
            const ret = new Uint8Array(arg0);
            return ret;
        },
        __wbg_new_da52cf8fe3429cb2: function() {
            const ret = new Object();
            return ret;
        },
        __wbg_new_from_slice_77cdfb7977362f3c: function(arg0, arg1) {
            const ret = new Uint8Array(getArrayU8FromWasm0(arg0, arg1));
            return ret;
        },
        __wbg_new_typed_1824d93f294193e5: function(arg0, arg1) {
            try {
                var state0 = {a: arg0, b: arg1};
                var cb0 = (arg0, arg1) => {
                    const a = state0.a;
                    state0.a = 0;
                    try {
                        return wasm_bindgen__convert__closures_____invoke__h2e2eca41a5fa27e4(a, state0.b, arg0, arg1);
                    } finally {
                        state0.a = a;
                    }
                };
                const ret = new Promise(cb0);
                return ret;
            } finally {
                state0.a = 0;
            }
        },
        __wbg_new_with_byte_offset_and_length_54c7724ee3ec7d82: function(arg0, arg1, arg2) {
            const ret = new Uint8Array(arg0, arg1 >>> 0, arg2 >>> 0);
            return ret;
        },
        __wbg_new_with_into_underlying_byte_source_e1bffc8549ce4568: function() { return handleError(function (arg0) {
            const ret = new ReadableStream(IntoUnderlyingByteSource.__wrap(arg0));
            return ret;
        }, arguments); },
        __wbg_new_with_length_e6785c33c8e4cce8: function(arg0) {
            const ret = new Uint8Array(arg0 >>> 0);
            return ret;
        },
        __wbg_new_with_options_5b1cc213336d0b4c: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = new WebTransport(getStringFromWasm0(arg0, arg1), arg2);
            return ret;
        }, arguments); },
        __wbg_new_with_str_and_init_d95cbe11ce28e65e: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = new Request(getStringFromWasm0(arg0, arg1), arg2);
            return ret;
        }, arguments); },
        __wbg_next_6dbf2c0ac8cde20f: function(arg0) {
            const ret = arg0.next;
            return ret;
        },
        __wbg_next_71f2aa1cb3d1e37e: function() { return handleError(function (arg0) {
            const ret = arg0.next();
            return ret;
        }, arguments); },
        __wbg_now_e7c6795a7f81e10f: function(arg0) {
            const ret = arg0.now();
            return ret;
        },
        __wbg_objectevent_new: function(arg0) {
            const ret = ObjectEvent.__wrap(arg0);
            return ret;
        },
        __wbg_objectsummary_new: function(arg0) {
            const ret = ObjectSummary.__wrap(arg0);
            return ret;
        },
        __wbg_performance_3fcf6e32a7e1ed0a: function(arg0) {
            const ret = arg0.performance;
            return ret;
        },
        __wbg_pinnedobject_new: function(arg0) {
            const ret = PinnedObject.__wrap(arg0);
            return ret;
        },
        __wbg_prototypesetcall_4770620bbe4688a0: function(arg0, arg1, arg2) {
            Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
        },
        __wbg_queueMicrotask_0ab5b2d2393e99b9: function(arg0) {
            const ret = arg0.queueMicrotask;
            return ret;
        },
        __wbg_queueMicrotask_6a09b7bc46549209: function(arg0) {
            queueMicrotask(arg0);
        },
        __wbg_read_8afa15f12a160ef8: function(arg0) {
            const ret = arg0.read();
            return ret;
        },
        __wbg_read_c962767feecc5390: function(arg0, arg1) {
            const ret = arg0.read(arg1);
            return ret;
        },
        __wbg_readable_41ceb106ca6ebcbe: function(arg0) {
            const ret = arg0.readable;
            return ret;
        },
        __wbg_ready_e4dad560377c42e6: function(arg0) {
            const ret = arg0.ready;
            return ret;
        },
        __wbg_releaseLock_5b92874cad775644: function(arg0) {
            arg0.releaseLock();
        },
        __wbg_releaseLock_d4ee71bd7fe2a3bc: function(arg0) {
            arg0.releaseLock();
        },
        __wbg_resolve_2191a4dfe481c25b: function(arg0) {
            const ret = Promise.resolve(arg0);
            return ret;
        },
        __wbg_respond_510e32df8aeb6817: function() { return handleError(function (arg0, arg1) {
            arg0.respond(arg1 >>> 0);
        }, arguments); },
        __wbg_sdk_new: function(arg0) {
            const ret = Sdk.__wrap(arg0);
            return ret;
        },
        __wbg_setTimeout_f757f00851f76c42: function(arg0, arg1) {
            const ret = setTimeout(arg0, arg1);
            return ret;
        },
        __wbg_set_4d7dd76f3dae2926: function(arg0, arg1, arg2) {
            arg0.set(getArrayU8FromWasm0(arg1, arg2));
        },
        __wbg_set_6be42768c690e380: function(arg0, arg1, arg2) {
            arg0[arg1] = arg2;
        },
        __wbg_set_8a16b38e4805b298: function(arg0, arg1, arg2) {
            arg0[arg1 >>> 0] = arg2;
        },
        __wbg_set_body_029f2d171e0a005f: function(arg0, arg1) {
            arg0.body = arg1;
        },
        __wbg_set_cache_b4a740b195c051f4: function(arg0, arg1) {
            arg0.cache = __wbindgen_enum_RequestCache[arg1];
        },
        __wbg_set_credentials_bb34a40189e3b43b: function(arg0, arg1) {
            arg0.credentials = __wbindgen_enum_RequestCredentials[arg1];
        },
        __wbg_set_headers_9c61d123c3ee1f10: function(arg0, arg1) {
            arg0.headers = arg1;
        },
        __wbg_set_method_5532d59b92d76467: function(arg0, arg1, arg2) {
            arg0.method = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_mode_66c79886ad78fc05: function(arg0, arg1) {
            arg0.mode = __wbindgen_enum_RequestMode[arg1];
        },
        __wbg_set_mode_f6bfb5131426e6b5: function(arg0, arg1) {
            arg0.mode = __wbindgen_enum_ReadableStreamReaderMode[arg1];
        },
        __wbg_set_signal_c4ef8faddb4c1446: function(arg0, arg1) {
            arg0.signal = arg1;
        },
        __wbg_sharedsdk_new: function(arg0) {
            const ret = SharedSdk.__wrap(arg0);
            return ret;
        },
        __wbg_sharingkey_new: function(arg0) {
            const ret = SharingKey.__wrap(arg0);
            return ret;
        },
        __wbg_signal_dad7cb35193abd31: function(arg0) {
            const ret = arg0.signal;
            return ret;
        },
        __wbg_stack_3b0d974bbf31e44f: function(arg0, arg1) {
            const ret = arg1.stack;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_static_accessor_GLOBAL_4ef717fb391d88b7: function() {
            const ret = typeof global === 'undefined' ? null : global;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_static_accessor_GLOBAL_THIS_8d1badc68b5a74f4: function() {
            const ret = typeof globalThis === 'undefined' ? null : globalThis;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_static_accessor_SELF_146583524fe1469b: function() {
            const ret = typeof self === 'undefined' ? null : self;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_static_accessor_WINDOW_f2829a2234d7819e: function() {
            const ret = typeof window === 'undefined' ? null : window;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_status_c45b3b9b3033184a: function(arg0) {
            const ret = arg0.status;
            return ret;
        },
        __wbg_stringify_b54333f60f1e4dad: function() { return handleError(function (arg0) {
            const ret = JSON.stringify(arg0);
            return ret;
        }, arguments); },
        __wbg_subarray_3ed232c8a6baee09: function(arg0, arg1, arg2) {
            const ret = arg0.subarray(arg1 >>> 0, arg2 >>> 0);
            return ret;
        },
        __wbg_text_d3a29f7525a132c3: function() { return handleError(function (arg0) {
            const ret = arg0.text();
            return ret;
        }, arguments); },
        __wbg_then_16d107c451e9905d: function(arg0, arg1, arg2) {
            const ret = arg0.then(arg1, arg2);
            return ret;
        },
        __wbg_then_6ec10ae38b3e92f7: function(arg0, arg1) {
            const ret = arg0.then(arg1);
            return ret;
        },
        __wbg_toString_b201c2690bbe445a: function(arg0) {
            const ret = arg0.toString();
            return ret;
        },
        __wbg_url_abdb8fb08377f8c0: function(arg0, arg1) {
            const ret = arg1.url;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_value_015ff34c896f8461: function(arg0) {
            const ret = arg0.value;
            return ret;
        },
        __wbg_value_a5d5488a9589444a: function(arg0) {
            const ret = arg0.value;
            return ret;
        },
        __wbg_view_21f1d4a4f175dfa9: function(arg0) {
            const ret = arg0.view;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_writable_c905da49f8095567: function(arg0) {
            const ret = arg0.writable;
            return ret;
        },
        __wbg_write_f6dc0059c3feedce: function(arg0, arg1) {
            const ret = arg0.write(arg1);
            return ret;
        },
        __wbindgen_cast_0000000000000001: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [Externref], shim_idx: 1029, ret: Result(Unit), inner_ret: Some(Result(Unit)) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, wasm_bindgen__convert__closures_____invoke__h1e3f64418de0f062);
            return ret;
        },
        __wbindgen_cast_0000000000000002: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [Externref], shim_idx: 495, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, wasm_bindgen__convert__closures_____invoke__h8922a47371e3ba53);
            return ret;
        },
        __wbindgen_cast_0000000000000003: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [Externref], shim_idx: 544, ret: Result(Unit), inner_ret: Some(Result(Unit)) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, wasm_bindgen__convert__closures_____invoke__h6cd7f7d88282e669);
            return ret;
        },
        __wbindgen_cast_0000000000000004: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [NamedExternref("WebTransportBidirectionalStream")], shim_idx: 544, ret: Result(Unit), inner_ret: Some(Result(Unit)) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, wasm_bindgen__convert__closures_____invoke__h6cd7f7d88282e669_3);
            return ret;
        },
        __wbindgen_cast_0000000000000005: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [NamedExternref("undefined")], shim_idx: 544, ret: Result(Unit), inner_ret: Some(Result(Unit)) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, wasm_bindgen__convert__closures_____invoke__h6cd7f7d88282e669_4);
            return ret;
        },
        __wbindgen_cast_0000000000000006: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [], shim_idx: 843, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, wasm_bindgen__convert__closures_____invoke__h36107270e7a7c701);
            return ret;
        },
        __wbindgen_cast_0000000000000007: function(arg0) {
            // Cast intrinsic for `F64 -> Externref`.
            const ret = arg0;
            return ret;
        },
        __wbindgen_cast_0000000000000008: function(arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return ret;
        },
        __wbindgen_cast_0000000000000009: function(arg0) {
            // Cast intrinsic for `U64 -> Externref`.
            const ret = BigInt.asUintN(64, arg0);
            return ret;
        },
        __wbindgen_cast_000000000000000a: function(arg0, arg1) {
            var v0 = getArrayJsValueFromWasm0(arg0, arg1).slice();
            wasm.__wbindgen_free(arg0, arg1 * 4, 4);
            // Cast intrinsic for `Vector(NamedExternref("KeyRecord")) -> Externref`.
            const ret = v0;
            return ret;
        },
        __wbindgen_cast_000000000000000b: function(arg0, arg1) {
            var v0 = getArrayJsValueFromWasm0(arg0, arg1).slice();
            wasm.__wbindgen_free(arg0, arg1 * 4, 4);
            // Cast intrinsic for `Vector(NamedExternref("ObjectEvent")) -> Externref`.
            const ret = v0;
            return ret;
        },
        __wbindgen_cast_000000000000000c: function(arg0, arg1) {
            var v0 = getArrayJsValueFromWasm0(arg0, arg1).slice();
            wasm.__wbindgen_free(arg0, arg1 * 4, 4);
            // Cast intrinsic for `Vector(NamedExternref("ObjectSummary")) -> Externref`.
            const ret = v0;
            return ret;
        },
        __wbindgen_cast_000000000000000d: function(arg0, arg1) {
            var v0 = getArrayJsValueFromWasm0(arg0, arg1).slice();
            wasm.__wbindgen_free(arg0, arg1 * 4, 4);
            // Cast intrinsic for `Vector(NamedExternref("PinnedObject")) -> Externref`.
            const ret = v0;
            return ret;
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./sia_storage_wasm_bg.js": import0,
    };
}

function wasm_bindgen__convert__closures_____invoke__h36107270e7a7c701(arg0, arg1) {
    wasm.wasm_bindgen__convert__closures_____invoke__h36107270e7a7c701(arg0, arg1);
}

function wasm_bindgen__convert__closures_____invoke__h8922a47371e3ba53(arg0, arg1, arg2) {
    wasm.wasm_bindgen__convert__closures_____invoke__h8922a47371e3ba53(arg0, arg1, arg2);
}

function wasm_bindgen__convert__closures_____invoke__h1e3f64418de0f062(arg0, arg1, arg2) {
    const ret = wasm.wasm_bindgen__convert__closures_____invoke__h1e3f64418de0f062(arg0, arg1, arg2);
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

function wasm_bindgen__convert__closures_____invoke__h6cd7f7d88282e669(arg0, arg1, arg2) {
    const ret = wasm.wasm_bindgen__convert__closures_____invoke__h6cd7f7d88282e669(arg0, arg1, arg2);
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

function wasm_bindgen__convert__closures_____invoke__h6cd7f7d88282e669_3(arg0, arg1, arg2) {
    const ret = wasm.wasm_bindgen__convert__closures_____invoke__h6cd7f7d88282e669_3(arg0, arg1, arg2);
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

function wasm_bindgen__convert__closures_____invoke__h6cd7f7d88282e669_4(arg0, arg1, arg2) {
    const ret = wasm.wasm_bindgen__convert__closures_____invoke__h6cd7f7d88282e669_4(arg0, arg1, arg2);
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

function wasm_bindgen__convert__closures_____invoke__h2e2eca41a5fa27e4(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen__convert__closures_____invoke__h2e2eca41a5fa27e4(arg0, arg1, arg2, arg3);
}


const __wbindgen_enum_ReadableStreamReaderMode = ["byob"];


const __wbindgen_enum_ReadableStreamType = ["bytes"];


const __wbindgen_enum_RequestCache = ["default", "no-store", "reload", "no-cache", "force-cache", "only-if-cached"];


const __wbindgen_enum_RequestCredentials = ["omit", "same-origin", "include"];


const __wbindgen_enum_RequestMode = ["same-origin", "no-cors", "cors", "navigate"];
const AppKeyFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_appkey_free(ptr, 1));
const BuilderFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_builder_free(ptr, 1));
const IntoUnderlyingByteSourceFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_intounderlyingbytesource_free(ptr, 1));
const IntoUnderlyingSinkFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_intounderlyingsink_free(ptr, 1));
const IntoUnderlyingSourceFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_intounderlyingsource_free(ptr, 1));
const KeyRecordFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_keyrecord_free(ptr, 1));
const ObjectEventFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_objectevent_free(ptr, 1));
const ObjectSummaryFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_objectsummary_free(ptr, 1));
const PackedUploadFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_packedupload_free(ptr, 1));
const PinnedObjectFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pinnedobject_free(ptr, 1));
const SdkFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_sdk_free(ptr, 1));
const SharedSdkFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_sharedsdk_free(ptr, 1));
const SharingKeyFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_sharingkey_free(ptr, 1));

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => wasm.__wbindgen_destroy_closure(state.a, state.b));

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
        result.push(wasm.__wbindgen_externrefs.get(mem.getUint32(i, true)));
    }
    wasm.__externref_drop_slice(ptr, len);
    return result;
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function makeMutClosure(arg0, arg1, f) {
    const state = { a: arg0, b: arg1, cnt: 1 };
    const real = (...args) => {

        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            state.a = a;
            real._wbg_cb_unref();
        }
    };
    real._wbg_cb_unref = () => {
        if (--state.cnt === 0) {
            wasm.__wbindgen_destroy_closure(state.a, state.b);
            state.a = 0;
            CLOSURE_DTORS.unregister(state);
        }
    };
    CLOSURE_DTORS.register(real, state, state);
    return real;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasmInstance, wasm;
function __wbg_finalize_init(instance, module) {
    wasmInstance = instance;
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('sia_storage_wasm_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
