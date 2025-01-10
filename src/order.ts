import { getATA, getCoinBalance } from './coin';
import { PublicKey, type AccountInfo, type Context } from "@solana/web3.js";
import { getConnection } from "./connection";
import { v7 as uuid } from "uuid";
import { parseTxBalanceChange } from './tx';
import type { Order, OrderConfig } from './type';

let orders: Map<string, Promise<number>> = new Map();

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
        resolve: (value: number | PromiseLike<number>) => void,
        reject: (reason?: any) => void,
        timeout: NodeJS.Timer;
    orders.set(id, new Promise((...args) => [resolve, reject] = args));

    let account = config.coin_type == "SOL" ? payTo : await getATA(payTo, config.coin_type);
    let balance = await getCoinBalance(payTo, config.coin_type, config.commitment);
    let lastTx = (await getConnection().getSignaturesForAddress(account, { limit: 1 }))
        [0] ?.signature;

    let subscription = getConnection().onAccountChange(account, async (accountInfo: AccountInfo<Buffer>, context: Context) => {
        if (accountInfo) {
            let balanceUpdated = await getCoinBalance(payTo, config.coin_type, config.commitment);
            let balanceChange = balanceUpdated - balance;
            balance = balanceUpdated;
            if (balanceChange < config.coin_amount) return;

            let txs = await getConnection().getSignaturesForAddress(account, { until: lastTx }, config.commitment);
            lastTx = txs[0] ?.signature || lastTx;

            let tx = txs.find(tx => tx.memo ?.match(/^\[\d+\] (.*)/) ?.[1] == id); // Memo match
            if (tx) {
                let parsedTx = await getConnection().getParsedTransaction(tx.signature, config.commitment);
                if (parsedTx) {
                    let change = await parseTxBalanceChange(parsedTx, payTo, config.coin_type);
                    if (change < config.coin_amount) return;
                    resolve(change);
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
    const isPaid = await orderPaid(order);
 * ```
 * @see {@link createOrder()}
 */
export async function orderPaid(order: Order): Promise<boolean> {
    try {
        let paid = await orders.get(order.id);
        return paid === undefined ? false : paid >= 0;
    } catch (err) {
        // Timeout, unpaid
        return false;
    } finally {
        orders.delete(order.id);
    }
}