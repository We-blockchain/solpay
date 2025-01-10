type Finality = 'confirmed' | 'finalized';

type Commitment = 'processed' | 'confirmed' | 'finalized' | 'recent' | 'single' | 'singleGossip' | 'root' | 'max';

type CoinType = "SOL" | "USDT" | "USDC" | "TEST";

interface OrderConfig {
    /** Solana account address, or Token account's owner */
    pay_to: string,
    coin_type: CoinType,
    coin_amount: number,
    timeout: number,
    commitment?: Finality,
}

interface Order {
    id: string,
    info: OrderConfig,
}