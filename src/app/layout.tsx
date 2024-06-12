import "./globals.css";

import AccountProvider from "./accountProvider";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import Modal from "@/components/Modal";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Embedded Accounts Getting Started",
  description: "Embedded Accounts Quickstart Guide",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script async src="https://telegram.org/js/telegram-web-app.js" />
      </head>
      <body className={inter.className}>
        <Providers>
          <AccountProvider>
            <>
              {children}

              <Modal />
            </>
          </AccountProvider>
        </Providers>
      </body>
    </html>
  );
}
