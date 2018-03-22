/*
 * app全局配置文件
 */

/* 程序调用接口的前缀 */
// TODO: 更改接口服务器地址
export const apiPrefix = 'http://39.108.75.149:7001'; // 测试服地址
// export const apiPrefix = 'http://120.76.189.133:7001'; // 正式服地址
// export const apiPrefix = '';

/* 异步请求接口超时的时长，以秒作为单位 */
export const timeout = '30';

/* 分页，每页的条数 */
export const pageableSize = 10;

/* 登录之后去到的页面 */
export const loginToIndex = '/App';

/* 日期默认的格式化显示 */
export const dateFormat = 'YYYY-MM-DD';

/* 串字符串时的分割符 */
/* 例如：教师1、教师2 */
export const bunchStrsSeparator = '、';

/* 七牛bucket空间名称 */
// TODO: 更改七牛云地址
export const qiniuBucket = 'blogs-pic';
export const qiniuDomain = 'http://ok49dhwbm.bkt.clouddn.com';
export const qiniuUploadApi = '//upload-z2.qiniu.com/';

/* 七牛获取 token 地址 */
export const getQiniuToken = `${apiPrefix}/api/qiuniuyun_token`;
