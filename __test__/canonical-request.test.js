import URL from 'url-parse';
import { Request, Headers } from 'node-fetch';
import {
  buildCanonicalRequest,
  buildCanonicalQueryString,
  buildCanonicalHeaders,
  buildCanonicalSignedHeaders,
  trim
} from '../src/canonical-request.js';

xdescribe('buildCanonicalRequest', () => {
  test('get-vanilla-query-order-key', () => {
    // arrange
    const host = 'example.amazonaws.com'
    const queryParams = '?Param1=value1&Param2=value2'
    const url = `https://${host}/${queryParams}`;
    const headers = {
      'X-Amz-Date': '20150830T123600Z',
      'Host': host
    };
    const req = new Request(url, { headers })

    // act
    buildCanonicalRequest(req, new URL(url, true)).then(cReq => {
      // assert
      expect(cReq).toEqual(`GET
/
Param1=value1&Param2=value2
host:example.amazonaws.com
x-amz-date:20150830T123600Z

host;x-amz-date
e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`);
    });
  });
});

describe('buildCanonicalQueryString', () => {
  test('params should be sorted', () => {
    // arrange
    const url = new URL('https://example.aws.com/?Param2=2&Param1=test', true);

    // act
    const cQueryString = buildCanonicalQueryString(url.query);

    // assert
    expect(cQueryString).toEqual('Param1=test&Param2=2');
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
  test('rm spaces', () => {
    expect(trim(' a, b, c ')).toEqual('a,b,c');
  });

  test('keep single space when in quotes', () => {
    expect(trim('"a   b   c"')).toEqual('"a b c"');
  });
});
