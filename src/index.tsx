import './index.css';
import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from "./App";
import './i18n'; // Import i18n configuration

const queryClient = new QueryClient();

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <QueryClientProvider client={queryClient}>
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-[#FFF8E7] text-stone-500 font-serif">Loading...</div>}>
      <App />
    </Suspense>
  </QueryClientProvider>
);