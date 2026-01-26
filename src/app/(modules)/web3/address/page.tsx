"use client"

import { ProtectedRoute } from "@/components/protected-route";
import { CopyButton } from "@/components/ui/copy-button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import AddressStatic from "@/components/web3/address/address-static";
import { BlockchainAddressSearch } from "@/components/web3/address/blockchain-address-search";
import { DashboardNavbar } from "@/components/web3/explorer/dashboard-navbar";
import { NeighboursView } from "@/components/web3/address/neighbours-view";
import { NeighbourResponse, NeighboursColumn } from "@/types/blockchain";
import { AddressNeighboursGraph } from "@/components/web3/address/address-neighbours-graph"
import { AddressNeighboursGraphCanvas } from "@/components/web3/address/address-neighbours-graph-canvas"
import { closestCenter, DndContext, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import React from "react";
import { useState } from "react"
import { toast } from "sonner";

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
                                                    {/* <NeighboursView 
                                            chain_id={selectedChainId} 
                                            start_date={new Date(startTime * 1000)} 
                                            end_date={new Date(endTime * 1000)} 
                                            direction={selectedDirection} 
                                            current_address={addressId} 
                                            depth={1} 
                                            data={addressData} 
                                            tx_count={txNumber}
                                        /> */}
                                                    {/* <AddressNeighboursGraph
                                                        chainId={selectedChainId}
                                                        rootAddress={addressId}
                                                        rootTxCount={txNumber}   // ✅ ADD THIS
                                                        startDate={new Date(startTime * 1000)}
                                                        endDate={new Date(endTime * 1000)}
                                                        direction={selectedDirection}
                                                        initialNeighbours={addressData.map(n => ({
                                                            address: n.address,
                                                            tx_count: n.txns_no,
                                                        }))}
                                                    /> */}

                                                    <AddressNeighboursGraphCanvas
                                                        chainId={selectedChainId}
                                                        rootAddress={addressId}
                                                        rootTxCount={txNumber}   // ✅ ADD THIS
                                                        startDate={new Date(startTime * 1000)}
                                                        endDate={new Date(endTime * 1000)}
                                                        direction={selectedDirection}
                                                        initialNeighbours={addressData.map(n => ({
                                                        address: n.address,
                                                        tx_count: n.txns_no,
                                                    }))}
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