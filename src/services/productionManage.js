import { stringify } from 'qs';
import request from '../utils/request';
import { apiPrefix } from '../utils/appConfig';

/** 部门 RESTful 接口 */
export async function queryStaff(params) {
  return request(`${apiPrefix}/api/staff?${stringify(params)}`);
}

export async function updateStaff(params) {
  return request(`${apiPrefix}/api/staff/${params.id}`, {
    method: 'PUT',
    body: params,
  });
}

export async function createStaff(params) {
  return request(`${apiPrefix}/api/staff`, {
    method: 'POST',
    body: params,
  });
}

export async function deleteStaff(params) {
  return request(`${apiPrefix}/api/staff/${params.id}`, {
    method: 'DELETE',
  });
}
