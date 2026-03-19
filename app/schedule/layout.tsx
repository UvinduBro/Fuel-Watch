import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fuel Quota Schedule",
  description: "Check your allowed fuel pumping dates in Sri Lanka based on your vehicle registration number.",
};

export default function ScheduleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
