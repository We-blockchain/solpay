import type { Finality } from "@solana/web3.js";

export type CoinType = "SOL" | "USDT" | "USDC" | "USDC-Dev" | "TEST-Dev";

export interface OrderConfig {
    /** The content associated with the order */
    ref?: any,
    /** Solana account address, or Token account's owner */
    pay_to: string,
    coin_type: CoinType,
    coin_amount: number,
    timeout: number,
    commitment?: Finality,
}

export interface Order {
    id: string,
    info: OrderConfig,
}