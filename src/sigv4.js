import { hmac, hash, hexEncode } from './crypto';
import {
  buildCanonicalRequest,
  buildCanonicalSignedHeaders
} from './canonical-request';

const AWS4_REQUEST = 'aws4_request';
const AWS_SHA_256 = 'AWS4-HMAC-SHA256';

export function signRequestV4(req, url, datetime, aws) {
  return buildCanonicalRequest(req, url).then(canonicalRequest => {
    const credentialScope = buildCredentialScope(datetime, aws);
    const stringToSign = buildStringToSign(
      datetime, credentialScope, canonicalRequest, aws
    );
    const signingKey = calculateSigningKey(datetime, aws);
    const signature = hexEncode(hmac(signingKey, stringToSign));
    req.headers.set('Authorization', buildAuthorizationHeader(
      aws, credentialScope, req.headers, signature
    ));
  });
}

export function buildStringToSign(datetime, credentialScope, canonicalRequest, aws) {
  const hashedCanonicalRequest = hexEncode(hash(canonicalRequest));
  return AWS_SHA_256 + '\n' +
      datetime + '\n' +
      credentialScope + '\n' +
      hashedCanonicalRequest;
}

export function buildCredentialScope(datetime, aws) {
  return datetime.substr(0, 8) +
    `/${aws.region}/${aws.service}/${AWS4_REQUEST}`;
}

export function calculateSigningKey(datetime, aws) {
  return hmac(
    hmac(
      hmac(
        hmac('AWS4' + aws.secretKey, datetime.substr(0, 8)),
        aws.region),
      aws.service),
    AWS4_REQUEST
  );
}

export function buildAuthorizationHeader(aws, credentialScope, headers, signature) {
  return AWS_SHA_256 + ' Credential=' + aws.accessKey + '/' + credentialScope + ', SignedHeaders=' + buildCanonicalSignedHeaders(headers) + ', Signature=' + signature;
}
