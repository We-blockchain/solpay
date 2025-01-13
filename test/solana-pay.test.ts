import { expect, test } from 'bun:test';
import { createOrder, getSolanaPayURL, orderPaid } from '../src';
import { setCluster } from '../src/connection';

setCluster('devnet');

test('Solana Pay Spec', async () => {
    var order = await createOrder({
        pay_to: "BSzG62Khqw5pbbWPmoe8iZekExekFQBJmjYhiXhcVvtS",
        coin_type: "SOL",
        coin_amount: 1.23,
        timeout: 1_000,
    });
    expect(getSolanaPayURL(order)).resolves.not.toStartWith("solana:BSzG62Khqw5pbbWPmoe8iZekExekFQBJmjYhiXhcVvtS?amount=1230000000&memo=");
    expect(getSolanaPayURL(order)).resolves.toStartWith("solana:BSzG62Khqw5pbbWPmoe8iZekExekFQBJmjYhiXhcVvtS?amount=1.23&memo=");
    expect(orderPaid(order)).resolves.toBeUndefined(); // Timeout

    var order = await createOrder({
        pay_to: "BSzG62Khqw5pbbWPmoe8iZekExekFQBJmjYhiXhcVvtS",
        coin_type: "USDC-Dev",
        coin_amount: 0.1,
        timeout: 1_000,
        commitment: 'confirmed',
    });
    expect(getSolanaPayURL(order)).resolves.not.toStartWith("solana:BSzG62Khqw5pbbWPmoe8iZekExekFQBJmjYhiXhcVvtS?amount=100000&spl-token=Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr&memo=");
    expect(getSolanaPayURL(order)).resolves.toStartWith("solana:BSzG62Khqw5pbbWPmoe8iZekExekFQBJmjYhiXhcVvtS?amount=0.1&spl-token=Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr&memo=");
    expect(orderPaid(order)).resolves.toBeUndefined(); // Timeout
});