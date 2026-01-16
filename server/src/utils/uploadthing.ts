import { createUploadthing, type FileRouter } from "uploadthing/express";
 
const f = createUploadthing();
 
export const uploadRouter = {
  // Define as many file routes as you like, each with a unique routeSlug
  pdfUploader: f({
    pdf: {
      maxFileSize: "32MB",
      maxFileCount: 1,
    },
    text: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata);
      console.log("file url", file.url);
 
      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: "user", url: file.url, key: file.key, name: file.name };
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof uploadRouter;