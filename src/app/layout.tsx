import { AuthProvider } from "@/contexts"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <main>
            {children}
          </main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}