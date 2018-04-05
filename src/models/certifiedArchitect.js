/**
 *  认证师模型
 */

import { queryCertifiedArchitect, updateCertifiedArchitect, createCertifiedArchitect, deleteCertifiedArchitect } from '../services/certifiedArchitect';

export default {
  namespace: 'certifiedArchitect',

  state: {
    data: {},
    updete: {},
    append: {},
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryCertifiedArchitect, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *put({ payload }, { call, put }) {
      const response = yield call(updateCertifiedArchitect, payload);
      yield put({
        type: 'updete',
        payload: response,
      });
    },
    *add({ payload }, { call, put }) {
      const response = yield call(createCertifiedArchitect, payload);
      // type: 'append' 与 *add 不能重名，会触发重复的接口请求
      yield put({
        type: 'append',
        payload: response,
      });
    },
    *delete({ payload }, { call }) {
      yield call(deleteCertifiedArchitect, payload);
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
