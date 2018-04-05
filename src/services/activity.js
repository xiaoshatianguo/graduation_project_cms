import { stringify } from 'qs';
import { apiPrefix } from '../utils/appConfig';
import request from '../utils/request';

/** 项目案例 RESTful 接口 */
export async function queryActivity(params) {
  return request(`${apiPrefix}/api/activity?${stringify(params)}`);
}

export async function updateActivity(params) {
  return request(`${apiPrefix}/api/activity/${params.id}`, {
    method: 'PUT',
    body: params,
  });
}

export async function createActivity(params) {
  return request(`${apiPrefix}/api/activity`, {
    method: 'POST',
    body: params,
  });
}

export async function deleteActivity(params) {
  return request(`${apiPrefix}/api/activity/${params.id}`, {
    method: 'DELETE',
  });
}