import {
  renderHook,
  // act
} from '@testing-library/react-hooks';

import { useAccount } from '.';

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

  expect(result.current[0]).toEqual('');
  expect(result.current[1]).toEqual(false);
});

test('handles rerendering with NO change in randomBytes input', () => {
  const { result, rerender } = renderHook(() =>
    useAccount({
      randomBytes: new Uint8Array(),
      randomBytesGenerated: false,
    })
  );

  rerender();

  expect(result.current[0]).toEqual('');
  expect(result.current[1]).toEqual(false);
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

  randomBytes = new Uint8Array(INPUT_ENTROPY_ARRAY);
  randomBytesGenerated = true;

  // TODO: Figure out how to get to rerender the component with a new input
  // for the useAccount hook
  rerender();

  expect(result.current[0]).toEqual(
    '0x80F8f3629b58b0b2873c6424cDe17540F645df16'
  );
  expect(result.current[1]).toEqual(true);
});

test('does something with randomBytes', () => {
  const { result } = renderHook(() =>
    useAccount({
      randomBytes: new Uint8Array(INPUT_ENTROPY_ARRAY),
      randomBytesGenerated: true,
    })
  );

  expect(result.current[0]).toEqual(
    '0x80F8f3629b58b0b2873c6424cDe17540F645df16'
  );
  expect(result.current[1]).toEqual(true);
});
