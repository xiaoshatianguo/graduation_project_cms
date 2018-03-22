import mockjs from 'mockjs';
import { getRule, postRule } from './mock/rule';
import { getActivities, getNotice, getFakeList } from './mock/api';
import { getFakeChartData } from './mock/chart';
import { imgMap } from './mock/utils';
import { getProfileBasicData } from './mock/profile';
import { getProfileAdvancedData } from './mock/profile';
import { getNotices } from './mock/notices';
import { format, delay } from 'roadhog-api-doc';
import { blogArticles } from './mock/articles';

// 是否禁用代理
const noProxy = process.env.NO_PROXY === 'true';

// 代码中会兼容本地 service mock 以及部署站点的静态数据
const proxy = {
  /** 管理后台接口 */
  'GET /api/article_detail': blogArticles,
};

export default (noProxy
  ? {
      'GET /*': 'http://localhost:7001/',
      'PUT /*': 'http://localhost:7001/',
      'POST /*': 'http://localhost:7001/',
      'DELETE /*': 'http://localhost:7001/',
    }
  : delay(proxy, 1000));
