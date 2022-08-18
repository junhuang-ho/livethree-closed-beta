import ERC20 from "@superfluid-finance/ethereum-contracts/build/contracts/ERC20.json"
import ISuperToken from "@superfluid-finance/ethereum-contracts/build/contracts/ISuperToken.json"
import ISuperfluid from "@superfluid-finance/ethereum-contracts/build/contracts/ISuperfluid.json"
import IConstantFlowAgreementV1 from "@superfluid-finance/ethereum-contracts/build/contracts/IConstantFlowAgreementV1.json"

/**
 * ref:
 * https://console.superfluid.finance/protocol
 * https://docs.superfluid.finance/superfluid/developers/networks
 */
export const POLYGON_ADDRESS_SF_HOST = "0x3E14dC1b13c488a8d5D310918780c983bD5982E7"
export const POLYGON_ADDRESS_CFAV1 = "0x6EeE6060f715257b970700bc2656De21dEdF074C"
export const POLYGON_ADDRESS_DAIx = "0x1305F6B6Df9Dc47159D12Eb7aC2804d4A33173c2"
export const POLYGON_ADDRESS_USDC = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"
export const POLYGON_ADDRESS_USDCx = "0xCAa7349CEA390F89641fe306D93591f87595dc1F"

export const MUMBAI_ADDRESS_SF_HOST = "0xEB796bdb90fFA0f28255275e16936D25d3418603"
export const MUMBAI_ADDRESS_CFAV1 = "0x49e565Ed1bdc17F3d220f72DF0857C26FA83F873"
export const MUMBAI_ADDRESS_fUSDCx = "0x42bb40bF79730451B11f6De1CbA222F17b87Afd7"
export const MUMBAI_ADDRESS_fUSDC = "0xbe49ac1EadAc65dccf204D4Df81d650B50122aB2"
export const MUMBAI_ADDRESS_fDAIx = "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f"



export const DEFAULT_ADDRESS_SF_HOST = POLYGON_ADDRESS_SF_HOST
export const DEFAULT_ADDRESS_CFAV1 = POLYGON_ADDRESS_CFAV1
export const DEFAULT_ADDRESS_USDC = POLYGON_ADDRESS_USDC
export const DEFAULT_ADDRESS_USDCx = POLYGON_ADDRESS_USDCx
export const DEFAULT_ADDRESS_DAIx = POLYGON_ADDRESS_DAIx

export const ABI_ERC20 = ERC20.abi
export const ABI_SUPERTOKEN = ISuperToken.abi
export const ABI_SF_HOST = ISuperfluid.abi
export const ABI_CFAV1 = IConstantFlowAgreementV1.abi

export const MATIC_SYMBOL = "MATIC"

export const OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT = 1 + 200

export const DELETE_PERMISSION = 4

// export const FLOW_OPERATOR_ADDRESS = "0x614539062F7205049917e03ec4C86FF808F083cb"

// export const MUMBAI_BF_ADDRESS = "0x9399BB24DBB5C4b782C70c2969F58716Ebbd6a3b"
// export const MUMBAI_BF_ABI = partialBiconomyForwarderABI.abi

// export const MUMBAI_CONVERTHASH_ADDRESS = "0xEE34e2A2bF913De0D9aea0A94E95523feB982f3a"
// export const MUMBAI_CONVERTHASH_ABI = convertHashABI.abi