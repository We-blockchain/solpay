import { expect, test } from 'bun:test';
import { createOrder } from '../src';
import { setCluster } from '../src/connection';

setCluster('devnet');

test('createOrder', async () => {
    var order = createOrder({
        pay_to: "",
        coin_type: "SOL",
        coin_amount: 0.00001,
        timeout: 30_000,
    });
    expect(order).rejects.not.toBeNull();

    var order = createOrder({
        pay_to: "BSzG62Khqw5pbbWPmoe8iZekExekFQBJmjYhiXhcVvtS",
        coin_type: "SOL",
        coin_amount: 0.00001,
        timeout: 30_000,
    });
    expect(order).resolves.not.toBeNull();

    var order = createOrder({
        pay_to: "BSzG62Khqw5pbbWPmoe8iZekExekFQBJmjYhiXhcVvtS",
        coin_type: "TEST-Dev",
        coin_amount: 0.00001,
        timeout: 30_000,
    });
    expect(order).resolves.not.toBeNull();
});