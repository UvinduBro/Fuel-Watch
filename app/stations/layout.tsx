import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fuel Stations",
  description: "Browse and search through all fuel stations across Sri Lanka with real-time availability updates.",
};

export default function StationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
