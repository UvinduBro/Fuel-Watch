import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wallet Pass",
  description: "Convert your Sri Lanka Fuel QR code into an Apple or Google Wallet pass easily via Hayaku.",
};

export default function PassLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
