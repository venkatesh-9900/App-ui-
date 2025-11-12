export interface SearchAddressResponse {
  nodes: string[]
  edges: GraphEdgeTxnData[]
}

export interface GraphEdgeTxnData {
  from: string
  to: string
  txHash: string
  token: boolean
  tokenContract: string | null
  tokenSymbol: string | null
  value: string
  blockNumber: number
  timeStamp: number
  depth: number
}

export type NeighboursColumn = {
    address: string;
    txns_no: number;
    depth: number;
    neighbours: NeighboursColumn[] | null;
}