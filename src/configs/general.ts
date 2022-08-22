export const CALL_PENDING_EXPIRE_IN_MS = 60_000
export const CALL_PENDING_EXPIRE_IN_S = CALL_PENDING_EXPIRE_IN_MS / 1000
export const INCOMING_CALL_DURATION_MS = CALL_PENDING_EXPIRE_IN_MS - 5_000
export const PLACEHOLDER_ADDRESS = "empty"
export const END_CALL_BUFFER_SECONDS = "60"
export const END_CALL_BUFFER_SECONDS_EXTRA = "90" // must be more than END_CALL_BUFFER_SECONDS
export const PRICE_MAX_CHARACTER: number = 7
export const MAX_DECIMAL_CHARACTERS = 18
export const GLOBAL_MAX_CHARACTER_NUMBER = MAX_DECIMAL_CHARACTERS + 2
export const BYTES = "bytes"
export const ZERO_BYTES = "0x"

export const GAS_LIMIT_MULTIPLIER_NUMERATOR = 80
export const GAS_LIMIT_MULTIPLIER_DENOMINATOR = 100

export const CALL_HISTORY_LIMIT = 10

// const isMobile = useResponsive('down', 'sm');
// const isPartial = useResponsive('between', '', 'sm', 'lg');
// const isWide = useResponsive('up', 'lg');