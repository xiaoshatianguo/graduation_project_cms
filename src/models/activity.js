/**
 * 活动信息管理
 */

import { queryActivity, updateActivity, createActivity, deleteActivity } from '../services/activity';

export default {
  namespace: 'activity',

  state: {
    data: {},
    updete: {},
    append: {},
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryActivity, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *put({ payload }, { call, put }) {
      const response = yield call(updateActivity, payload);
      yield put({
        type: 'updete',
        payload: response,
      });
    },
    *add({ payload }, { call, put }) {
      const response = yield call(createActivity, payload);
      // type: 'append' 与 *add 不能重名，会触发重复的接口请求
      yield put({
        type: 'append',
        payload: response,
      });
    },
    *delete({ payload }, { call }) {
      yield call(deleteActivity, payload);
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
