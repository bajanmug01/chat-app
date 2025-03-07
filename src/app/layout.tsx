import "LA/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { AuthProvider } from "../contexts/AuthContext";
import { TRPCReactProvider } from "LA/trpc/react";

export const metadata: Metadata = {
  title: "Chat App",
  description: "A real-time chat application",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <AuthProvider>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
