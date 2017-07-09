import SHA256 from 'crypto-js/sha256';
import HmacSHA256 from 'crypto-js/hmac-sha256';
import Hex from 'crypto-js/enc-hex';

export function hash(value) {
  return SHA256(value);
}

export function hexEncode(value) {
  return Hex.stringify(value);
}

export function hmac(secret, value) {
  return HmacSHA256(value, secret, {asBytes: true});
}
