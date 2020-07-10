export interface Wallet {
  connect: (arg0: any) => any;
  _ethersType: string;
}

export interface ContractFunction {
  constant: boolean | undefined;
  stateMutability: string;
  name: string | number;
}