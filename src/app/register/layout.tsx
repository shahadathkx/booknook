import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description:
    "Register for a BookNook reader account to browse, borrow, and contribute books to our community shelves.",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
