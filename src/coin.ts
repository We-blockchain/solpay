import { LAMPORTS_PER_SOL, PublicKey, type Finality } from "@solana/web3.js";
import { getConnection } from "./connection";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import type { CoinType } from "./type";

interface MintAccount {
    mintAddress?: PublicKey,
    decimals: number,
}

export var Coin: Record<CoinType, MintAccount> = {
    SOL: { mintAddress: undefined, decimals: 9 },
    /** https://explorer.solana.com/address/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB */
    USDT: { mintAddress: new PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"), decimals: 6 },
    /** https://explorer.solana.com/address/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v */
    USDC: { mintAddress: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"), decimals: 6 },
    /** https://explorer.solana.com/address/Eg7H518ZvU4UhtwE8usYhNfRW5vJEgAQ1SX8323qpfjM?cluster=devnet */
    ["TEST-Dev"]: { mintAddress: new PublicKey("Eg7H518ZvU4UhtwE8usYhNfRW5vJEgAQ1SX8323qpfjM"), decimals: 9 },
    /**
     * Faucet: https://spl-token-faucet.com/?token-name=USDC
     * https://explorer.solana.com/address/Eg7H518ZvU4UhtwE8usYhNfRW5vJEgAQ1SX8323qpfjM?cluster=devnet
     */
    ["USDC-Dev"]: { mintAddress: new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"), decimals: 6 },
}

export async function getATA(owner: PublicKey, coin_type: CoinType): Promise<PublicKey> {
    let ata = await getAssociatedTokenAddress(Coin[coin_type].mintAddress!!, owner, true);
    return ata;
}

export async function getCoinBalance(owner: PublicKey, coin_type: CoinType, commitment?: Finality): Promise<number> {
    let balance: number;
    if (coin_type == 'SOL') {
        balance = await getConnection().getBalance(owner, commitment) / LAMPORTS_PER_SOL;
    } else {
        let ata = await getATA(owner, coin_type);
        // balance = Number((await getAccount(getConnection(), ata, commitment)).amount) / Math.pow(10, Coin[coin_type].decimals);
        let tokenAmount = await getConnection().getTokenAccountBalance(ata, commitment);
        balance = Number(tokenAmount.value.uiAmountString);
    }
    console.log(owner.toBase58(), balance, coin_type);
    return balance;
}
