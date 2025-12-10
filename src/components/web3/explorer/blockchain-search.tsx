"use client"

import { useEffect, useState } from "react"
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
import { getChainlist } from "@/hooks/web3/metadata.service"

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

interface Chain {
    id: number,
    chain_id: string,
    name: string,
    alechemy_network_id: string,
    block_explorer_url?: string,
    rpc_url?: string,
    currency?: string,
    created_at?: string,
    updated_at?: string,
}
interface ChainListResponse {
  data?: { chains: Array<Chain> },
  errors?: string[]
}

export function BlockchainSearch({ onSearchResults, setLoading}: BlockchainSearchProps) {
  const [chainId, setChainId] = useState("1")
  const [txnHash, setTxnHash] = useState("")
  const [address, setAddress] = useState("")
  const [chainList, setChainList] = useState<Array<Chain>>([])
  const [chainsLoading, setChainsLoading] = useState(false)

  useEffect(() => {
    // Fetch chain list on component mount
    const fetchChainList = async () => {
      setChainsLoading(true);
      try {
        await getChainlist({
          successTask: (response: ChainListResponse) => {
            // response is of type ChainListResponse
            const apiResponse = response;
            setChainsLoading(false);
            if (apiResponse?.errors && apiResponse.errors.length > 0) {
              setChainList([]);
              toast.error(apiResponse.errors[0]);
            }

            const fetchedChains: Chain[] = apiResponse?.data?.chains || [];
            setChainList(fetchedChains);
          },
          failureTask: () => {
            setChainsLoading(false);
            toast.error("Failed to fetch chain list");
          },
          errorTask: () => {
            setChainsLoading(false);
            toast.error("An error occurred while fetching chain list");
          },
        });
      } catch (err) {
        console.error("fetchChainList: unexpected error", err);
        toast.error("Unexpected error while fetching chain list");
      }
    };

    fetchChainList();
  }, []); // run once on mount

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
        <Select value={chainId} onValueChange={(v) => setChainId(v)}>
          <SelectTrigger id="chain-select" className="w-full cursor-pointer">
            <SelectValue placeholder="Select a chain" />
          </SelectTrigger>

          <SelectContent>
            {chainsLoading ? (
              // show a disabled loading item while fetching
              <SelectItem value="1" className="cursor-not-allowed" disabled>
                Loading chains...
              </SelectItem>
            ) : chainList.length === 0 ? (
              // fallback when no chains returned
              <SelectItem value="1" className="cursor-not-allowed" disabled>
                No chains available
              </SelectItem>
            ) : (
              // map fetched chains to SelectItem components
              chainList.map((c,index) => {
                // prefer chainId; if missing, fallback to chain numeric id
                const value = c.chain_id ? c.chain_id : String(c.id);
                const label = c.name ? c.name : c.alechemy_network_id;
                return (
                  <SelectItem key={value} className="cursor-pointer" value={value}>
                    {label}
                  </SelectItem>
                );
              })
            )}
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
