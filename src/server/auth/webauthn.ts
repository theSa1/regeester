export const rpID =
  process.env.NODE_ENV === "production" ? "regeester.sa1.dev" : "localhost";
export const rpName = "Event Registration";
export const origin =
  process.env.NODE_ENV === "production"
    ? `https://${rpID}`
    : process.env.NEXTAUTH_URL || "http://localhost:3000";

export const isoUint8Array = {
  /**
   * Convert from string to Uint8Array
   */
  fromUTF8String: (value: string): Uint8Array => {
    return new TextEncoder().encode(value);
  },
  /**
   * Convert from Uint8Array to string
   */
  toUTF8String: (value: Uint8Array): string => {
    return new TextDecoder("utf-8").decode(value);
  },
  /**
   * Convert from base64url string to Uint8Array
   */
  fromBase64url: (value: string): Uint8Array => {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "===".slice((base64.length + 3) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  },
  /**
   * Convert from Uint8Array to base64url string
   */
  toBase64url: (value: Uint8Array): string => {
    const base64 = btoa(String.fromCharCode(...value));
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  },
};

export function parseTransports(transports: string | null): string[] {
  if (!transports) return [];
  try {
    return JSON.parse(transports);
  } catch {
    return [];
  }
}

export function stringifyTransports(transports: string[]): string {
  return JSON.stringify(transports);
}
