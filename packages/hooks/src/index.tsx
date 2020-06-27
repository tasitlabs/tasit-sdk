import { useEffect, useState } from 'react';
import Account from '@tasit/account';

export function useAccount(options: AccountOptions): (string | boolean)[] {
  const [address, setAddress] = useState('');
  const [addressDefined, setAddressDefined] = useState(false);
  const { asyncStorage = true, randomBytes, randomBytesGenerated } = options;

  useEffect(() => {
    function makeAccount() {
      const account = Account.createUsingRandomness(randomBytes);
      const {
        address: accountAddress,
        // privateKey
      } = account;
      // console.log({ accountAddress });
      // console.log({ privateKey });

      setAddress(accountAddress);
      setAddressDefined(true);

      if (asyncStorage) {
        // Put in Async Storage
      }
    }
    if (randomBytesGenerated) {
      makeAccount();
    }
  }, []);

  return [address, addressDefined];
}

export interface AccountOptions {
  /** If it should use Async Storage for the public key, defaults to `true` */
  asyncStorage?: boolean;
  randomBytes: Uint8Array;
  randomBytesGenerated: boolean;
}
