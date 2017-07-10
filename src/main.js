import fetch, { Request } from 'node-fetch';
import { URL } from 'whatwg-url';
import { signRequestV4 } from './sigv4';

export default async function awsFetch(input, init, aws) {
  const req = new Request(input, init);
  const url = new URL(req);

  const datetime = getDateTime();
  req.headers.set('X-Amz-Date', datetime);
  req.headers.set('Host', url.hostname);

  await signRequestV4(req, url, datetime, aws);

  return fetch(req);
}


function getDateTime() {
  return new Date()
    .toISOString()
    .replace(/\.\d{3}Z$/, 'Z') // rm ms
    .replace(/[:\-]/g, ''); // rm all : and -
}
