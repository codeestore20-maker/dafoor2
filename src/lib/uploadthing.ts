import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";
 
// You can import the type from your server if you are using a monorepo
// or just define it manually if you are in a separate repo
// For now, we define it manually to match the server router
import type { FileRouter } from "uploadthing/express";
 
export const UploadButton = generateUploadButton<any>();
export const UploadDropzone = generateUploadDropzone<any>();