import request from 'utils/request';
import config from 'config';

const { api } = config;

export function submit(formdata) {
  return request({
    url: `${api}/floor-plan`,
    method: 'post',
    data: formdata,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
