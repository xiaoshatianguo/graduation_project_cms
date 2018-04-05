import { stringify } from 'qs';
import { apiPrefix } from '../utils/appConfig';
import request from '../utils/request';

/** 项目案例 RESTful 接口 */
export async function queryCertifiedArchitect(params) {
  return request(`${apiPrefix}/api/certified_architect?${stringify(params)}`);
}

export async function updateCertifiedArchitect(params) {
  return request(`${apiPrefix}/api/certified_architect/${params.id}`, {
    method: 'PUT',
    body: params,
  });
}

export async function createCertifiedArchitect(params) {
  return request(`${apiPrefix}/api/certified_architect`, {
    method: 'POST',
    body: params,
  });
}

export async function deleteCertifiedArchitect(params) {
  return request(`${apiPrefix}/api/certified_architect/${params.id}`, {
    method: 'DELETE',
  });
}