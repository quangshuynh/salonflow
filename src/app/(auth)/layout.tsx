import Link from "next/link";
import { Scissors } from "lucide-react";

import { APP_NAME } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 py-12">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Scissors className="size-4" />
        </span>
        {APP_NAME}
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
