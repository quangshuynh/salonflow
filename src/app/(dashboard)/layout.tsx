export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh w-full">
      {/* Sidebar will be added in feature/dashboard */}
      <main className="flex-1 p-6 lg:p-8">{children}</main>
    </div>
  );
}
