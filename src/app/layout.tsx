import { AuthProvider, SpaceProvider } from "@/contexts"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

export const metadata = {
  title: "Argus Intelligence",
  description: "Argus Intelligence - AI powered insights",
  icons: {
    icon: "/logo.png",
  },
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <SpaceProvider>
            <main>
              {children}
            </main>
            <Toaster />
          </SpaceProvider>
        </AuthProvider>
      </body>
    </html>
  )
}