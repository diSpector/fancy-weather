import ApiHelper from '../src/js/modules/apiHelper';
import apiConfig from '../src/js/settings/apiConfig';

const apiHelper = new ApiHelper(apiConfig.obj.opencage, { q: 'Barcelona', no_annotations: 1 });

test('params forms correctly', () => {
  const testObj = {
    key: '8114533ae47e43bbb81149a84de22e25',
    no_annotations: 1,
    pretty: 1,
    q: 'Barcelona',
  };
  apiHelper.getParams();
  expect(apiHelper.getParams()).toMatchObject(testObj);
});

test('query string forms correctly', () => {
  expect(apiHelper.getUrlStrFromObj(apiHelper.getParams()))
    .toEqual('q=Barcelona&pretty=1&key=8114533ae47e43bbb81149a84de22e25&no_annotations=1');
});

test('url for opencage api call forms correctly', () => {
  expect(apiHelper.getRequestUrl())
    .toEqual('https://api.opencagedata.com/geocode/v1/json?q=Barcelona&pretty=1&key=8114533ae47e43bbb81149a84de22e25&no_annotations=1')
});