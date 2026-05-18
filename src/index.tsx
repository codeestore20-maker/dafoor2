import './index.css';
import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { App } from "./App";
import './i18n'; // Import i18n configuration

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes (Aggressive caching for speed)
      gcTime: 1000 * 60 * 30, // 30 minutes (Keep in memory longer)
      retry: 1,
      refetchOnWindowFocus: false, // Don't refetch on tab switch to avoid layout shifts
    },
  },
});

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <QueryClientProvider client={queryClient}>
    <GoogleOAuthProvider clientId="502680907107-7vpa9u8upgiune9drdbkejr1dhl2m65t.apps.googleusercontent.com">
      <Suspense fallback={<div className="flex items-center justify-center h-screen bg-[#FFF8E7] text-stone-500 font-serif">Loading...</div>}>
        <App />
      </Suspense>
    </GoogleOAuthProvider>
  </QueryClientProvider>
);