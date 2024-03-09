console.log("botw-pmdmd");
const inputConsoleIp = document.getElementById("console-ip");
const inputConsolePort = document.getElementById("console-port");
const inputRelayPort = document.getElementById("relay-port");

const buttonDump = document.getElementById("dump-button");
const buttonImport = document.getElementById("import-button");
const buttonSave = document.getElementById("save-button");

loadInputs();

let ws;

/// the raw dump (including the pmdm* in the first 8 bytes)
let rawDump;
/// the dump
let dump;
/// pmdm*
let start;
/// the pmdm
let pmdm;

/// Bind listeners
buttonImport.addEventListener("change", async () => {
    const file = buttonImport.files[0];
    console.log("loading from file");
    buffer = await file.arrayBuffer();
    loadDump(buffer);
});
buttonSave.addEventListener("click", () => {
    if (!rawDump) {
        console.error("No dump loaded");
        return;
    }
    saveAs(new Blob([rawDump]), "pmdm-dump.bin");
});
buttonDump.addEventListener("click", async () => {
    if (!ws) {
        console.log("connecting to relay");
        return await new Promise((resolve, reject) => {
            ws = new WebSocket(`ws://localhost:${inputRelayPort.value}`);
            ws.addEventListener("open", () => {
                console.log("connected to relay");
                dumpFromConsole();
                resolve();
            });
            ws.addEventListener("error", (event) => {
                console.error("error connecting to relay");
                console.error(event);
            });
            ws.addEventListener("close", (event) => {
                console.log("disconnected from relay");
                ws = null;
            });
            ws.addEventListener("message", async (event) => {
                console.log("received dump from console");
                const blob = event.data;
                loadDump(await blob.arrayBuffer());
            });
        });
    }
    dumpFromConsole();
});
inputConsoleIp.addEventListener("change", saveInputs);
inputConsolePort.addEventListener("change", saveInputs);
inputRelayPort.addEventListener("change", saveInputs);

function dumpFromConsole() {
    console.log("requesting dump from console");
    const port = Number(inputConsolePort.value);
    if (Number.isNaN(port)) {
        console.error("invalid port");
        return;
    }
    const payload = {
        ip: inputConsoleIp.value,
        port,
    };
    ws.send(JSON.stringify(payload));
}

function saveInputs() {
    const payload = {
        ip: inputConsoleIp.value,
        relayPort: inputRelayPort.value,
    };
    localStorage.setItem("botw-pmdmd", JSON.stringify(payload));
}

function loadInputs() {
    let payload = localStorage.getItem("botw-pmdmd");
    if (payload) {
        payload = JSON.parse(payload);
        inputConsoleIp.value = payload.ip;
        inputRelayPort.value = payload.relayPort;
    }
}

function loadDump(buffer) {
    rawDump = new Uint8Array(buffer);
    dump = rawDump;
    start = read_u64(0);
    console.log("loaded pmdm_ptr="+toHex(start, 16, "0x"));
    dump = rawDump.subarray(8);
    console.log("loaded dump, length="+dump.length);
    pmdm = new PauseMenuDataMgr(0);
    console.log(pmdm);
}

function toHex(value, length, prefix="") {
    return prefix + value.toString(16).padStart(length, "0");
}

function read_u8(offset) {
    return dump[offset];
}

function read_u16(offset) {
    return dump[offset] | (dump[offset+1] << 8);
}

function read_u32(offset) {
    const low = dump[offset] | (dump[offset+1] << 8) | (dump[offset+2] << 16);
    const high = dump[offset+3];
    const lowHex = toHex(low, 6);
    const highHex = toHex(high, 2);
    return BigInt("0x"+highHex+lowHex);
}

function read_f32(offset) {
    const buffer = new Uint8Array(new ArrayBuffer(4));
    buffer[0] = dump[offset];
    buffer[1] = dump[offset+1];
    buffer[2] = dump[offset+2];
    buffer[3] = dump[offset+3];
    const floatView = new Float32Array(buffer);
    return floatView[0];
}

function read_u64(offset) {
    const lowHex = toHex(read_u32(offset), 8);
    const highHex = toHex(read_u32(offset+4), 8);
    return BigInt("0x"+highHex+lowHex);
}

function newInt64(off) { return new Int64(off); }
class Int64 {
    constructor(off) { this.off = off; }
    get u64() { return read_u64(this.off); }
    get hex() { return toHex(this.u64, 16, "0x"); }
}

function newInt32(off) { return new Int32(off); }
class Int32 {
    constructor(off) { this.off = off; }
    get u32() { return Number(read_u32(this.off)); }
    get hex() { return toHex(this.u32, 8, "0x"); }
    get s32() {
        const u32 = Number(this.u32);
        if (u32 > 0x7FFFFFFF) {
            return - (~u32) - 1;
        }
        return u32;
    }
}

function newFloat32(off) { return new Float32(off); }
class Float32 {
    constructor(off) { this.off = off; }
    get f32() { return Number(read_f32(this.off)); }
    get hex() { return toHex(read_u32(this.off), 8, "0x"); }
}

function newInt16(off) { return new Int16(off); }
class Int16 {
    constructor(off) { this.off = off; }
    get u16() { return read_u16(this.off); }
    get hex() { return toHex(this.u16, 4, "0x"); }
    get s16() {
        const u16 = this.u16;
        if (u16 > 0x7FFF) {
            const extended = u16 | 0xFFFF0000;
            return - (~extended) - 1;
        }
        return u16;
    }
}

function newInt8(off) { return new Int8(off); }
class Int8 {
    constructor(off) { this.off= off; }
    get u8() { return read_u8(this.off); }
    get hex() { return toHex(this.u8, 2, "0x"); }
    get s8() {
        const u8 = this.u8;
        if (u8 > 0x7F) {
            const extended = u8 | 0xFFFFFF00;
            return - (~extended) - 1;
        }
        return u8;
    }
    get char() { return String.fromCharCode(this.u8); }
}

/* built-in construction */
function newByteArray(off, len) {
    return new ByteArray(off, len);
}
class ByteArray {
    constructor(off, len) {
        this.off = off;
        this.len= len;
    }
    get data() {
        return dump.subarray(this.off, this.off+this.len);
    }
}

function newByteString(off) {
    return new ByteString(off);
}
class ByteString {
    constructor(off) { this.off = off; }
    get data() {
        const ptr = read_u64(this.off);
        if (ptr < start || ptr >= start + BigInt(dump.length)) {
            const address = toHex(ptr, 16, "0x");
            return `<ByteString ${address}>`;
        }
        const offset = (Number(ptr - start));
        let str = "";
        let i = 0;
        while (i < dump.length && read_u8(i+offset) != 0) {
            let c = read_u8(i+offset);
            if (c < 0) {
                c += 256;
            }
            if (ByteString.isValidChar(c)) {
                str += String.fromCharCode(c);
            } else {
                str += toHex(c, 2, "\\x");
            }
            i++;
        }
        if (i >= dump.length) {
            console.error("String not null-terminated when exiting known memory region");
        }
        return str;
    }
    get len() { return this.data.length; }
    static isValidChar(c) {
        if (c >= 0x20 && c <= 0x7E) {
            return true;
        }
        if (c === 129) { return false; }
        if (c === 141) { return false; }
        if (c === 143) { return false; }
        if (c === 144) { return false; }
        if (c === 160) { return false; }
        return true;
    }
}

/* built-in construction */
function newPtr(off, type, argsFn) { 
    const newFn = (off) => {
        const creatorFn = window[`new${type}`];
        const args = argsFn(off);
        return creatorFn(...args);
    }
    return new Ptr(off, type, newFn);
}
class Ptr { 
    constructor(off, type, newFn) {
        this.off = off;
        this.type = type;
        this.newFn = newFn;
    }

    get deref() {
        const ptr = read_u64(this.off);
        if (ptr < start || ptr >= start + BigInt(dump.length)) {
            const address = toHex(ptr, 16, "0x");
            return `<${this.type}* ${address}>`;
        }
        return this.newFn(Number(ptr - start));
    }
}

/* Built-in construction */
function newStructArray(off, len, elementSize, elementType, newFn) {
    const array = [];
    for (let i = 0; i < len; i++) {
        array.push(newFn(off + i * elementSize));
    }
    array.type = `${elementType}[${len}]`;
    return array;
}

function newPouchItemOffsetPtr(off) { return new PouchItemOffsetPtr(off); }
class PouchItemOffsetPtr {
    constructor(off) {
        this.off = off;
    }
    get deref() {
        const ptr = read_u64(this.off);
        if (ptr < start || ptr >= start + BigInt(dump.length)) {
            const address = toHex(ptr, 16, "0x");
            return `<ListNode* ${address}>`;
        }
        return newPouchItem(Number(ptr - start) - 8);
    }
}
