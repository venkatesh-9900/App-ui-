export interface getAawGroupedTransactionInfo {
    status: string;
    watcher_name: string;
    count: number;
    start_time: string;
    end_time: string;
    data: any
}

export interface getAawTransactionDetails {
    status: string;
    data: TransactionDetails[];
}

export interface TransactionDetails { 
    transactionHash: string;
    blockNum: number;
    blockTimestamp: string;
    asset: string;
    category: string;
    fromAddress: string;
    toAddress: string;
    hash: string;
    log: {
        removed: boolean;
        topics: string[];
    };
    rawContract: {
        decimals: number;
        rawValue: number;
    };
    value: number;
    typeTraceAddress: string;
    eventChunkId: string;
    chainId: number;
    createdAt: string;
}