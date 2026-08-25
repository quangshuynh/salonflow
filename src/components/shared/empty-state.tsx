import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Optional call to action, rendered under the description. */
  children?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center sm:py-12",
        className
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-5" aria-hidden />
      </div>
      <p className="mt-1 text-sm font-medium">{title}</p>
      {description && (
        <p className="max-w-sm text-sm text-balance text-muted-foreground">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
