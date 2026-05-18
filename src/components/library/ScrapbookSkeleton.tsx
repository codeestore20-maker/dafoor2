import React from 'react';
import { motion } from 'framer-motion';

export const SidebarSkeleton = () => {
  return (
    <div className="w-full flex flex-col gap-3 p-4 xl:p-0 pt-0 xl:pt-0 animate-pulse">
      {/* Fake Tabs */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="w-full h-12 bg-stone-200/50 rounded-xl relative overflow-hidden">
          <div className="absolute top-2 bottom-2 left-0 w-1 bg-stone-300 rounded-r-md"></div>
          <div className="absolute top-3 left-4 w-6 h-6 bg-stone-300 rounded-md"></div>
          <div className="absolute top-4 left-14 w-24 h-4 bg-stone-300 rounded-full"></div>
        </div>
      ))}
      <div className="w-full h-12 border-2 border-dashed border-stone-200 rounded-xl mt-2"></div>
    </div>
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="w-full h-full p-4 md:p-8 animate-pulse">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column Skeleton */}
        <div className="lg:col-span-8">
          {/* Header Skeleton */}
          <div className="mb-8 space-y-3">
            <div className="w-64 h-8 bg-stone-200 rounded-lg"></div>
            <div className="w-48 h-5 bg-stone-100 rounded-lg"></div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-stone-100 rounded-xl border border-stone-200"></div>
            ))}
          </div>

          {/* Subjects Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="relative h-40 md:h-80 w-full rounded-xl bg-stone-100 border border-stone-200">
                <div className="absolute -top-3 left-0 w-1/3 h-6 bg-stone-200 rounded-t-lg"></div>
                <div className="absolute bottom-4 left-4 right-4 h-6 bg-stone-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-4 space-y-8 pt-4">
           <div className="h-48 bg-stone-100 rounded-sm shadow-sm border-b-2 border-r-2 border-stone-200 rotate-1"></div>
           <div className="h-64 bg-stone-50 rounded-2xl shadow-sm border border-stone-200"></div>
        </div>

      </div>
    </div>
  );
};
