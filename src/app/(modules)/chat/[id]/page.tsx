import { redirect } from "next/navigation"

export default async function ChatDetailsPage({
    params,
  }: {
    params: Promise<{ id: string }>
  }) {
    const { id } = await params
    redirect(`/chat?sessionId=${id}`)
  }