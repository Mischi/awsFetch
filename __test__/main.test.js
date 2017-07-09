import fetch from 'node-fetch';
import awsFetch from '../src/main.js';

jest.mock('node-fetch');
Date.prototype.toISOString = jest.fn();

test('get-vanilla-query-order-key', () => {
  // arrange
  const host = 'example.amazonaws.com'
  const queryParams = '?Param2=value2&Param1=Value1'
  const url = `https://${host}/${queryParams}`;

  const aws = {
    region: 'us-east-1',
    service: 'service',
    secretKey: 'wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY',
    accessKey: 'AKIDEXAMPLE'
  };

  Date.prototype.toISOString.mockReturnValueOnce(
    '2015-08-30T12:36:00.691Z'
  );

  // act
  awsFetch(url, {}, aws).then(res => {
    // assert
    const req = fetch.mock.calls[0][0];
    expect(req.url).toEqual(url);
    expect(req.headers.get('X-Amz-Date')).toEqual('20150830T123600Z');
    expect(req.headers.get('Authorization')).toEqual(
      'AWS4-HMAC-SHA256 Credential=AKIDEXAMPLE/20150830/us-east-1/service/aws4_request, SignedHeaders=host;x-amz-date, Signature=b97d918cfa904a5beff61c982a1b6f458b799221646efd99d3219ec94cdf2500'
    )
  });
});

