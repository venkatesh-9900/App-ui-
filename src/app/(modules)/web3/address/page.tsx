"use client"

import { ProtectedRoute } from "@/components/protected-route";
import { CopyButton } from "@/components/ui/copy-button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import AddressStatic from "@/components/web3-monitoring/address-static";
import { BlockchainAddressSearch } from "@/components/web3-monitoring/blockchain-address-search";
import { DashboardNavbar } from "@/components/web3-monitoring/dashboard-navbar";
import { NeighboursView } from "@/components/web3-monitoring/neighbours-view";
import { GraphEdgeTxnData, NeighboursColumn, SearchAddressResponse } from "@/types/blockchain";
import { closestCenter, DndContext, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
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
    const [depthValue, setDepthValue] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [addressData, setAddressData] = useState<NeighboursColumn[]>([])
    const [apiData, setApiData] = useState<SearchAddressResponse>({nodes: [], edges: []})
    const [errorResponse, setErrorResponse] = useState(false)

    useEffect(() => {
        if (apiData.nodes.length > 0){
            setAddressId(apiData.nodes[0])
        }
        // setAddressId(apiData.nodes[0])
        let base_address_data = getAddressAnalytics(apiData) || []
        console.log(base_address_data)
        setAddressData(base_address_data)
        setIsLoading(false)
    }, [apiData]);

    const getAddressAnalytics = (graph_data: SearchAddressResponse, address?: string, depth?: number, excludeAddress?: string) : NeighboursColumn[] | null => {
        let base_node = (!address || !depth) ? graph_data.nodes[0] : address
        let base_depth = (!address || !depth) ? 0 : depth
        let address_excl = excludeAddress || ""
        if (depth == depthValue) return null;
        const tx_data_list : GraphEdgeTxnData[] = []
        for (let i = 0; i < graph_data.edges.length; i++) {
            if (tx_data_list.findIndex((e) => e.txHash == graph_data.edges[i].txHash && e.from == graph_data.edges[i].from && e.to == graph_data.edges[i].to) == -1) {
                tx_data_list.push(graph_data.edges[i])
            }
        }
        let selected_txn_data_list = tx_data_list.filter((e) => e.from == base_node || e.to == base_node && e.depth == base_depth + 1)
        let address_list = selected_txn_data_list.map((e) => e.from == base_node ? e.to : e.from)
        address_list = address_list.filter((e) => e != address_excl)
        let curr_depth = base_depth
        const counts: txCount[] = Object.entries(
            address_list.reduce<Record<string, number>>((acc, curr) => {
                acc[curr] = (acc[curr] || 0) + 1;
                return acc;
            }, {})
        ).map(([address, count]) => ({ address: address, depth: curr_depth != -1 ? curr_depth + 1 : curr_depth, count: count })).sort((a, b) => b.count - a.count);
        const result_list : NeighboursColumn[] = counts.map((e) => {
            return { address: e.address, depth: e.depth, txns_no: e.count, neighbours: getAddressAnalytics(graph_data, e.address, e.depth, base_node)};
        });
        return result_list;
    }

    // const populateGraphDataOnTable = (graph_data: SearchAddressResponse) => {
    //     let base_node = graph_data.nodes[0]
    //     const tx_data_list = graph_data.edges
    //     let tx_queue = new Queue<txDepthData>();
    //     tx_queue.enqueue({ address: base_node, depth: 0 })
    //     while (!tx_queue.isEmpty()) {
    //         let selected_address_node = tx_queue.dequeue()
    //         let selected_txn_data_list = tx_data_list.filter((e) => e.from == selected_address_node?.address || e.to == selected_address_node?.address && e.depth == ((selected_address_node?.depth || -99) + 1) )
    //         let address_list = selected_txn_data_list.map((e) => e.from == selected_address_node?.address ? e.to : e.from)
    //         let curr_depth = selected_address_node?.depth || -1
    //         const counts: txCount[] = Object.entries(
    //             address_list.reduce<Record<string, number>>((acc, curr) => {
    //                 acc[curr] = (acc[curr] || 0) + 1;
    //                 return acc;
    //             }, {})
    //         ).map(([address, count]) => ({ address: address, depth: curr_depth != -1 ? curr_depth + 1 : curr_depth, count: count }));
    //         for (let i = 0; i < counts.length; i++) {
    //             tx_queue.enqueue({ address: counts[i].address, depth: counts[i].depth })
    //         }
    //     }
    // }

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
                                    onSearchResults={(data, address, depth) => {
                                        setAddressId(address)
                                        setDepthValue(depth)
                                        setIsLoading(false)
                                        setApiData(data)
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
                                        <NeighboursView current_address={addressId} depth={0} data={addressData} />
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