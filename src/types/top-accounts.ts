export interface Account {
    address: string
    balance: string
    percentage: string
    successfully_sent_transaction_count: string
    network_name: string
}

export interface AccountsResponse {
    data?: {
        accounts: Account[]
        total_count: number
    }
    errors?: string[]
}