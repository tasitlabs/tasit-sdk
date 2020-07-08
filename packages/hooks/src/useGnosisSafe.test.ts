import {
  renderHook,
  // act
} from '@testing-library/react-hooks';

import { useGnosisSafe } from './useGnosisSafe';

const INPUT_ENTROPY_ARRAY = [
  21,
  31,
  12,
  14,
  16,
  30,
  22,
  20,
  21,
  31,
  12,
  14,
  16,
  30,
  22,
  20,
];

// NOTE: There's a gotcha with updates.
// renderHook mutates the value of current when updates happen so you cannot
// destructure its values as the assignment will make a copy locking into the
// value at that time.
// But in this case we're not waiting for any updates, just the first
// value, so that locking is fine

test('does nothing without randomBytes', async () => {
  const { result } = renderHook(() =>
    // TODO: Mock the Gnosis API in a test env
    useGnosisSafe(['0xabc123def'], 1, new Uint8Array(INPUT_ENTROPY_ARRAY))
  );

  const { address, hasError } = await result.current;
  expect(address).toEqual('');
  expect(hasError).toEqual(false);
});
