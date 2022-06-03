# Bank-With-Custom-Token-Dapp

Bank dapp with custom token with bank and token contracts

## ❯ Installation

## Smart contracts

```bash
cd smart-contracts
```

### ❯ npm install smart contracts

```bash
npm install
```

### ❯ contracts compile and test

```bash
npx hardhat compile
```

```bash
npx hardhat test
```

### ❯ deploy contracts

copy env and set your rinkeby private key and url

```bash
cp .env.example .env
```

```bash
npx hardhat run scripts/deploy.js --network rinkeby
```

## DAPP

```bash
cd dapp
```

### ❯ npm install dapp

```bash
npm install
```

### ❯ env

copy env and set your deployed contracts addresses

```bash
cp .env.example .env
```

### ❯ start

```bash
npm run start
```

## Dapp Bank usage

when app boots transfer some amount of ZCN token to bank address so bank have token on its disposal for borrowing