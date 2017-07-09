import { hash, hexEncode } from './crypto';

export function buildCanonicalRequest(req, url) {
  return req.text().then(body => {
    return req.method + '\n' +
      encodeURI(url.pathname) + '\n' +
      buildCanonicalQueryString(url.query) + '\n' +
      buildCanonicalHeaders(req.headers) + '\n\n' +
      buildCanonicalSignedHeaders(req.headers) + '\n' +
      hexEncode(hash(body));
  });
}

export function buildCanonicalQueryString(query) {
  const queryParams = Object.keys(query);
  queryParams.sort();

  return queryParams
    .map(q => encodeURIComponent(q) + '=' + query[q])
    .join('&');
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
        return $1.replace(/\s/g, '');
    } else {
      return $2.replace(/\s\s+/g, ' ');
    }
  });
}
