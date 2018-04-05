import { stringify } from 'qs';
import { apiPrefix } from '../utils/appConfig';
import request from '../utils/request';

/** 项目案例 RESTful 接口 */
export async function queryProduction(params) {
  return request(`${apiPrefix}/api/production?${stringify(params)}`);
}

export async function updateProduction(params) {
  return request(`${apiPrefix}/api/production/${params.id}`, {
    method: 'PUT',
    body: params,
  });
}

export async function createProduction(params) {
  return request(`${apiPrefix}/api/production`, {
    method: 'POST',
    body: params,
  });
}

export async function deleteProduction(params) {
  return request(`${apiPrefix}/api/production/${params.id}`, {
    method: 'DELETE',
  });
}