import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { Suspense, type ReactNode } from "react";
import { SignInSuccessToast } from "@/components/auth/SignInSuccessToast";
import { CartProvider } from "@/components/cart/CartProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans"
});

export const metadata: Metadata = {
  title: {
    default: "Aunty's Plants",
    template: "%s | Aunty's Plants"
  },
  description: "Homegrown houseplants for local pickup in Tracy."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${openSans.variable} ${openSans.className} min-h-screen`}>
        <CartProvider>
          <div className="flex min-h-screen flex-col bg-[#f6f2eb]">
            <Header />
            <Suspense fallback={null}>
              <SignInSuccessToast />
            </Suspense>
            <main className="grow">{children}</main>
            <Footer />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
