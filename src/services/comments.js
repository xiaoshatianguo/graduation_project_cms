import { stringify } from 'qs';
import request from '../utils/request';
import { apiPrefix } from '../utils/appConfig';

/** 部门 RESTful 接口 */
export async function queryComments(params) {
  return request(`${apiPrefix}/api/comments?${stringify(params)}`);
}

export async function updateComments(params) {
  return request(`${apiPrefix}/api/comments/${params.id}`, {
    method: 'PUT',
    body: params,
  });
}

export async function deleteComments(params) {
  return request(`${apiPrefix}/api/comments/${params.id}`, {
    method: 'DELETE',
  });
}
