import { encodeURL, type TransferRequestURLFields } from "@solana/pay";
import type { Order } from "./type";
import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { Coin } from "./coin";

/**
 * Encode a Solana Pay URL.
 */
export async function getSolanaPayURL(order: Order) {
    let config = order.info;

    let fields: TransferRequestURLFields = {
        recipient: new PublicKey(config.pay_to),
        splToken: Coin[config.coin_type].mintAddress,
        // amount: new BigNumber(config.coin_amount * Math.pow(10, Coin[config.coin_type].decimals)),
        // 该值必须是非负整数或 "用户" 单位的小数。对于 SOL，应使用 SOL 而不是 lamports。对于代币，使用 uiAmountString 而不是 amount
        amount: new BigNumber(config.coin_amount),
        memo: order.id,
    };

    let url = encodeURL(fields);
    return url.toString();
}