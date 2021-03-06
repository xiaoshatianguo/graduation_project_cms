import { stringify } from 'qs';
import { apiPrefix } from '../utils/appConfig';
import request from '../utils/request';

/** 项目案例 RESTful 接口 */
export async function queryCase(params) {
  return request(`${apiPrefix}/api/project_case?${stringify(params)}`);
}

export async function updateCase(params) {
  return request(`${apiPrefix}/api/project_case/${params.id}`, {
    method: 'PUT',
    body: params,
  });
}

export async function createCase(params) {
  return request(`${apiPrefix}/api/project_case`, {
    method: 'POST',
    body: params,
  });
}

export async function deleteCase(params) {
  return request(`${apiPrefix}/api/project_case/${params.id}`, {
    method: 'DELETE',
  });
}