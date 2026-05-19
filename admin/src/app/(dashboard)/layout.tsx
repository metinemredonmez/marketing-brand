import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { SidebarMobile } from "@/components/dashboard/sidebar-mobile";
import { Topbar } from "@/components/dashboard/topbar";
import { getMe } from "@/lib/api/client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getMe();
  if (!user) {
    redirect("/login");
  }
  const ADMIN_ROLES = [
    "super_admin",
    "editor",
    "writer",
    "social_manager",
    "sales",
  ];
  if (!ADMIN_ROLES.includes(user.role)) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar — md+ */}
      <Sidebar />
      {/* Mobile drawer — server sidebar prop olarak gönderilir */}
      <SidebarMobile>
        <Sidebar />
      </SidebarMobile>
      <div className="flex flex-1 flex-col">
        <Topbar userEmail={user.email} userName={user.fullName} />
        <main className="flex-1 bg-surface p-6 pt-16 md:pt-6">{children}</main>
      </div>
    </div>
  );
}
