import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduFund — Smart Education Loan Platform",
  description:
    "Apply for education loans with instant eligibility assessment. Trusted by 10,000+ students across India. Fast approvals, transparent process, zero hidden fees.",
  keywords: "education loan, student loan, study abroad loan, India education finance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
