import { expect, test } from 'bun:test';
import { setCluster } from '../src/connection';
import { getCoinBalance } from '../src/coin';
import { PublicKey } from '@solana/web3.js';

setCluster('devnet');

test('getCoinBalance', async () => {
    let owner = new PublicKey("BSzG62Khqw5pbbWPmoe8iZekExekFQBJmjYhiXhcVvtS");
    let sol = await getCoinBalance(owner, "SOL");
    expect(sol > 0).toBeTrue();

    expect(getCoinBalance(owner, "USDT")).rejects.not.toBeNull();
    expect(getCoinBalance(owner, "USDC")).rejects.not.toBeNull();
    expect(getCoinBalance(owner, "TEST-Dev")).resolves.toBeNumber();
});