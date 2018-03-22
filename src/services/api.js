import { stringify } from 'qs';
import { apiPrefix } from '../utils/appConfig';
import request from '../utils/request';

export async function queryProjectNotice() {
  return request(`${apiPrefix}/api/project/notic`);
}

export async function queryActivities() {
  return request(`${apiPrefix}/api/activitie`);
}

export async function queryRule(params) {
  return request(`${apiPrefix}/api/rule?${stringify(params)}`);
}

export async function removeRule(params) {
  return request(`${apiPrefix}/api/rule`, {
    method: 'POST',
    body: {
      ...params,
      method: 'delete',
    },
  });
}

export async function addRule(params) {
  return request(`${apiPrefix}/api/rule`, {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function fakeSubmitForm(params) {
  return request(`${apiPrefix}/api/forms`, {
    method: 'POST',
    body: params,
  });
}

export async function fakeChartData() {
  return request(`${apiPrefix}/api/fake_chart_dat`);
}

export async function queryTags() {
  return request(`${apiPrefix}/api/tag`);
}

export async function queryBasicProfile() {
  return request(`${apiPrefix}/api/profile/basi`);
}

export async function queryAdvancedProfile() {
  return request(`${apiPrefix}/api/profile/advance`);
}

export async function queryFakeList(params) {
  return request(`${apiPrefix}/api/fake_list?${stringify(params)}`);
}

export async function fakeAccountLogin(params) {
  return request(`${apiPrefix}/api/login/account`, {
    method: 'POST',
    body: params,
  });
}

export async function fakeRegister(params) {
  return request(`${apiPrefix}/api/register`, {
    method: 'POST',
    body: params,
  });
}

export async function queryNotices() {
  return request(`${apiPrefix}/api/notice`);
}
