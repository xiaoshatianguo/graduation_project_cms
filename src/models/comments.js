/**
 *  表单管理模型
 */

import {
    queryComments,
    updateComments,
    deleteComments,
  } from '../services/comments';
  
export default {
    namespace: 'comments',
  
    state: {
      data: {},
      updete: {},
      append: {},
    },
  
    effects: {
      *fetch({ payload }, { call, put }) {
        const response = yield call(queryComments, payload);
        yield put({
          type: 'save',
          payload: response,
        });
      },
      *put({ payload }, { call, put }) {
        const response = yield call(updateComments, payload);
        yield put({
          type: 'updete',
          payload: response,
        });
      },
      *delete({ payload }, { call }) {
        yield call(deleteComments, payload);
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
  