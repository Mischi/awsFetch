import {
  buildStringToSign,
  calculateSigningKey
} from '../src/sigv4.js';
import { hexEncode } from '../src/crypto';

const datetime = '20150830T123600Z';
const aws = {
  region: 'us-east-1',
  service: 'service',
  secretKey: 'wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY'
};

test('buildStringToSign', () => {
  // arrange
  const credentialScope = '20150830/us-east-1/service/aws4_request';
  const canonicalRequest = `GET
/
Param1=value1&Param2=value2
host:example.amazonaws.com
x-amz-date:20150830T123600Z

host;x-amz-date
e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`;

  // act
  const stringToSign = buildStringToSign(
    datetime, credentialScope, canonicalRequest, aws
  );

  expect(stringToSign).toEqual(
    `AWS4-HMAC-SHA256
20150830T123600Z
20150830/us-east-1/service/aws4_request
816cd5b414d056048ba4f7c5386d6e0533120fb1fcfa93762cf0fc39e2cf19e0`
  );
});

test('buildCredentialScope', () => {
  // arrange
  const aws = {
    region: 'us-east-1',
    service: 'iam',
    secretKey: 'wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY'
  };

  // act
  const signingKey = calculateSigningKey(datetime, aws);

  // assert
  expect(hexEncode(signingKey)).toEqual(
    `c4afb1cc5771d871763a393e44b703571b55cc28424d1a5e86da6ed3c154a4b9`
  );
});
