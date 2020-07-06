import {
  renderHook,
  // act
} from '@testing-library/react-hooks';

import useAccount from './useAccount';

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

test('does nothing without randomBytes', () => {
  const { result } = renderHook(() =>
    useAccount({
      randomBytes: new Uint8Array(),
      randomBytesGenerated: false,
    })
  );

  expect(result.current).toEqual('');
});

test('does something with randomBytes', () => {
  const { result } = renderHook(() =>
    useAccount({
      randomBytes: new Uint8Array(INPUT_ENTROPY_ARRAY),
      randomBytesGenerated: true,
    })
  );

  expect(result.current).toEqual(
    '0x80F8f3629b58b0b2873c6424cDe17540F645df16'
  );
});

test('handles rerendering with NO change in randomBytes input', () => {
  const { result, rerender } = renderHook(() =>
    useAccount({
      randomBytes: new Uint8Array(),
      randomBytesGenerated: false,
    })
  );

  rerender();

  expect(result.current).toEqual('');
});

test('handles rerendering with a change in randomBytes', () => {
  let randomBytes = new Uint8Array();
  let randomBytesGenerated = false;

  const { result, rerender } = renderHook(() =>
    useAccount({
      randomBytes: randomBytes,
      randomBytesGenerated: randomBytesGenerated,
    })
  );
  // TODO: Ensure there is no race condition here
  // since the useEffect on first render triggers an async operation
  // We could await the state update that happens internally in the hook
  // when that async effect completes

  randomBytes = new Uint8Array(INPUT_ENTROPY_ARRAY);
  randomBytesGenerated = true;
  rerender();

  expect(result.current).toEqual(
    '0x80F8f3629b58b0b2873c6424cDe17540F645df16'
  );
});
