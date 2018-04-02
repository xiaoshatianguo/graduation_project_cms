import { stringify } from 'qs';
import request from '../utils/request';
import { apiPrefix } from '../utils/appConfig';

/** 部门 RESTful 接口 */
export async function queryFormManage(params) {
  return request(`${apiPrefix}/api/form_manage?${stringify(params)}`);
}

export async function updateFormManage(params) {
  return request(`${apiPrefix}/api/form_manage/${params.id}`, {
    method: 'PUT',
    body: params,
  });
}

export async function deleteFormManage(params) {
  return request(`${apiPrefix}/api/form_manage/${params.id}`, {
    method: 'DELETE',
  });
}
