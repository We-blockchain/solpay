import { expect, test } from "bun:test";
import { getAccount, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { getConnection, setCluster } from "../src";
import { PublicKey } from "@solana/web3.js";

setCluster('devnet');

test('getAssociatedTokenAddressSync', async () => {
    let tokenAccount = getAssociatedTokenAddressSync(
        new PublicKey("Eg7H518ZvU4UhtwE8usYhNfRW5vJEgAQ1SX8323qpfjM"),
        new PublicKey("BSzG62Khqw5pbbWPmoe8iZekExekFQBJmjYhiXhcVvtS"),
        true, // allowOwnerOffCurve: Allow the owner account to be a PDA (Program Derived Address)
    );
    expect(tokenAccount).toEqual(new PublicKey("BLQK4BqoY9dr4Z5Nps6u9TDH1YR8RBngbt79uqt885Ej"));
});

test('getAccount', async () => {
    let tokenAccount = getAssociatedTokenAddressSync(
        new PublicKey("Eg7H518ZvU4UhtwE8usYhNfRW5vJEgAQ1SX8323qpfjM"),
        new PublicKey("BSzG62Khqw5pbbWPmoe8iZekExekFQBJmjYhiXhcVvtS"),
        true, // allowOwnerOffCurve: Allow the owner account to be a PDA (Program Derived Address)
    );

    let account = await getAccount(getConnection(), tokenAccount);
    console.log(account.amount); // e.g. 202230000000n
    console.log(Number(account.amount * 1000000000n)); // e.g. 202230000000000000000
    expect(Number(account.amount)).toBeInteger();
});