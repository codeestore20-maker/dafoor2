import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";
 
// You can import the type from your server if you are using a monorepo
// or just define it manually if you are in a separate repo
// For now, we define it manually to match the server router
import type { FileRouter } from "uploadthing/express";

// Get API URL from environment variable or default to relative path
const apiUrl = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/uploadthing`
  : "/api/uploadthing";
 
export const UploadButton = generateUploadButton<any>({
  url: apiUrl,
});
export const UploadDropzone = generateUploadDropzone<any>({
  url: apiUrl,
});