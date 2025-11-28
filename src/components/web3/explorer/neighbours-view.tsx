"use client"

import { Heading } from "@/components/ui/heading";
import { NeighboursTable } from "@/components/web3-monitoring/neighbours-table";
import { ColumnDef } from "@tanstack/react-table";
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
    chain_id: number;
    start_date: Date;
    end_date: Date;
    direction: number;
    current_address: string;
    depth: number;
    data: NeighboursColumn[];
    tx_count: number;
}

export const NeighboursView: React.FC<NeighboursViewProps> = ({ chain_id, start_date, end_date, direction, current_address, depth, data, tx_count }) => {
    return (
        <>
            <div className="flex items-center justify-between">
                <Heading title={depth == 1 ? `Neighbours`: `Neighbours of ${current_address}`} description={`Level: ${depth}`} smallTitle={!(depth == 1)} />
            </div>
            {tx_count > 0 && <p className="text-xs text-muted-foreground mb-1">
                {`(As per latest ${tx_count} transactions in the selected time frame)`}
            </p>}
            {/* <Separator /> */}
            <NeighboursTable
                chainId={chain_id}
                currentAddress={current_address}
                startDate={start_date}
                endDate={end_date}
                direction={direction}
                depth={depth}
                columns={columns}
                data={data}
                getRowCanExpand={() => depth < 5}
            />
            {/* <Separator /> */}
        </>
    );
};
