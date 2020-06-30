import { useEffect, useState } from 'react';
import Account from '@tasit/account';

export default function useAccount(options: AccountOptions): string {
  const [address, setAddress] = useState('');
  // TODO: Investigate whether useState internally in the hook is
  // useful here
  // const [addressDefined, setAddressDefined] = useState(false);
  const { asyncStorage = true, randomBytes, randomBytesGenerated } = options;

  useEffect(() => {
    // console.log('useEffect in useAccount running');
    function makeAccount(): void {
      // console.log('makeAccount running');
      const account = Account.createUsingRandomness(randomBytes);
      const {
        address: accountAddress,
        // privateKey
      } = account;
      // console.log({ accountAddress });
      // console.log({ privateKey });

      setAddress(accountAddress);
      // setAddressDefined(true);

      if (asyncStorage) {
        // Put in Async Storage
      }
    }
    if (randomBytesGenerated) {
      makeAccount();
    }
  }, [asyncStorage, randomBytes, randomBytesGenerated]);

  return address;
}

export interface AccountOptions {
  /** If it should use Async Storage for the public key, defaults to `true` */
  asyncStorage?: boolean;
  randomBytes: Uint8Array;
  randomBytesGenerated: boolean;
}
