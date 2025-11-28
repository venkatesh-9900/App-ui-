"use client"

import { ProtectedRoute } from "@/components/protected-route";
import { CopyButton } from "@/components/ui/copy-button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import AddressStatic from "@/components/web3-monitoring/address-static";
import { BlockchainAddressSearch } from "@/components/web3-monitoring/blockchain-address-search";
import { DashboardNavbar } from "@/components/web3-monitoring/dashboard-navbar";
import { NeighboursView } from "@/components/web3-monitoring/neighbours-view";
import { NeighbourResponse, NeighboursColumn } from "@/types/blockchain";
import { closestCenter, DndContext, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { set } from "date-fns";
import React from "react";
import { useEffect, useState } from "react"
import { toast } from "sonner";

interface txDepthData {
    address: string
    depth: number
}

interface txCount extends txDepthData {
    count: number
}

export default function AddressPage() {
    const [addressId, setAddressId] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [addressData, setAddressData] = useState<NeighboursColumn[]>([])
    const [errorResponse, setErrorResponse] = useState(false)
    const [selectedChainId, setSelectedChainId] = useState(1)
    const [selectedDirection, setSelectedDirection] = useState(2)
    const [startTime, setStartTime] = useState<number>(0)
    const [endTime, setEndTime] = useState<number>(
        Math.trunc(new Date().getTime() / 1000) + 86399
    )
    const [txNumber, setTxNumber] = useState<number>(0);

    // useEffect(() => {
    //     if (apiData.nodes.length > 0){
    //         setAddressId(apiData.nodes[0])
    //     }
    //     // setAddressId(apiData.nodes[0])
    //     let base_address_data = getAddressAnalytics(apiData) || []
    //     console.log(base_address_data)
    //     setAddressData(base_address_data)
    //     setIsLoading(false)
    // }, [apiData]);

    // const getAddressAnalytics = (graph_data: SearchAddressResponse, address?: string, depth?: number, excludeAddress?: string) : NeighboursColumn[] | null => {
    //     let base_node = (!address || !depth) ? graph_data.nodes[0] : address
    //     let base_depth = (!address || !depth) ? 0 : depth
    //     let address_excl = excludeAddress || ""
    //     if (depth == depthValue) return null;
    //     const tx_data_list : GraphEdgeTxnData[] = []
    //     for (let i = 0; i < graph_data.edges.length; i++) {
    //         if (tx_data_list.findIndex((e) => e.txHash == graph_data.edges[i].txHash && e.from == graph_data.edges[i].from && e.to == graph_data.edges[i].to) == -1) {
    //             tx_data_list.push(graph_data.edges[i])
    //         }
    //     }
    //     let selected_txn_data_list = tx_data_list.filter((e) => e.from == base_node || e.to == base_node && e.depth == base_depth + 1)
    //     let address_list = selected_txn_data_list.map((e) => e.from == base_node ? e.to : e.from)
    //     address_list = address_list.filter((e) => e != address_excl)
    //     let curr_depth = base_depth
    //     const counts: txCount[] = Object.entries(
    //         address_list.reduce<Record<string, number>>((acc, curr) => {
    //             acc[curr] = (acc[curr] || 0) + 1;
    //             return acc;
    //         }, {})
    //     ).map(([address, count]) => ({ address: address, depth: curr_depth != -1 ? curr_depth + 1 : curr_depth, count: count })).sort((a, b) => b.count - a.count);
    //     const result_list : NeighboursColumn[] = counts.map((e) => {
    //         return { address: e.address, depth: e.depth, txns_no: e.count, neighbours: getAddressAnalytics(graph_data, e.address, e.depth, base_node)};
    //     });
    //     return result_list;
    // }

    const getNeighboursData = (data: NeighbourResponse[]) : NeighboursColumn[] => {
        return data.map((e: NeighbourResponse) => { 
            return { address: e.address, depth: 1, txns_no: e.tx_count }
        })
    }

    const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {})
    );
    const sortableId = React.useId()

    return (
        <ProtectedRoute>
            <DashboardNavbar />
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <Tabs
                            defaultValue="outline"
                            className="w-full flex-col justify-start gap-6"
                        >
                            <TabsContent
                                value="outline"
                                className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
                            >
                                <BlockchainAddressSearch 
                                    onError={function (error: string): void {
                                        setIsLoading(false)
                                        setErrorResponse(true)
                                        toast.error(error);
                                    }} 
                                    onSearchResults={(data, chainId, address, startTime, endTime, direction) => {
                                        setSelectedChainId(chainId)
                                        setStartTime(startTime)
                                        setEndTime(endTime)
                                        setSelectedDirection(direction)
                                        setAddressId(address)
                                        setIsLoading(false)
                                        setAddressData(getNeighboursData(data.neighbours))
                                        setTxNumber(data.tx_count)
                                        setErrorResponse(false)
                                    }}
                                    setLoading={() => {
                                        setIsLoading(true)
                                        setErrorResponse(false)
                                    }}
                                />
                                {isLoading ? <AddressStatic type="loading" message="Loading..." /> :
                                errorResponse ? <AddressStatic type="error" message="Unable to show results due to error" /> : 
                                addressId == "" ? <AddressStatic type="search" message="Search for an address" /> :
                                <div className="overflow-hidden rounded-lg relative">
                                    <div className="flex flex-row items-end pb-5">
                                        <span className="text-md text-muted-foreground mr-1">
                                            Address 
                                        </span>
                                        <span className={`text-xl font-medium mr-1`}>{addressId}</span>
                                        <CopyButton className={"mb-0.5"} content={addressId} variant="ghost" size="sm" />
                                    </div>
                                    <DndContext
                                        collisionDetection={closestCenter}
                                        modifiers={[restrictToVerticalAxis]}
                                        sensors={sensors}
                                        id={sortableId}
                                    >
                                        <div className="flex flex-row justify-end items-center gap-2">  
                                        </div>
                                        <NeighboursView 
                                            chain_id={selectedChainId} 
                                            start_date={new Date(startTime * 1000)} 
                                            end_date={new Date(endTime * 1000)} 
                                            direction={selectedDirection} 
                                            current_address={addressId} 
                                            depth={1} 
                                            data={addressData} 
                                            tx_count={txNumber}
                                        />
                                    </DndContext>
                                </div>}
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
      )
    
}