import request from '../utils/request';
import { apiPrefix } from '../utils/appConfig';

export async function query() {
  return request(`${apiPrefix}/api/user`);
}

export async function queryCurrent() {
  return request(`${apiPrefix}/api/currentUser`);
}
