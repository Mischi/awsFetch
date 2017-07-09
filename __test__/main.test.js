import fetch from 'node-fetch';
import awsFetch from '../src/main.js';

jest.mock('node-fetch');
Date.prototype.toISOString = jest.fn();

test('get-vanilla-query-order-key', () => {
  // arrange
  const host = 'exmaple.amazonaws.com'
  const queryParams = '?Param1=value2&Param1=Value1'
  const url = `https://${host}${queryParams}`;

  Date.prototype.toISOString.mockReturnValueOnce(
    '2015-08-30T12:36:00.691Z'
  );

  // act
  awsFetch(url);

  // assert
  const req = fetch.mock.calls[0][0];
  expect(req.url).toEqual(url);
  expect(req.headers.get('X-Amz-Date')).toEqual('20150830T123600Z');
});

