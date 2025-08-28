import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
}) => {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      style={{
        width: width,
        height: height,
      }}
    />
  );
};

// Predefined skeleton components
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 1,
  className,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="1rem"
          className={cn("w-full", i === lines - 1 ? "w-3/4" : "w-full")}
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <div
      className={cn(
        "p-4 border rounded-lg bg-blue-50 animate-pulse",
        "animate-[slideIn_0.6s_ease-out]",
        className
      )}
      style={{
        animation: "slideIn 0.6s ease-out",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton height="2rem" width="3rem" className="rounded-md" />
          <div className="space-y-2">
            <Skeleton height="1rem" width="8rem" />
            <Skeleton height="0.875rem" width="6rem" />
          </div>
        </div>
        <Skeleton height="1.5rem" width="3rem" className="rounded-md" />
      </div>
    </div>
  );
};
