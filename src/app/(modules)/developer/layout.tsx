import { ApiKeyContextProvider } from "@/contexts/api-key-context"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ApiKeyContextProvider>{children}</ApiKeyContextProvider>
  )
}