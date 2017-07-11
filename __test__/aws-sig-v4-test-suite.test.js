import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'whatwg-url';
import fetch, { Request, Headers } from 'node-fetch';
import { hmac, hexEncode } from '../src/crypto';
import {
  buildCanonicalRequest,
} from '../src/canonical-request';
import {
  buildStringToSign,
  buildAuthorizationHeader,
  calculateSigningKey
} from '../src/sigv4.js';
import awsFetch from '../src/main';

const datetime = '20150830T123600Z';
const credentialScope = '20150830/us-east-1/service/aws4_request';
const aws = {
  region: 'us-east-1',
  service: 'service',
  secretKey: 'wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY',
  accessKey: 'AKIDEXAMPLE',
};

const awsTestSuiteDir = path.join(__dirname, './aws-sig-v4-test-suite');

describe('aws-sig-v4-test-suite', () => {
  execTest('get-header-key-duplicate');
  // XXX Headers does not support multiline header values
  //execTest('get-header-value-multiline');
  execTest('get-header-value-order');
  execTest('get-header-value-trim');
  execTest('get-unreserved');
  execTest('get-utf8');
  execTest('get-vanilla-empty-query-key');
  execTest('get-vanilla-query-order-key-case');
  execTest('get-vanilla-query-order-key');
  execTest('get-vanilla-query-order-value');
  execTest('get-vanilla-query-unreserved');
  execTest('get-vanilla-query');
  execTest('get-vanilla-utf8-query');
  execTest('get-vanilla');

  describe('normalize-path', () => {
    const npTestSuiteDir = path.join(awsTestSuiteDir, 'normalize-path');
    execTest('get-relative-relative', npTestSuiteDir);
    execTest('get-relative', npTestSuiteDir);
    execTest('get-slash-dot-slash', npTestSuiteDir);
    execTest('get-slash-pointless-dot', npTestSuiteDir);
    execTest('get-slash', npTestSuiteDir);
    execTest('get-slashes', npTestSuiteDir);
    execTest('get-space', npTestSuiteDir);
  });

  execTest('post-header-key-case');
  execTest('post-header-key-sort');
  execTest('post-header-value-case');

  describe('post-sts-token', () => {
    beforeAll(() => {
      aws.sessionToken = 'AQoDYXdzEPT//////////wEXAMPLEtc764bNrC9SAPBSM22wDOk4x4HIZ8j4FZTwdQWLWsKWHGBuFqwAeMicRXmxfpSPfIeoIYRqTflfKD8YUuwthAx7mSEI/qkPpKPi/kMcGdQrmGdeehM4IC1NtBmUpp2wUE8phUZampKsburEDy0KPkyQDYwT7WZ0wq5VSXDvp75YU9HFvlRd8Tx6q6fE8YQcHNVXAkiY9q6d+xo0rKwT38xVqr7ZD0u0iPPkUL64lIZbqBAz+scqKmlzm8FDrypNC9Yjc8fPOLn9FX9KSYvKTr4rvx3iSIlTJabIQwj2ICCR/oLxBA==';
    })

    afterAll(() => {
      delete aws.sessionToken;
    });

    const pststTestSuiteDir = path.join(awsTestSuiteDir, 'post-sts-token');
    execTest('post-sts-header-after', pststTestSuiteDir);
    execTest('post-sts-header-before', pststTestSuiteDir);
  });

  execTest('post-vanilla-empty-query-value');
  execTest('post-vanilla-query');
  execTest('post-vanilla');
  execTest('post-x-www-form-urlencoded-parameters');
  execTest('post-x-www-form-urlencoded');
});

function execTest(testName, testSuiteDir = awsTestSuiteDir) {
  function loadTestFile(ext) {
    return fs.readFileSync(
      path.join(testSuiteDir, testName, testName + '.' + ext),
      'utf8'
    );
  }

  function parseRequest(testFileExt) {
    const [headerData, body] = loadTestFile(testFileExt).split('\n\n');
    const headerDataItems = headerData.split(/\n(?!\s)/);

    // cut of " HTTP/1.1"
    const topHeader = headerDataItems.shift().slice(0, -9);
    const idx = topHeader.indexOf(' ');
    const method = topHeader.substring(0, idx);
    const pathname = topHeader.substring(idx + 1);

    const headers = new Headers();
    for (const header of headerDataItems) {
      if (header == '' || header == '\n')
        break;

      const [name, val] = header.split(':');
      headers.append(name, val.trim());
    }

    const url = `https://${headers.get('Host')}${pathname}`;
    const req = new Request(url, { method, headers, body });

    return { req, url };
  }

  describe(testName, () => {
    const expectedCReq = loadTestFile('creq');
    const expectedSts = loadTestFile('sts');
    const expectedAuthz = loadTestFile('authz');
    let req, url;

    beforeEach(() => {
      jest.resetAllMocks();
      let parsedReq = parseRequest('req');
      req = parsedReq.req;
      url = parsedReq.url;
    });

    test('creq', async () => {
      // act
      const cReq = await buildCanonicalRequest(req, new URL(url));

      // assert
      // TODO: remove
      //if (testName == 'get-space') {
      //  fs.writeFileSync('/tmp/creq', cReq, 'ascii');
      //  console.log('----> written');
      //}
      expect(cReq).toEqual(expectedCReq);
    });

    test('sts', () => {
      // arrange
      const cReq = expectedCReq;

      // act
      const stringToSign = buildStringToSign(
        datetime, credentialScope, cReq, aws
      );

      expect(stringToSign).toEqual(expectedSts);
    });

    test('authz', () => {
      // act
      const signingKey = calculateSigningKey(datetime, aws);
      const signature = hexEncode(hmac(signingKey, expectedSts));
      const auth = buildAuthorizationHeader(
        aws, credentialScope, req.headers, signature
      );

      // assert
      expect(auth).toEqual(expectedAuthz);
    });

    test('full', async () => {
      // arrange
      Date.prototype.toISOString = jest.fn();
      Date.prototype.toISOString.mockReturnValueOnce(
        '2015-08-30T12:36:00.691Z'
      );

      // act
      await awsFetch(req, {}, aws);

      // assert
      const currentReq = fetch.mock.calls[0][0];

      const expectedReq = parseRequest('sreq').req;
      expect(currentReq.method).toEqual(expectedReq.method);
      expect(currentReq.url).toEqual(expectedReq.url);
      expect(currentReq.body).toEqual(expectedReq.body);


      const currentUniqueKeys = [
        ...new Set(currentReq.headers.keys())
      ];
      const expectedUniqueKeys = [
        ...new Set(expectedReq.headers.keys())
      ];

      expect(expectedUniqueKeys).toEqual(currentUniqueKeys);
      for (const expectedKey of expectedUniqueKeys) {
        const expectedValue = expectedReq.headers.get(expectedKey);
        const currentValue = currentReq.headers.get(expectedKey);
        expect(currentValue).toEqual(expectedValue);
      }
    });
  });
}
