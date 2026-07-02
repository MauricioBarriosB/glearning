/**
 * Firma HMAC de peticiones (contrato compartido con el backend — CONGELADO).
 *
 * Cada petición a la API lleva 4 cabeceras además del Bearer:
 *   X-Client-Id : identificador de cliente (VITE_APP_API_CLIENT_ID)
 *   X-Timestamp : unix seconds como entero
 *   X-Nonce     : 16 bytes aleatorios en 32 hex minúsculas
 *   X-Signature : hex minúsculas de HMAC-SHA256(clientSecret, canonical)
 *
 * Canonical (UTF-8, '\n' = LF):
 *   clientId + "\n" + METHOD + "\n" + signedPath + "\n" + timestamp + "\n" + nonce
 *   METHOD     = método HTTP en mayúsculas
 *   signedPath = "/api" + path de la petición, SIN query string.
 */

const CLIENT_ID = import.meta.env.VITE_APP_API_CLIENT_ID || "glearning-web";
const CLIENT_SECRET = import.meta.env.VITE_APP_API_CLIENT_SECRET || "";

export interface SignatureHeaders {
    clientId: string;
    timestamp: string;
    nonce: string;
    signature: string;
}

const encoder = new TextEncoder();

function toHex(bytes: ArrayBuffer | Uint8Array): string {
    const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    let hex = "";
    for (const byte of view) {
        hex += byte.toString(16).padStart(2, "0");
    }
    return hex;
}

function generateNonce(): string {
    return toHex(crypto.getRandomValues(new Uint8Array(16)));
}

/** CryptoKey HMAC-SHA256 importada una vez y reutilizada. */
let cryptoKeyPromise: Promise<CryptoKey> | null = null;

function getKey(): Promise<CryptoKey> {
    cryptoKeyPromise ??= crypto.subtle.importKey(
        "raw",
        encoder.encode(CLIENT_SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
    );
    return cryptoKeyPromise;
}

/**
 * Construye las cabeceras de firma para una petición.
 *
 * @param method     Método HTTP (cualquier caso; se pasa a mayúsculas).
 * @param signedPath "/api" + el path de la petición, SIN query string.
 */
export async function signRequest(method: string, signedPath: string): Promise<SignatureHeaders> {
    const clientId = CLIENT_ID;
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = generateNonce();
    const canonical = `${clientId}\n${method.toUpperCase()}\n${signedPath}\n${timestamp}\n${nonce}`;

    const key = await getKey();
    const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(canonical));

    return { clientId, timestamp, nonce, signature: toHex(signatureBytes) };
}
