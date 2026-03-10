// src/components/Skeleton.tsx
import React from "react";

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

// --- Preset skeletons for specific use cases ---

export const UpdateCardSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
    {/* Image */}
    <Skeleton className="aspect-video rounded-[40px]" />
    {/* Text */}
    <div className="space-y-5">
      <div className="flex gap-6">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-36" />
      </div>
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-4/5" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-5 w-24" />
    </div>
  </div>
);

export const InventoryRowSkeleton: React.FC = () => (
  <tr>
    {/* checkbox */}
    <td className="px-4 py-4">
      <Skeleton className="h-4 w-4" />
    </td>
    {/* product */}
    <td className="px-4 py-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </td>
    {/* stock */}
    <td className="px-4 py-4">
      <Skeleton className="h-6 w-20 rounded-lg" />
    </td>
    {/* price */}
    <td className="px-4 py-4">
      <Skeleton className="h-5 w-16" />
      <Skeleton className="h-3 w-12 mt-1" />
    </td>
    {/* category */}
    <td className="px-4 py-4">
      <Skeleton className="h-6 w-24 rounded-lg" />
    </td>
    {/* condition */}
    <td className="px-4 py-4">
      <Skeleton className="h-6 w-20 rounded-lg" />
    </td>
    {/* status */}
    <td className="px-4 py-4">
      <Skeleton className="h-6 w-16 rounded-lg" />
    </td>
    {/* AI */}
    <td className="px-4 py-4">
      <Skeleton className="h-7 w-20 rounded-lg" />
    </td>
    {/* actions */}
    <td className="px-4 py-4">
      <div className="flex justify-end gap-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </td>
  </tr>
);
export const ContentRowSkeleton: React.FC = () => (
  <tr className="border-t">
    {/* Title */}
    <td className="p-4">
      <Skeleton className="h-4 w-64" />
    </td>
    {/* Category */}
    <td className="p-4">
      <Skeleton className="h-4 w-36" />
    </td>
    {/* Date */}
    <td className="p-4">
      <Skeleton className="h-4 w-28" />
    </td>
    {/* Featured star */}
    <td className="p-4">
      <Skeleton className="h-4 w-4 rounded-full" />
    </td>
    {/* Actions */}
    <td className="p-4">
      <div className="flex justify-end gap-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </td>
  </tr>
);
export const OrderRowSkeleton: React.FC = () => (
  <tr className="border-t border-gray-50">
    <td className="px-5 py-4">
      <Skeleton className="h-4 w-28" />
    </td>
    <td className="px-5 py-4">
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-40" />
      </div>
    </td>
    <td className="px-5 py-4">
      <Skeleton className="h-6 w-24 rounded-full" />
    </td>
    <td className="px-5 py-4">
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-3 w-12 mt-1" />
    </td>
    <td className="px-5 py-4">
      <Skeleton className="h-5 w-16" />
      <Skeleton className="h-3 w-20 mt-1" />
    </td>
    <td className="px-5 py-4">
      <Skeleton className="h-4 w-24" />
    </td>
    <td className="px-5 py-4">
      <div className="flex justify-end gap-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </td>
  </tr>
);

export const CustomerRowSkeleton: React.FC = () => (
  <tr className="border-t border-gray-50">
    <td className="px-5 py-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-full shrink-0" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-44" />
        </div>
      </div>
    </td>
    <td className="px-5 py-4">
      <Skeleton className="h-4 w-28" />
    </td>
    <td className="px-5 py-4">
      <Skeleton className="h-4 w-20" />
    </td>
    <td className="px-5 py-4">
      <Skeleton className="h-4 w-24" />
    </td>
    <td className="px-5 py-4">
      <div className="flex justify-end gap-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </td>
  </tr>
);

export const OrderCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100 border border-gray-100 p-8 space-y-5">
    <div className="flex flex-col md:flex-row md:justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-52" />
      </div>
      <Skeleton className="h-8 w-28 rounded-xl" />
    </div>
    <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
    <div className="flex justify-between items-center">
      <div className="space-y-1.5">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-9 w-28 rounded-xl" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
    </div>
  </div>
);
