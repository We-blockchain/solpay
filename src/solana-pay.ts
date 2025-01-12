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
        amount: new BigNumber(config.coin_amount * Math.pow(10, Coin[config.coin_type].decimals)),
        memo: order.id,
    };

    let url = encodeURL(fields);
    return url.toString();
}