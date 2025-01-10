import { expect, test } from 'bun:test';
import { createOrder, orderPaid } from '../src';
import { setCluster } from '../src/connection';

setCluster('devnet');

test('orderPaid', async () => {
    var order = await createOrder({
        pay_to: "BSzG62Khqw5pbbWPmoe8iZekExekFQBJmjYhiXhcVvtS",
        coin_type: "TEST", 
        coin_amount: 0.00001,
        timeout: 1_000,
    });
    expect(orderPaid(order)).resolves.toBeFalse(); // Timeout

    var order = await createOrder({
        pay_to: "BSzG62Khqw5pbbWPmoe8iZekExekFQBJmjYhiXhcVvtS",
        coin_type: "TEST", 
        coin_amount: 0.00000,
        timeout: 60_000,
        commitment: 'confirmed',
    });
    console.log(order); // Manual payment
    expect(orderPaid(order)).resolves.toBeTrue();
});