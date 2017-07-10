import {normalize} from 'path';
import { URL } from 'whatwg-url';
import { Request, Headers } from 'node-fetch';
import {
  buildCanonicalRequest,
  buildCanonicalQueryString,
  buildCanonicalHeaders,
  buildCanonicalSignedHeaders,
  trim
} from '../src/canonical-request.js';

describe('buildCanonicalQueryString', () => {
  test('params should be sorted', () => {
    // arrange
    const url = new URL('https://example.aws.com/?Param1=value2&Param1=value1');

    // act
    const cQueryString = buildCanonicalQueryString(url.searchParams);

    // assert
    expect(cQueryString).toEqual('Param1=value1&Param1=value2');
  });
});

describe('buildCanonicalHeaders', () => {
  test('header should be sorted', () => {
    // arrange
    const headers = new Headers();
    headers.set('Host', 't1');
    headers.set('X-Amz-Date', 'T2');

    // act
    const cHeaders = buildCanonicalHeaders(headers);

    // assert
    expect(cHeaders).toEqual('host:t1\nx-amz-date:T2');
  });
});

describe('buildCanonicalSignedHeaders', () => {
  test('header should be sorted', () => {
    // arrange
    const headers = new Headers();
    headers.set('Host', 't1');
    headers.set('X-Amz-Date', 't2');

    // act
    const csHeaders = buildCanonicalSignedHeaders(headers);

    // assert
    expect(csHeaders).toEqual('host;x-amz-date');
  });
});

describe('trim', () => {
  test('do not rm spaces after ;', () => {
    expect(trim('a; b')).toEqual('a; b');
  });

  test('rm spaces after ,', () => {
    expect(trim(' a, b, c ')).toEqual('a,b,c');
  });

  test('keep single space when in quotes', () => {
    expect(trim('"a   b   c"')).toEqual('"a b c"');
  });
});
