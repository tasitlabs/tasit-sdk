interface Api {
  apiKey: string;
}

export interface JsonRpc {
  url: string;
  port: number;
  user: string;
  password: string;
  allowInsecure: boolean;
}

export interface Config {
  pollingInterval: any;
  provider?: string;
  network: string;
  etherscan?: Api;
  infura?: Api;
  jsonRpc?: JsonRpc;
}

export interface Infura {
  apiKey: string;
}

export interface Etherscan {
  apiKey: string;
}