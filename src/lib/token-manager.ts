import { deleteCookie, getCookie, setCookie } from "cookies-next";
import crypto from "crypto";
import { EncryptJWT, jwtDecrypt } from "jose";

import { type TokenPair } from "@/types/api";

import { env } from "./env";

const rawSecret = env.NEXT_PUBLIC_JWT_SECRET;

const TOKENS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
} as const;

export class TokenStorage {
  private static async getEncryptionKey(): Promise<Uint8Array> {
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
    const { access, token, refresh } = tokens;

    const accessToken = access ? access : token;

    const encryptedAccessToken = await this.encrypt(accessToken, 24 * 60 * 60);

    const encryptedRefreshToken = await this.encrypt(refresh, 7 * 24 * 60 * 60);

    setCookie(TOKENS.ACCESS_TOKEN, encryptedAccessToken, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60,
    });

    setCookie(TOKENS.REFRESH_TOKEN, encryptedRefreshToken, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
    });
  }

  static async getAccessToken(): Promise<string | null> {
    const encryptedToken = await getCookie(TOKENS.ACCESS_TOKEN);
    return encryptedToken ? await this.decrypt(encryptedToken as string) : null;
  }

  static async getRefreshToken(): Promise<string | null> {
    const encryptedToken = await getCookie(TOKENS.REFRESH_TOKEN);
    return encryptedToken ? await this.decrypt(encryptedToken as string) : null;
  }

  static clearTokens() {
    deleteCookie(TOKENS.ACCESS_TOKEN);
    deleteCookie(TOKENS.REFRESH_TOKEN);
  }
}
