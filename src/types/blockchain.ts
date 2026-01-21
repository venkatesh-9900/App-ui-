// export interface SearchAddressResponse {
//   nodes: string[]
//   edges: GraphEdgeTxnData[]
// }

// export interface GraphEdgeTxnData {
//   from: string
//   to: string
//   txHash: string
//   token: boolean
//   tokenContract: string | null
//   tokenSymbol: string | null
//   value: string
//   blockNumber: number
//   timeStamp: number
//   depth: number
// }

export type NeighboursColumn = {
    address: string;
    txns_no: number;
    depth: number;
}

export interface NeighbourResponse {
  address: string
  tx_count: number
}

export interface NeighbourData {
  tx_count: number
  neighbours: NeighbourResponse[]
}

export interface SearchAddressResponse {
  data: NeighbourData
  errors: string[]
}

export interface NeighboursColumnData {
  tx_count: number
  neighbours: NeighboursColumn[]
}