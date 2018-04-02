import { stringify } from 'qs';
import { apiPrefix } from '../utils/appConfig';
import request from '../utils/request';

/** Blog文章 RESTful 接口 */
export async function queryBlogArticles(params) {
  return request(`${apiPrefix}/api/article?${stringify(params)}`);
}

export async function updateBlogArticles(params) {
  return request(`${apiPrefix}/api/article/${params.id}`, {
    method: 'PUT',
    body: params,
  });
}

export async function createBlogArticles(params) {
  return request(`${apiPrefix}/api/article`, {
    method: 'POST',
    body: params,
  });
}

export async function deleteBlogArticles(params) {
  return request(`${apiPrefix}/api/article/${params.id}`, {
    method: 'DELETE',
  });
}
