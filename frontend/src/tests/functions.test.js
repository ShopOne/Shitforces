import {
  decodeEnglishIndex,
  createEnglishIndex,
} from '../functions/createEnglishIndex';
import { formatSecondToMMSS } from '../functions/formatSecondToMMSS';

it('createEnglishIndex', () => {
  expect(createEnglishIndex(0)).toEqual('A');
  expect(createEnglishIndex(25)).toEqual('Z');
  expect(createEnglishIndex(26)).toEqual('AA');
  expect(createEnglishIndex(28)).toEqual('AC');
  expect(createEnglishIndex(52)).toEqual('BA');
  expect(createEnglishIndex(702)).toEqual('AAA');
  expect(createEnglishIndex(705)).toEqual('AAD');
  expect(createEnglishIndex(728)).toEqual('ABA');
});

it('createEnglishIndex', () => {
  expect(decodeEnglishIndex('A')).toEqual(0);
  expect(decodeEnglishIndex('Z')).toEqual(25);
  expect(decodeEnglishIndex('AA')).toEqual(26);
  expect(decodeEnglishIndex('AC')).toEqual(28);
  expect(decodeEnglishIndex('BA')).toEqual(52);
  expect(decodeEnglishIndex('AAA')).toEqual(702);
  expect(decodeEnglishIndex('AAD')).toEqual(705);
  expect(decodeEnglishIndex('ABA')).toEqual(728);
});

it('formatSecondToMMSS', () => {
  expect(formatSecondToMMSS(0)).toEqual('0:00');
  expect(formatSecondToMMSS(1)).toEqual('0:01');
  expect(formatSecondToMMSS(10)).toEqual('0:10');
  expect(formatSecondToMMSS(60)).toEqual('1:00');
  expect(formatSecondToMMSS(3599)).toEqual('59:59');
});
