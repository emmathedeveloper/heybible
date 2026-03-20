import fetch from "node-fetch"; // if in main process
import { machineIdSync } from "node-machine-id";
import keytar from "keytar";

const SERVICE = "electron-license-app";
const LICENSE_ACCOUNT = "license";

/**
 * Types for License payload & verification response
 */
export interface LicensePayload {
  id: string;
  plan: string;
  issuedAt: number;
}

export interface OnlineVerificationResult {
  valid: boolean;
  plan?: string;
  [key: string]: any;
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

/**
 * LicenseManager handles:
 * - Device ID
 * - License storage
 * - Offline verification
 * - Online verification with device tracking
 */
export class LicenseManager {
  private publicKey: string;

  constructor(publicKey: string) {
    if (!publicKey) throw new Error("PUBLIC_KEY is required");
    this.publicKey = publicKey;
  }

  // ------------------------
  // Device ID (from machine fingerprint)
  // ------------------------
  getDeviceId(): string {
    // Using machineIdSync for stable device ID
    return machineIdSync(true);
  }

  // ------------------------
  // License Storage
  // ------------------------
  async saveLicense(license: string): Promise<void> {
    await keytar.setPassword(SERVICE, LICENSE_ACCOUNT, license);
  }

  async getLicense(): Promise<string | null> {
    return keytar.getPassword(SERVICE, LICENSE_ACCOUNT);
  }

  async clearLicense(): Promise<void> {
    await keytar.deletePassword(SERVICE, LICENSE_ACCOUNT);
  }

  // ------------------------
  // Offline License Verification
  // ------------------------
  async verifyOffline(license: string): Promise<LicensePayload | null> {
    try {
      const [payloadB64, signatureB64] = license.split('.')
      if (!payloadB64 || !signatureB64) return null

      const publicKey = await crypto.subtle.importKey(
        'spki',
        base64ToArrayBuffer(this.publicKey),
        {
          name: 'RSASSA-PKCS1-v1_5',
          hash: 'SHA-256',
        },
        false,
        ['verify']
      )

      const payloadString = atob(payloadB64)
      const payloadBuffer = new TextEncoder().encode(payloadString)
      const signature = base64ToArrayBuffer(signatureB64)

      const isValid = await crypto.subtle.verify(
        'RSASSA-PKCS1-v1_5',
        publicKey,
        signature,
        payloadBuffer
      )

      if (!isValid) return null

      return JSON.parse(payloadString) as LicensePayload
    } catch {
      return null
    }
  }

  // ------------------------
  // Online License Verification
  // ------------------------
  async verifyOnline(
    license: string,
    apiUrl: string,
    meta: Record<string, any> = {}
  ): Promise<OnlineVerificationResult> {
    try {
      const deviceId = this.getDeviceId();
      const res = await fetch(`${apiUrl}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ license, deviceId, meta }),
      });

      const data: OnlineVerificationResult = await res.json() as any;

      if (data.valid) {
        await this.saveLicense(license);
      }

      return data;
    } catch (err) {
      console.error("Online verification failed:", err);
      return { valid: false };
    }
  }
}