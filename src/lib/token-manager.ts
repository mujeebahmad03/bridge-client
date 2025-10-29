import { deleteCookie, getCookie, setCookie } from "cookies-next";
import crypto from "crypto";
import { EncryptJWT, jwtDecrypt } from "jose";

import { type TokenPair } from "@/types/api";

import { env } from "./env";

// Token types

const rawSecret = env.NEXT_PUBLIC_JWT_SECRET;

export class TokenStorage {
  private static async getEncryptionKey(): Promise<Uint8Array> {
    // Create a consistent key using SHA-256
    const hash = crypto.createHash("sha256").update(rawSecret).digest();
    return new Uint8Array(hash);
  }

  private static async encrypt(
    data: string,
    expirationInSeconds: number
  ): Promise<string> {
    const encryptionKey = await this.getEncryptionKey();

    return await new EncryptJWT({ data })
      .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + expirationInSeconds)
      .encrypt(encryptionKey);
  }

  private static async decrypt(data: string): Promise<string | null> {
    try {
      const encryptionKey = await this.getEncryptionKey();

      const { payload } = await jwtDecrypt(data, encryptionKey);
      return payload.data as string;
    } catch (error) {
      console.error("Decryption failed:", error);
      return null;
    }
  }

  static async setTokens(tokens: TokenPair) {
    const { access, refresh } = tokens;

    const encryptedAccessToken = await this.encrypt(access, 24 * 60 * 60); // 15 minutes
    const encryptedRefreshToken = await this.encrypt(refresh, 7 * 24 * 60 * 60); // 7 days

    setCookie("access_token", encryptedAccessToken, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hrs
    });

    setCookie("refresh_token", encryptedRefreshToken, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
  }

  static async getAccessToken(): Promise<string | null> {
    const encryptedToken = await getCookie("access_token");
    return encryptedToken ? await this.decrypt(encryptedToken) : null;
  }

  static async getRefreshToken(): Promise<string | null> {
    const encryptedToken = await getCookie("refresh_token");
    return encryptedToken ? await this.decrypt(encryptedToken) : null;
  }

  static clearTokens() {
    deleteCookie("access_token");
    deleteCookie("refresh_token");
  }
}
