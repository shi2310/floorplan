import { message } from 'antd';
import { submit } from 'services/floorplan';

export default {
  namespace: 'floorplan',
  state: {
    submitSuccess: false,
  },
  effects: {
    *submit({ payload }, { call, put }) {
      const res = yield call(submit, payload);
      if (res.success) {
        message.success('提交成功', 3);
        yield put({
          type: 'save',
          payload: {
            submitSuccess: true,
          },
        });
      } else {
        message.warn('提交失败');
      }
    },
  },
  reducers: {
    save(state, { payload = {} }) {
      return { ...state, ...payload };
    },
  },
};
