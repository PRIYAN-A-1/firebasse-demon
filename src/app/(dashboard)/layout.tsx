import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      profile: true,
      fitnessPreference: true,
      subscription: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  // If user has not onboarded, redirect to onboarding
  if (!user.profile?.onboarded) {
    redirect("/onboarding");
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile,
    fitnessPreference: user.fitnessPreference,
    subscription: user.subscription,
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-white flex">
      {/* Desktop Fixed Left Sidebar */}
      <Sidebar user={safeUser} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0 pb-20 md:pb-8">
        <TopBar user={safeUser} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
