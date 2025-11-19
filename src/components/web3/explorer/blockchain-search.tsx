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
import { searchBlockchainTransaction } from "@/hooks/web3/explorer-service"
import { toast } from "sonner"

interface BlockchainSearchProps {
  onSearchResults?: (data: SearchResultsData, params: SearchParams) => void,
  setLoading?: (loading: boolean) => void,
}

interface SearchParams {
  chainId: number
  txhash?: string
  address?: string
}

interface SearchResultsData {
  txns?: Array<{
    txn_hash: string
    block_number: number
    block_hash: string
    timestamp: string
    from_address: string
    to_address: string
    value: number
    gas: number
    gas_price: number
    gas_used: number
    status: string
    nonce: number
  }>
  errors?: string[]
}

export function BlockchainSearch({ onSearchResults, setLoading}: BlockchainSearchProps) {
  const [chainId, setChainId] = useState("1")
  const [txnHash, setTxnHash] = useState("")
  const [address, setAddress] = useState("")

  const handleSearch = async () => {
    if (!txnHash && !address) {
      toast.error("Please enter a transaction hash or address")
      return
    }
    setLoading?.(true);
    await searchBlockchainTransaction({
      chainId: parseInt(chainId),
      txhash: txnHash,
      address: address,
      page: 1,
      offset: 15,
      successTask: (response) => {
        const apiResponse = response as any
        
        // Check if response has errors
        if (apiResponse.errors && apiResponse.errors.length > 0) {
          toast.error(apiResponse.errors[0])
          const mappedData: SearchResultsData = {
            errors: apiResponse.errors,
          }
          onSearchResults?.(mappedData, { chainId: parseInt(chainId), txhash: txnHash, address: address })
          return
        }

        // Success case
        toast.success("Search completed successfully")
        const mappedData: SearchResultsData = {
          txns: apiResponse.data?.txns || [],
        }
        onSearchResults?.(mappedData, { chainId: parseInt(chainId), txhash: txnHash, address: address })
      },
      failureTask: () => {
        setLoading?.(false);
        toast.error("Search failed")
      },
      errorTask: () => {
        toast.error("An error occurred during search")
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
        <Select value={chainId} onValueChange={setChainId}>
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
          id="txn-hash"
          placeholder="Enter transaction hash"
          className="w-full"
          value={txnHash}
          onChange={(e) => setTxnHash(e.target.value)}
          onKeyDown={handleKeyPress}
        />
      </div>

      <div className="flex flex-col gap-2 flex-1">
        <Input
          id="address-input"
          placeholder="Enter address"
          className="w-full"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={handleKeyPress}
        />
      </div>

      <Button className="w-full md:w-auto cursor-pointer" onClick={handleSearch}>
        <span className="md:hidden">Search</span>
        <Search className="size-4" />
      </Button>
    </div>
  )
}
