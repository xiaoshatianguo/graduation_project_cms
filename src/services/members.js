import { stringify } from 'qs';
import request from '../utils/request';
import { apiPrefix } from '../utils/appConfig';

/** 管理员 RESTful 接口 */
export async function queryUser(params) {
  return request(`${apiPrefix}/api/user`);
}

export async function updateUser(params) {
  return request(`${apiPrefix}/api/user/${params.id}`, {
    method: 'PUT',
    body: params,
  });
}

export async function createUser(params) {
  return request(`${apiPrefix}/api/user`, {
    method: 'POST',
    body: params,
  });
}

export async function deleteUser(params) {
  return request(`${apiPrefix}/api/user/${params.id}`, {
    method: 'DELETE',
  });
}
