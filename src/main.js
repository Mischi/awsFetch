import fetch, { Request } from 'node-fetch';
import SHA256 from 'crypto-js/sha256';
import HmacSHA256 from 'crypto-js/hmac-sha256';

export default function awsFetch(input, init) {
  const req = new Request(input, init);

  setAmzDateHeader(req);


  return fetch(req);
}


function setAmzDateHeader(req) {
  const datetime = new Date()
    .toISOString()
    .replace(/\.\d{3}Z$/, 'Z') // rm ms
    .replace(/[:\-]/g, ''); // rm all : and -

  req.headers.set('X-Amz-Date', datetime);
}
