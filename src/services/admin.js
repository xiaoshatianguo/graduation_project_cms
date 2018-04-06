import { stringify } from 'qs';
import request from '../utils/request';
import { apiPrefix } from '../utils/appConfig';

/** 管理员 RESTful 接口 */
export async function queryAdmin(params) {
  return request(`${apiPrefix}/api/admin?${stringify(params)}`);
}

export async function updateAdmin(params) {
  return request(`${apiPrefix}/api/admin/${params.id}`, {
    method: 'PUT',
    body: params,
  });
}

export async function createAdmin(params) {
  return request(`${apiPrefix}/api/admin`, {
    method: 'POST',
    body: params,
  });
}

export async function deleteAdmin(params) {
  return request(`${apiPrefix}/api/admin/${params.id}`, {
    method: 'DELETE',
  });
}

