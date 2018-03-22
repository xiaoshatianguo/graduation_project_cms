/**
 *  帮助中心模型
 */

import { queryStaff, updateStaff, createStaff, deleteStaff } from '../services/productionManage';

export default {
  namespace: 'staff',

  state: {
    data: {},
    updete: {},
    append: {},
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryStaff, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *put({ payload }, { call, put }) {
      const response = yield call(updateStaff, payload);
      yield put({
        type: 'updete',
        payload: response,
      });
    },
    *add({ payload }, { call, put }) {
      const response = yield call(createStaff, payload);
      // type: 'append' 与 *add 不能重名，会触发重复的接口请求
      yield put({
        type: 'append',
        payload: response,
      });
    },
    *delete({ payload }, { call }) {
      yield call(deleteStaff, payload);
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
