import { getATA, getCoinBalance } from './coin';
import { PublicKey, type AccountInfo, type Context, type ParsedTransactionWithMeta, type SignaturesForAddressOptions } from "@solana/web3.js";
import { getConnection } from "./connection";
import { v7 as uuid } from "uuid";
import { parseTxBalanceChange } from './tx';
import type { Order, OrderConfig } from './type';

const DUST = 0.0000_0000_01;
let orders: Map<string, Promise<ParsedTransactionWithMeta>> = new Map();

/**
 * Example:
 * ```
    const order = await createOrder({
        pay_to: "BSzG62Khqw5pbbWPmoe8iZekExekFQBJmjYhiXhcVvtS",
        coin_type: "SOL", // Optional: "USDT", "USDC"
        coin_amount: 0.00001,
        timeout: 60_000,
    });
 * ```
 * @see {@link orderPaid()}
 */
export async function createOrder(config: OrderConfig): Promise<Order> {
    let id = uuid(),
        payTo = new PublicKey(config.pay_to),
        coinAmount = config.coin_amount,
        resolve: (value: ParsedTransactionWithMeta) => void,
        reject: (reason?: any) => void,
        timeout: NodeJS.Timer;
    orders.set(id, new Promise((...args) => [resolve, reject] = args));

    let account = config.coin_type == "SOL" ? payTo : await getATA(payTo, config.coin_type);
    let balance = await getCoinBalance(payTo, config.coin_type, config.commitment);
    let lastTx = (await getConnection().getSignaturesForAddress(account, { limit: 1 }, config.commitment))
        [0] ?.signature;

    let subscription = getConnection().onAccountChange(account, async (accountInfo: AccountInfo<Buffer>, context: Context) => {
        if (accountInfo) {
            let balanceUpdated = await getCoinBalance(payTo, config.coin_type, config.commitment);
            let balanceChange = balanceUpdated - balance;
            balance = balanceUpdated;
            if (balanceChange + DUST < coinAmount) return;

            let txs = await getConnection().getSignaturesForAddress(account, { until: lastTx }, config.commitment);
            lastTx = txs[0] ?.signature || lastTx;

            let tx = txs.find(tx => tx.memo ?.match(/^\[\d+\] (.*)/) ?.[1] == id); // Memo match
            if (tx) {
                let parsedTx = await getConnection().getParsedTransaction(tx.signature, config.commitment);
                if (parsedTx) {
                    let change = await parseTxBalanceChange(parsedTx, payTo, config.coin_type);
                    if (change + DUST < coinAmount) return;
                    resolve(parsedTx);
                    getConnection().removeAccountChangeListener(subscription);
                    clearTimeout(timeout);
                }
            }
        }
    }, { commitment: config.commitment });

    timeout = setTimeout(() => {
        getConnection().removeAccountChangeListener(subscription);
        reject(new Error("timeout"));
    }, config.timeout);

    return {
        id,
        info: config,
    };
}

/**
 * Example:
 * ```
 * const parsedTransactionWithMeta = await orderPaid(order);
 * 
 * if (parsedTransactionWithMeta) {
 *      const signature = parsedTransactionWithMeta.transaction.signatures[0];
 * }
 * ```
 * @see {@link createOrder()}
 */
export async function orderPaid(order: Order): Promise<ParsedTransactionWithMeta | undefined> {
    try {
        let parsedTransactionWithMeta = await orders.get(order.id);
        return parsedTransactionWithMeta;
    } catch (err) {
        // Timeout, unpaid
        return undefined;
    } finally {
        orders.delete(order.id);
    }
}

/**
 * Validate order via blockchain.
 * 
 * See also: https://github.com/anza-xyz/solana-pay/blob/master/core/src/validateTransfer.ts
 */
export async function confirmOrderPaid(order: Order, _options: SignaturesForAddressOptions = {}): Promise<ParsedTransactionWithMeta | undefined> {
    try {
        let limit = 200;
        let owner = new PublicKey(order.info.pay_to);
        let reference = order.info.coin_type == "SOL" ? owner : await getATA(owner, order.info.coin_type);
        let options: SignaturesForAddressOptions = {
            ..._options,
            limit,
        };
        let finality = order.info.commitment;

        let txs = await getConnection().getSignaturesForAddress(reference, options, finality);
        let tx = txs.find(tx => tx.memo ?.match(/^\[\d+\] (.*)/) ?.[1] == order.id); // Memo match

        // See also: https://github.com/anza-xyz/solana-pay/blob/master/core/src/validateTransfer.ts
        if (tx) {
            let parsedTx = await getConnection().getParsedTransaction(tx.signature, finality) || undefined;
            if (parsedTx) {
                let change = await parseTxBalanceChange(parsedTx!!, owner, order.info.coin_type);
                if (change + DUST >= order.info.coin_amount) return parsedTx;
            }
        }

        if (txs.length >= limit) {
            return confirmOrderPaid(order, { ...options, before: txs[txs.length - 1].signature });
        } else {
            return undefined;
        }
    } catch (err) {
        return undefined;
    }
}