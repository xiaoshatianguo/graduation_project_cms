import { stringify } from 'qs';
import { apiPrefix } from '../utils/appConfig';
import request from '../utils/request';

/** 项目案例 RESTful 接口 */
export async function queryProductionType(params) {
  return request(`${apiPrefix}/api/production_type?${stringify(params)}`);
}

export async function updateProductionType(params) {
  return request(`${apiPrefix}/api/production_type/${params.id}`, {
    method: 'PUT',
    body: params,
  });
}

export async function createProductionType(params) {
  return request(`${apiPrefix}/api/production_type`, {
    method: 'POST',
    body: params,
  });
}

export async function deleteProductionType(params) {
  return request(`${apiPrefix}/api/production_type/${params.id}`, {
    method: 'DELETE',
  });
}