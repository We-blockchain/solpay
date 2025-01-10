import { PublicKey, type ParsedTransactionWithMeta } from "@solana/web3.js";
import { Coin } from "./coin";
import type { CoinType } from "./type";

export function parseTxBalanceChange(tx: ParsedTransactionWithMeta, owner: PublicKey, coin_type: CoinType): number {
    switch (coin_type) {
        case "SOL": {
            let preBalances = tx.meta?.preBalances;
            let postBalances = tx.meta?.postBalances;

            let index = tx.transaction.message.accountKeys.findIndex(it => it.pubkey.equals(owner));
            if (index === -1) return 0;

            let change = (postBalances?.[index] || 0) - (preBalances?.[index] || 0)
            return change / Math.pow(10, Coin[coin_type].decimals);
        }
        default: {
            let preTokenBalances = tx.meta?.preTokenBalances;
            let postTokenBalances = tx.meta?.postTokenBalances;

            let [pre, post] = [preTokenBalances, postTokenBalances].map(it =>
                    it?.find(it => it.owner == owner.toBase58())
                        ?.uiTokenAmount.uiAmountString
                );

            let change = Number(post || 0) - Number(pre || 0);
            return change;
        }
    }
}
