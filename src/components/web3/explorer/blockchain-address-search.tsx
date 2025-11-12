"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { blockchainAddressLookup, searchBlockchainTransaction } from "@/hooks/web3-monitoring-service"
import { toast } from "sonner"
import { SearchAddressResponse } from "@/types/blockchain"
import { redirect } from "next/navigation"
import { error } from "console"

interface AddressSearchProps {
  onSearchResults: (data: SearchAddressResponse, address: string, depth: number) => void
  onError: (error: string) => void
  setLoading: () => void
}

export function BlockchainAddressSearch({ onSearchResults, onError, setLoading }: AddressSearchProps) {
  const [selectedChainId, setSelectedChainId] = useState("1")
  const [addressId, setAddressId] = useState("")
  const [selectedTime, setSelectedTime] = useState("d")
  const [selectedDepth, setSelectedDepth] = useState("3")

  const handleSearch = async () => {
    setLoading();
    if (!addressId) {
      toast.error("Please enter a transaction address")
      return
    };
    let startTime : number= 0;

    if (selectedTime == "h") {
      startTime = Math.trunc((Date.now() - 60 * 60 * 1000)/1000);
    } else if (selectedTime == "d") {
      startTime = Math.trunc((Date.now() - 24 * 60 * 60 * 1000)/1000);
    } else if (selectedTime == "w") {
      startTime = Math.trunc((Date.now() - 7 * 24 * 60 * 60 * 1000)/1000);
    } else if (selectedTime == "m") {
      startTime = Math.trunc((Date.now() - 30 * 24 * 60 * 60 * 1000)/1000);
    } else if (selectedTime == "3m") {
      startTime = Math.trunc((Date.now() - 3 * 30 * 24 * 60 * 60 * 1000)/1000);
    } else if (selectedTime == "y") {
      startTime = Math.trunc((Date.now() - 365 * 24 * 60 * 60 * 1000)/1000);
    } else if (selectedTime == "5y") {
      startTime = Math.trunc((Date.now() - 5 * 365 * 24 * 60 * 60 * 1000)/1000);
    }

    console.log("startTime: ",startTime);
    toast.info("Processing request...")

    await blockchainAddressLookup({
      chainId: parseInt(selectedChainId),
      address: addressId,
      startTime: startTime,
      depth: parseInt(selectedDepth),
      successTask: (response) => {
        onSearchResults(response, addressId, parseInt(selectedDepth));
      },
      failureTask: () => {
        toast.error("Search failed")
        onError("Search operation failed");
      },
      errorTask: () => {
        toast.error("An error occurred during search")
        onError("An error occurred during search");
      },
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-3">
      <div className="flex cursor-pointer flex-col gap-2 md:w-48">
        <Select value={selectedChainId} onValueChange={setSelectedChainId}>
          <SelectTrigger id="chain-select" className="w-full cursor-pointer">
            <SelectValue placeholder="Select a chain" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem className="cursor-pointer" value="1">Ethereum</SelectItem>
            <SelectItem className="cursor-pointer" value="137">Polygon</SelectItem>
            <SelectItem className="cursor-pointer" value="42161">Arbitrum</SelectItem>
            <SelectItem className="cursor-pointer" value="10">Optimism</SelectItem>
            <SelectItem className="cursor-pointer" value="8453">Base</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        <Input
          id="address-input"
          placeholder="Enter address"
          className="w-full"
          value={addressId}
          onChange={(e) => setAddressId(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <span className="text-sm mr-1">
          Show data for
        </span>
        <div className="flex cursor-pointer flex-col gap-2 md:w-48 mr-2">
          <Select value={selectedTime} onValueChange={setSelectedTime}>
            <SelectTrigger id="time-range-select" className="w-full cursor-pointer">
                <SelectValue placeholder="Select a time frame" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem className="cursor-pointer" value="h">Last hour</SelectItem>
                <SelectItem className="cursor-pointer" value="d">Last day</SelectItem>
                <SelectItem className="cursor-pointer" value="w">Last week</SelectItem>
                <SelectItem className="cursor-pointer" value="m">Last month</SelectItem>
                <SelectItem className="cursor-pointer" value="3m">Last 3 months</SelectItem>
                <SelectItem className="cursor-pointer" value="y">Last year</SelectItem>
                <SelectItem className="cursor-pointer" value="5y">Last 5 years</SelectItem>
                <SelectItem className="cursor-pointer" value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <span className="text-sm mr-1">
          Depth
        </span>
        <div className="flex cursor-pointer flex-col gap-2 md:w-20">
            <Select value={selectedDepth} onValueChange={setSelectedDepth}>
            <SelectTrigger id="depth-select" className="w-full cursor-pointer">
                <SelectValue placeholder="Select Depth" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem className="cursor-pointer" value="1">1</SelectItem>
                <SelectItem className="cursor-pointer" value="2">2</SelectItem>
                <SelectItem className="cursor-pointer" value="3">3</SelectItem>
            </SelectContent>
            </Select>
        </div>
      </div>
      <Button className="w-full md:w-auto cursor-pointer" onClick={handleSearch}>
        <span className="md:hidden">Search</span>
        <Search className="size-4" />
      </Button>
    </div>
  )
}
