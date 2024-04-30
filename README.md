# ctsi-staking-pool-balance

CLI to compute the balance in CTSI that a user has in a given staking pool contract

## Running

```
yarn
yarn start <options>
```

Type `yarn start --help` for detailed instructions.

## Example

(from a random pool and random account found in https://explorer.cartesi.io)

```
yarn start --pool 0x48381609a2f1bfe30b465e106bf8324342abe107 --account 0x1f34a60d08fcf60756633fcff1e23786305f5731 --rpc-url https://eth-mainnet.public.blastapi.io --date 2024-04-01
```

```
Looking for block at target date 2024-04-01T00:00:00.000Z...
Using block 19557288 at date 2024-03-31T23:59:59.000Z
Shares: 17375540595275759792839604626733
CTSI: 25538.746711349628461603
```
