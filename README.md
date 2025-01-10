# solpay

Solana Payment API.

## install

```
npm install --save solpay
```

## usage

```
const order = await createOrder({
    pay_to: "BSzG62Khqw5pbbWPmoe8iZekExekFQBJmjYhiXhcVvtS", // Owner address
    coin_type: "SOL", // Optional: "USDT", "USDC"
    coin_amount: 0.1, // 0.1 SOL
    timeout: 60_000, // 60s
});

const isPaid = await orderPaid(order); // Await payment
```

## payment

Use memo to mark a order, for example:
```
$ order_id=01944f23-df45-75bb-a411-d05dd819c92a
$ owner=BSzG62Khqw5pbbWPmoe8iZekExekFQBJmjYhiXhcVvtS
$ solana transfer ${owner} 0.1 --with-memo ${order_id}
```
SPL Token:
```
$ mint=Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr
$ spl-token transfer ${mint} 0.1 ${owner} --with-memo ${order_id}
```

## dev

To install dependencies:

```bash
bun install
```

To run test:

```bash
bun test --timeout 300000
bun test --watch --timeout 300000
bun test --watch ./test/*.test.ts --timeout 300000
```
