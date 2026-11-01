import { Suspense } from "react";
import type { Metadata } from "next";
import { ProfileContent } from "@/components/profile-content";
import { Spinner } from "@/components/ui/spinner";

export const metadata: Metadata = {
  title: "My Profile",
  description:
    "View and manage your BookNook reader profile, circulation standing, and reading activity.",
};

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto py-28 px-4 flex flex-col items-center justify-center gap-4 text-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
