// ============================================
// Contract Details View Types
// ============================================

export interface ContractOverview {
  contract_address: string
  contract_type: string
  compiler: string
}

export interface SourceMetadata {
  language: string
  compiler_version: string
  optimization_enabled: boolean
  optimization_runs: number
  evm_version: string
  license_type?: string | null
}

export interface SourceInformation {
  source_files: string[]
  metadata: SourceMetadata
}

export interface ReadFunction {
  function_name: string
  inputs: Array<{ name?: string; type?: string; value?: string }>
  output_values: Array<string | number | boolean>
}

export interface WriteFunction {
  function_name: string
  inputs: Array<{ name: string; type: string }>
}

export interface ContractData {
  overview: ContractOverview
  source_information: SourceInformation
  read_functions?: ReadFunction[] | null
  write_functions?: WriteFunction[] | null
}

// ============================================
// Response Wrapper
// ============================================

export interface ContractViewResponse {
  view: "contract_details"
  chain: string
  data: ContractData
}

// Type guard
export function isContractView(obj: unknown): obj is ContractViewResponse {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "view" in obj &&
    (obj as { view: string }).view === "contract_details"
  )
}

