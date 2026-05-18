import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";
 
// You can import the type from your server if you are using a monorepo
// or just define it manually if you are in a separate repo
// For now, we define it manually to match the server router
import type { FileRouter } from "uploadthing/express";

// Smart URL handling to prevent double /api/api
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  // Fallback to relative path if no env var
  if (!envUrl) return "/api/uploadthing";
  
  // Clean the URL: remove trailing slashes and trailing /api
  // Example 1: "https://app.com/api" -> "https://app.com"
  // Example 2: "https://app.com/" -> "https://app.com"
  const baseUrl = envUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
  
  return `${baseUrl}/api/uploadthing`;
};
 
const apiUrl = getApiUrl();
 
export const UploadButton = generateUploadButton<any>({
  url: apiUrl,
});
export const UploadDropzone = generateUploadDropzone<any>({
  url: apiUrl,
});