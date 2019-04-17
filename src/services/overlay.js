import request from 'utils/request';
import config from 'config';
import qs from 'qs';

const { overpassapi } = config;

export function getBuildings(params) {
  return request({
    url: `${overpassapi}`,
    method: 'get',
    data: qs.parse(params),
  });
}
