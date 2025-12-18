"use client"

import { useEffect, useState } from "react"
import { Calendar as CalendarIcon, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { blockchainAddressLookup } from "@/hooks/web3/address-service"
import { toast } from "sonner"
import { NeighbourData } from "@/types/blockchain"
import { getChainlist } from "@/hooks/web3/metadata.service"
import { Chain, ChainListResponse } from "@/types/matadata"

interface AddressSearchProps {
  onSearchResults: (data: NeighbourData, chainId: number, address: string, startTime: number, endTime: number, direction: number) => void
  onError: (error: string) => void
  setLoading: () => void
}

export function BlockchainAddressSearch({ onSearchResults, onError, setLoading }: AddressSearchProps) {
  const [selectedChainId, setSelectedChainId] = useState("1")
  const [addressId, setAddressId] = useState("")
  const [selectedDirection, setSelectedDirection] = useState("2")
  const [fromDate, setFromDate] = useState<Date>()
  const [toDate, setToDate] = useState<Date>()
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
    if (!addressId) {
      toast.error("Please enter a transaction address")
      return
    };
    let startTime: number = 0;
    let endTime: number = 0;
    if (fromDate && toDate) {
      startTime = Math.trunc(fromDate.getTime() / 1000);
      endTime = Math.trunc(toDate.getTime() / 1000) + 86399;
      console.log(startTime, endTime)
      if (startTime > endTime) {
        toast.error("Start date cannot be greater than end date")
        return
      }
    }
    toast.info("Processing request...")
    setLoading();
    
    await blockchainAddressLookup({
      chainId: parseInt(selectedChainId),
      address: addressId,
      startTime: startTime,
      endTime: endTime,
      direction: parseInt(selectedDirection),
      successTask: (response) => {
        onSearchResults(response, parseInt(selectedChainId), addressId, startTime, endTime, parseInt(selectedDirection));
      },
      failureTask: () => {
        toast.error("Search failed")
        onError("Search operation failed");
      },
      errorTask: () => {
        toast.error("An error occurred during search")
        onError("An error occurred during search");
      }
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-3">
      <div className="flex cursor-pointer flex-col gap-2 md:w-35">
        <Select value={selectedChainId} onValueChange={(v) => setSelectedChainId(v)}>
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
              chainList.map((c, index) => {
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
          From
        </span>
        <div className="flex flex-col gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                  !fromDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {fromDate ? format(fromDate, "PPP") : <span>From date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={fromDate} onSelect={setFromDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="flex flex-row items-center gap-2">
        <span className="text-sm mr-1">
          To
        </span>
        <div className="flex flex-col gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                  !toDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {toDate ? format(toDate, "PPP") : <span>To date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={toDate} onSelect={setToDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="flex flex-row items-center gap-2">
        <span className="text-sm mr-1">
          Tx.Dir.
        </span>
        <div className="flex cursor-pointer flex-col flex-1 gap-2 md:w-35">
            <Select value={selectedDirection} onValueChange={setSelectedDirection}>
            <SelectTrigger id="depth-select" className="w-full cursor-pointer">
                <SelectValue placeholder="Select Depth" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem className="cursor-pointer" value="0">INBOUND</SelectItem>
                <SelectItem className="cursor-pointer" value="1">OUTBOUND</SelectItem>
                <SelectItem className="cursor-pointer" value="2">ALL</SelectItem>
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
