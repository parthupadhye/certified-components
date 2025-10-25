// src/core.ts

export const USER_API_KEY = "cck-1425-MOCK-API-KEY-001";
export const ARTICLE_CONTENT_ID = "FIN_DEFI_01_MOCK";
export const GLOSSARY_CONTENT_ID = "GLOSS_LIST_02_MOCK";
export const VERIFICATION_ENDPOINT_BASE_URL = "https://api.certified-content.com/v1/verify";

export enum VerificationState {
  LOADING,
  CERTIFIED,
  UNCERTIFIED,
  ERROR,
}

export const buildVerificationUrl = (genContentId: string, userKey: string): string => {
  return `${VERIFICATION_ENDPOINT_BASE_URL}?genContentId=${genContentId}&userKey=${userKey}`;
};

export const decodeUserSecret = (userSecret: string): string => {
  const decoded = atob(userSecret);
  return decoded.substring(10);
};

export const fetchData = async (url: string): Promise<any> => {
  let attempts = 0;
  const maxAttempts = 3;
  const initialDelay = 1000;

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }

    attempts++;
    await new Promise((resolve) => setTimeout(resolve, initialDelay * Math.pow(2, attempts)));
  }

  throw new Error("Failed to fetch data after multiple attempts.");
};
