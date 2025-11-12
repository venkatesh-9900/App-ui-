"use client"

import { SearchCodeIcon, SearchXIcon } from "lucide-react"
import { Spinner } from "@/components/ui/spinner";

interface AddressStaticProps {
    type: string;
    message: string;
}


export default function AddressStatic({ type = "loading", message = "Loading..." }: AddressStaticProps) {
  return (
    <div className="flex flex-col h-100">
    <div className="flex-1 bg-background flex flex-col items-center justify-center text-center px-4 gap-6">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            {type == "error" ?
                <SearchXIcon className="h-18 w-18 text-primary relative z-10" /> :
                type == "search" ?
                <SearchCodeIcon className="h-18 w-18 text-primary relative z-10" /> :
                <Spinner />
            }
          </div>
        </div>

        {/* Text */}
        <div className="space-y-1">
          <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {message}
          </h1>
        </div>
      </div>
    </div>
    </div>
  )
}
