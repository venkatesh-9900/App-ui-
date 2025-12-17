import { format } from "date-fns"

export function truncateText (address: string) {
  if (address.length <= 12) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatDate(dateString?: string) {
    if (!dateString) return 'N/A'
    try {
      return format(new Date(dateString), 'MMM d, yyyy')
    } catch {
      return 'N/A'
    }
  }