/**
 *  表单管理模型
 */

import {
    queryFormManage,
    updateFormManage,
    deleteFormManage,
  } from '../services/commentsManage';
  
export default {
    namespace: 'formManage',
  
    state: {
      data: {},
      updete: {},
      append: {},
    },
  
    effects: {
      *fetch({ payload }, { call, put }) {
        const response = yield call(queryFormManage, payload);
        yield put({
          type: 'save',
          payload: response,
        });
      },
      *put({ payload }, { call, put }) {
        const response = yield call(updateFormManage, payload);
        yield put({
          type: 'updete',
          payload: response,
        });
      },
      *delete({ payload }, { call }) {
        yield call(deleteFormManage, payload);
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
  