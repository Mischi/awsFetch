import fetch, { Request } from 'node-fetch';
import URL from 'url-parse';
import { signRequestV4 } from './sigv4';

export default function awsFetch(input, init, aws) {
  const req = new Request(input, init);
  const url = new URL(req.url, true);

  const datetime = getDateTime();
  req.headers.set('X-Amz-Date', datetime);
  req.headers.set('Host', url.hostname);

  return signRequestV4(req, url, datetime, aws).then(() => {
    return fetch(req);
  }).catch((error) => {
    console.log(error)
  });
}


function getDateTime() {
  return new Date()
    .toISOString()
    .replace(/\.\d{3}Z$/, 'Z') // rm ms
    .replace(/[:\-]/g, ''); // rm all : and -
}
