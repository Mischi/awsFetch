import { normalize } from 'path';
import { URLSearchParams } from 'whatwg-url';
import { hash, hexEncode } from './crypto';


export async function buildCanonicalRequest(req, url) {
  const body = await req.text();

  return req.method + '\n' +
    normalize(url.pathname) + '\n' +
    buildCanonicalQueryString(url.searchParams) + '\n' +
    buildCanonicalHeaders(req.headers) + '\n\n' +
    buildCanonicalSignedHeaders(req.headers) + '\n' +
    hexEncode(hash(body));
}

export function buildCanonicalQueryString(searchParams) {
  const sortedKeys = [...new Set(searchParams.keys())];
  sortedKeys.sort();

  return sortedKeys.map(k => {
    const values = searchParams.getAll(k);
    values.sort();

    return values.map(v => encodeURIComponent(k) + '=' + v).join('&');
  }).join('&');

}

export function buildCanonicalHeaders(headers) {
  const sortedKeys = [...headers.keys()];
  sortedKeys.sort();

  return sortedKeys
    .map(h => h + ':' + trim(headers.get(h)))
    .join('\n');
}

export function buildCanonicalSignedHeaders(headers) {
  const sortedKeys = [...headers.keys()];
  sortedKeys.sort();

  return sortedKeys.join(';');
}

export function trim(str) {
  return str.replace(/([^"]+)|("[^"]+")/g, function($0, $1, $2) {
    if ($1) {
        return $1.replace(/,\s/g, ',').trim();
    } else {
      return $2.replace(/\s\s+/g, ' ');
    }
  });
}
