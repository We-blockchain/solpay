import { expect, test } from 'bun:test';
import { getConnection, setCluster } from '../src/connection';
import { PublicKey } from '@solana/web3.js';
import { parseTxBalanceChange } from '../src/tx';

setCluster('devnet');

test('parseTxBalanceChange', async () => {
    let signer = new PublicKey("HZgSTq2MyKFp5NFtVzXVKQyA1pm1f1m4tX4XNkoAc8AB");
    let owner = new PublicKey("BSzG62Khqw5pbbWPmoe8iZekExekFQBJmjYhiXhcVvtS");
    let signature = "WnxSDXTrt8v3GCFXv6bAVo2xHhehifmtbwbifLTuHPjQaJ17fVtFkbGCeSgyDX8wWphbag7oAwsJRyxGmSzhTe8";

    let tx = await getConnection().getParsedTransaction(signature);

    expect(parseTxBalanceChange(tx!!, signer, "SOL")).toBe(-0.000005);
    expect(parseTxBalanceChange(tx!!, signer, "TEST-Dev")).toBe(-10);
    expect(parseTxBalanceChange(tx!!, owner, "SOL")).toBe(0);
    expect(parseTxBalanceChange(tx!!, owner, "TEST-Dev")).toBe(10);
});