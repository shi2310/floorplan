import axios from 'axios';
import cloneDeep from 'lodash.clonedeep';
import pathToRegexp from 'path-to-regexp';
import { message, notification } from 'antd';
import qs from 'qs';

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

const fetch = options => {
  const { method = 'get', data, headers = {} } = options;
  let { url } = options;

  const cloneData = data instanceof FormData ? data : cloneDeep(data);

  try {
    let domain = '';
    if (url.match(/[a-zA-z]+:\/\/[^/]*/)) {
      [domain] = url.match(/[a-zA-z]+:\/\/[^/]*/);
      url = url.slice(domain.length);
    }
    const match = pathToRegexp.parse(url);
    url = pathToRegexp.compile(url)(data);
    for (const item of match) {
      if (item instanceof Object && item.name in cloneData) {
        delete cloneData[item.name];
      }
    }
    url = domain + url;
  } catch (e) {
    message.error(e.message);
  }
  switch (method.toLowerCase()) {
    case 'get':
      return axios.get(`${url}?${qs.stringify(cloneData, { encode: false })}`, {
        onDownloadProgress: options.onDownloadProgress,
      });
    case 'delete':
      return axios.delete(url, {
        data: cloneData,
        headers,
      });
    case 'post':
      return axios({
        method: 'post',
        url,
        data: cloneData,
        onUploadProgress: options.onUploadProgress,
        headers,
      });
    case 'put':
      return axios.put(url, {
        ...cloneData,
        headers,
      });
    case 'patch':
      return axios.patch(url, { ...cloneData, headers });
    default:
      return axios(options);
  }
};

export default function request(options) {
  return fetch(options)
    .then(response => {
      const { statusText, status } = response;
      const data = response.data;
      return Promise.resolve({
        success: true,
        message: statusText,
        statusCode: status,
        data,
      }).then(res => {
        const { method = 'get' } = options;
        switch (method.toLowerCase()) {
          case 'get':
            break;
          case 'delete':
            message.success('删除成功');
            break;
          case 'post':
            break;
          case 'put':
          case 'patch':
            message.success('更新成功');
            break;
          default:
            break;
        }
        return res;
      });
    })
    .catch(error => {
      const { response } = error;
      let errortext;
      let statusCode;
      let msg;
      if (response && response instanceof Object) {
        const { data, statusText } = response;
        statusCode = response.status;
        msg = `请求错误 ${response.status}`;
        errortext = codeMessage[statusCode] || data.message || statusText;
      } else {
        statusCode = 600;
        msg = '网络错误';
        errortext = error.message || 'Network Error';
      }

      // message.error(msg);
      notification.error({
        message: msg,
        description: errortext,
      });
      return Promise.resolve({ success: false, statusCode, message: errortext });
    });
}
