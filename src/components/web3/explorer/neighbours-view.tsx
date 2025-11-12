"use client"

import { Heading } from "@/components/ui/heading";
import { NeighboursTable } from "@/components/web3-monitoring/neighbours-table";
import { Separator } from "@/components/ui/separator";
import { ColumnDef } from "@tanstack/react-table";
import { z } from "zod"
import { NeighboursColumn } from "@/types/blockchain";

// export const schema = z.object({
//   address: z.string(),
//   txns_no: z.number(),
// });

const columns: ColumnDef<NeighboursColumn>[] = [
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => {
      const address = row.original.address
      if (!address) return <div className="text-muted-foreground">-</div>
      return (
        <div className="font-mono text-sm">
          {address}
        </div>
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: "txns_no",
    header: "No. of Transactions",
    cell: ({ row }) => (
      <div className="text-left">
        {row.original.txns_no || "-"}
      </div>
    ),
  }
]

interface NeighboursViewProps {
    current_address: string;
    depth: number;
    data: NeighboursColumn[];
}

export const NeighboursView: React.FC<NeighboursViewProps> = ({ current_address, depth, data }) => {
    return (
        <>
            <div className="flex items-center justify-between">
                <Heading title={depth == 0 ? `Neighbours`: `Neighbours of ${current_address}`} description={`Level: ${depth + 1}`} smallTitle={!(depth == 0)} />
            </div>
            {/* <Separator /> */}
            <NeighboursTable
                columns={columns}
                data={data}
                getRowCanExpand={() => true}
            />
            {/* <Separator /> */}
        </>
    );
};
