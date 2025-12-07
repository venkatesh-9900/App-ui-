export interface AAWDetails {
    watcher_id: number;
    watcher_name: string;
    totalEvent: number;
    start_time: string;
    end_time: string;
    data: EventDetails[];
}

export interface EventDetails {
    fromAddress: string;
    toAddress: string;
    blockNum: string;
    hash: string;
    value: number;
    asset: string;
    category: string;
    rawContract: {
        rawValue: string;
        decimals: number;
    };
    blockTimestamp: string;
}

export const mockApiResponse: AAWDetails = { // Mock data for testing purposes TODO: Remove when backend is ready
    watcher_id: 22,
    watcher_name: 'High Value Transfers Watcher',
    totalEvent: 841,
    start_time: '2024-06-10T00:00:00Z',
    end_time: '2024-07-10T01:00:00Z',
    data: [
        // ETH Events (14 events, 2.31 ETH total)
        { "fromAddress": "0x4f3a...a32b", "toAddress": "0x917f...12c8", "blockNum": "0x16d4e7a", "hash": "0x6d98...f10e", "value": 0.1, "asset": "ETH", "category": "external", "rawContract": { "rawValue": "0x0", "decimals": 18 }, "blockTimestamp": "0x6931b047" },
        { "fromAddress": "0xbcab...12c9", "toAddress": "0x4f3a...a32b", "blockNum": "0x16d4e7b", "hash": "0x6d98...f10f", "value": 0.5, "asset": "ETH", "category": "internal", "rawContract": { "rawValue": "0x0", "decimals": 18 }, "blockTimestamp": "0x6931b048" },
        { "fromAddress": "0xbe57...42a3", "toAddress": "0x1111...1111", "blockNum": "0x16d4e7c", "hash": "0x6d98...f110", "value": 1.71, "asset": "ETH", "category": "external", "rawContract": { "rawValue": "0x0", "decimals": 18 }, "blockTimestamp": "0x6931b049" },
        { "fromAddress": "0x4f3a...a322", "toAddress": "0x917f...12c8", "blockNum": "0x16d4e7a", "hash": "0x6d98...f10e", "value": 0.1, "asset": "ETH", "category": "external", "rawContract": { "rawValue": "0x0", "decimals": 18 }, "blockTimestamp": "0x6931b047" },
        { "fromAddress": "0xbcab...12c12", "toAddress": "0x4f3a...a32b", "blockNum": "0x16d4e7b", "hash": "0x6d98...f10f", "value": 0.5, "asset": "ETH", "category": "internal", "rawContract": { "rawValue": "0x0", "decimals": 18 }, "blockTimestamp": "0x6931b048" },
        { "fromAddress": "0xbe57...42a2", "toAddress": "0x1111...1111", "blockNum": "0x16d4e7c", "hash": "0x6d98...f110", "value": 1.71, "asset": "ETH", "category": "external", "rawContract": { "rawValue": "0x0", "decimals": 18 }, "blockTimestamp": "0x6931b049" },
        { "fromAddress": "0x4f3a...a32b", "toAddress": "0x917f...12c8", "blockNum": "0x16d4e7a", "hash": "0x6d98...f10e", "value": 0.1, "asset": "ETH", "category": "external", "rawContract": { "rawValue": "0x0", "decimals": 18 }, "blockTimestamp": "0x6931b047" },
        { "fromAddress": "0xbcab...12c9", "toAddress": "0x4f3a...a32b", "blockNum": "0x16d4e7b", "hash": "0x6d98...f10f", "value": 0.5, "asset": "ETH", "category": "internal", "rawContract": { "rawValue": "0x0", "decimals": 18 }, "blockTimestamp": "0x6931b048" },
        { "fromAddress": "0xbe57...42a0", "toAddress": "0x1111...1111", "blockNum": "0x16d4e7c", "hash": "0x6d98...f110", "value": 1.71, "asset": "ETH", "category": "external", "rawContract": { "rawValue": "0x0", "decimals": 18 }, "blockTimestamp": "0x6931b049" },
        { "fromAddress": "0x4f3a...a32b", "toAddress": "0x917f...12c8", "blockNum": "0x16d4e7a", "hash": "0x6d98...f10e", "value": 0.1, "asset": "ETH", "category": "external", "rawContract": { "rawValue": "0x0", "decimals": 18 }, "blockTimestamp": "0x6931b047" },
        { "fromAddress": "0xbcab...12c9", "toAddress": "0x4f3a...a32b", "blockNum": "0x16d4e7b", "hash": "0x6d98...f10f", "value": 0.5, "asset": "ETH", "category": "internal", "rawContract": { "rawValue": "0x0", "decimals": 18 }, "blockTimestamp": "0x6931b048" },
        { "fromAddress": "0xbe57...42a0", "toAddress": "0x1111...1111", "blockNum": "0x16d4e7c", "hash": "0x6d98...f110", "value": 1.71, "asset": "ETH", "category": "external", "rawContract": { "rawValue": "0x0", "decimals": 18 }, "blockTimestamp": "0x6931b049" },
        // USDC Events (3 events, $52,381.96 total)
        { "fromAddress": "0xbfed...286f", "toAddress": "0x0000...0001", "blockNum": "0x16d4e8a", "hash": "0x9999...a111", "value": 10000, "asset": "USDC", "category": "token", "rawContract": { "rawValue": "0x0", "decimals": 6 }, "blockTimestamp": "0x6931b050" },
        { "fromAddress": "0xa33c...e214", "toAddress": "0xbfed...286f", "blockNum": "0x16d4e8b", "hash": "0x9999...a112", "value": 22381.96, "asset": "USDC", "category": "token", "rawContract": { "rawValue": "0x0", "decimals": 6 }, "blockTimestamp": "0x6931b051" },
        { "fromAddress": "0xbfed...286f", "toAddress": "0xa33c...e214", "blockNum": "0x16d4e8c", "hash": "0x9999...a113", "value": 20000, "asset": "USDC", "category": "token", "rawContract": { "rawValue": "0x0", "decimals": 6 }, "blockTimestamp": "0x6931b052" },
        // ERC-20 Tokens (2 events, 13,579 events total is abstract, value is token specific)
        { "fromAddress": "0xbe57...420", "toAddress": "0x5555...5555", "blockNum": "0x16d4e9a", "hash": "0xaaaa...b222", "value": 500, "asset": "ERC-20 Tokens", "category": "token", "rawContract": { "rawValue": "0x0", "decimals": 18 }, "blockTimestamp": "0x6931b053" },
        { "fromAddress": "0x91f1...1d1e", "toAddress": "0xbe57...420", "blockNum": "0x16d4e9b", "hash": "0xaaaa...b223", "value": 13079, "asset": "ERC-20 Tokens", "category": "token", "rawContract": { "rawValue": "0x0", "decimals": 18 }, "blockTimestamp": "0x6931b054" },
        // test data to reach totalEvent count
        { "fromAddress": "0xbe57...420", "toAddress": "0x5555...5555", "blockNum": "0x16d4e9a", "hash": "0xaaaa...b222", "value": 500, "asset": "Test", "category": "token", "rawContract": { "rawValue": "0x0", "decimals": 18 }, "blockTimestamp": "0x6931b053" },
        { "fromAddress": "0x91f1...1d1e", "toAddress": "0xbe57...420", "blockNum": "0x16d4e9b", "hash": "0xaaaa...b223", "value": 13079, "asset": "Test", "category": "token", "rawContract": { "rawValue": "0x0", "decimals": 18 }, "blockTimestamp": "0x6931b054" },
    ],
};