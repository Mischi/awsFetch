import * as fs from 'fs';
import * as path from 'path';
import URL from 'url-parse';
import { Request, Headers } from 'node-fetch';
import { hmac, hexEncode } from '../src/crypto';
import {
  buildCanonicalRequest,
} from '../src/canonical-request';
import {
  buildStringToSign,
  buildAuthorizationHeader,
  calculateSigningKey
} from '../src/sigv4.js';

const datetime = '20150830T123600Z';
const credentialScope = '20150830/us-east-1/service/aws4_request';
const aws = {
  region: 'us-east-1',
  service: 'service',
  secretKey: 'wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY',
  accessKey: 'AKIDEXAMPLE'
};

const testSuite = path.join(__dirname, './aws-sig-v4-test-suite');

describe('aws-sig-v4-test-suite', () => {
  execTest('get-header-key-duplicate');
  //execTest('get-header-value-multiline');
  execTest('get-header-value-order');
  execTest('get-header-value-trim');
  execTest('get-unreserved');
  execTest('get-utf8');
  execTest('get-vanilla-empty-query-key');
  execTest('get-vanilla-query-order-key-case');
  //execTest('get-vanilla-query-order-key');
  //execTest('get-vanilla-query-order-value');
  execTest('get-vanilla-query-unreserved');
  execTest('get-vanilla-query');
  execTest('get-vanilla-utf8-query');
  execTest('get-vanilla');
  //execTest('normalize-path/get-relative-relative');
});

function execTest(testName) {
  function loadTestFile(ext) {
    return fs.readFileSync(
      path.join(testSuite, testName, testName + '.' + ext),
      'utf8'
    );
  }

  describe(testName, () => {
    const requestData = loadTestFile('req').split('\n');

    const pathname = requestData.shift().split(' ')[1];

    const headers = new Headers();
    for (const header of requestData) {
      if (header == '\n')
        break;

      const [name, val] = header.split(':');
      headers.append(name, val);
    }

    const url = `https://${headers.get('Host')}${pathname}`;
    const req = new Request(url, { headers });



    const expectedCReq = loadTestFile('creq');
    const expectedSts =  loadTestFile('sts');
    const expectedAuthz = loadTestFile('authz');

    test('creq', () => {
      // act
      buildCanonicalRequest(req, new URL(url, true)).then(cReq => {
        // assert
        expect(cReq).toEqual(expectedCReq);
      });
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
  });
}
