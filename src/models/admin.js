/**
 *  管理员
 */

import { queryAdmin, updateAdmin, createAdmin, deleteAdmin } from '../services/admin';

export default {
  namespace: 'admin',

  state: {
    data: {},
    updete: {},
    append: {},
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryAdmin, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *put({ payload }, { call, put }) {
      const response = yield call(updateAdmin, payload);
      yield put({
        type: 'updete',
        payload: response,
      });
    },
    *add({ payload }, { call, put }) {
      const response = yield call(createAdmin, payload);
      // type: 'append' 与 *add 不能重名，会触发重复的接口请求
      yield put({
        type: 'append',
        payload: response,
      });
    },
    *delete({ payload }, { call }) {
      yield call(deleteAdmin, payload);
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    updete(state, action) {
      return {
        ...state,
        updete: action.payload,
      };
    },
    append(state, action) {
      return {
        ...state,
        append: action.payload,
      };
    },
  },
};
