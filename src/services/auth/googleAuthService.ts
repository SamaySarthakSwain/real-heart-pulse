/**
 * Google Auth Authentication Connector for HEART
 * Connects Google Identity Services (GIS) OAuth 2.0 with the Patient Store
 * Supports Google One-Tap, Token Flow, and Authenticated Google Profile synchronization.
 */

import { usePatientStore } from "@/store/patientStore";

// Default public Google OAuth Web Client ID for HEART Medical Hub
export const DEFAULT_GOOGLE_CLIENT_ID =
  "984251670832-heartclinicalhub9a2k8s9.apps.googleusercontent.com";

export function getGoogleClientId(): string {
  const envId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
  if (envId && typeof envId === "string" && envId.trim()) {
    return envId.trim();
  }
  return DEFAULT_GOOGLE_CLIENT_ID;
}

export interface GoogleUserProfile {
  name: string;
  email: string;
  picture?: string;
  sub?: string;
}

/**
 * Parses Google JWT ID token payload safely without external libraries
 */
export function parseGoogleJwt(token: string): GoogleUserProfile | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2 || !parts[1]) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const data = JSON.parse(jsonPayload);
    return {
      name: data.name || data.given_name || "Google User",
      email: data.email,
      picture: data.picture,
      sub: data.sub,
    };
  } catch (e) {
    console.warn("Failed to parse Google JWT token:", e);
    return null;
  }
}

/**
 * Performs Google authentication and syncs session with patient store
 */
export async function authenticateWithGoogleProfile(profile: GoogleUserProfile) {
  const loginWithGoogle = usePatientStore.getState().loginWithGoogle;
  return await loginWithGoogle({
    name: profile.name,
    email: profile.email,
  });
}
