import fetch from 'node-fetch';
import SHA256 from 'crypto-js/sha256';
import HmacSHA256 from 'crypto-js/hmac-sha256';

export default function awsFetch() {
  console.log('SHA256', SHA256('Message'));
  console.log('HmacSHA256', HmacSHA256('Message', 'Key'));
  return fetch('https://github.com/');
}
