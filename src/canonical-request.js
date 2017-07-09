import URL from 'url-parse';
import SHA256 from 'crypto-js/sha256';
import Hex from 'crypto-js/enc-hex';


export function buildCanonicalRequest(req) {
  const url = new URL(req.url, true);
  return req.text().then(body => {
    return req.method + '\n' +
      encodeURI(url.pathname) + '\n' +
      buildCanonicalQueryString(url.query) + '\n' +
      buildCanonicalHeaders(req.headers) + '\n\n' +
      buildCanonicalSignedHeaders(req.headers) + '\n' +
      Hex.stringify(SHA256(body));
  });
}

export function buildCanonicalQueryString(query) {
  const queryParams = Object.keys(query);
  queryParams.sort();

  return queryParams
    .map(q => q + '=' + query[q])
    .join('&');
}

export function buildCanonicalHeaders(headers) {
  const sortedKeys = [...headers.keys()];
  sortedKeys.sort();

  return sortedKeys
    .map(h => h + ':' + headers.get(h))
    .join('\n');
}

export function buildCanonicalSignedHeaders(headers) {
  const sortedKeys = [...headers.keys()];
  sortedKeys.sort();

  return sortedKeys.join(';');
}
