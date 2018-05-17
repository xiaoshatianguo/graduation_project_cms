import moment from 'moment';
import uuid from 'uuid';
import { dateFormat } from './appConfig';

export function fixedZero(val) {
  return val * 1 < 10 ? `0${val}` : val;
}

export function getTimeDistance(type) {
  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;

  if (type === 'today') {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    return [moment(now), moment(now.getTime() + (oneDay - 1000))];
  }

  if (type === 'week') {
    let day = now.getDay();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);

    if (day === 0) {
      day = 6;
    } else {
      day -= 1;
    }

    const beginTime = now.getTime() - day * oneDay;

    return [moment(beginTime), moment(beginTime + (7 * oneDay - 1000))];
  }

  if (type === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const nextDate = moment(now).add(1, 'months');
    const nextYear = nextDate.year();
    const nextMonth = nextDate.month();

    return [
      moment(`${year}-${fixedZero(month + 1)}-01 00:00:00`),
      moment(moment(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() - 1000),
    ];
  }

  if (type === 'year') {
    const year = now.getFullYear();

    return [moment(`${year}-01-01 00:00:00`), moment(`${year}-12-31 23:59:59`)];
  }
}

export function getPlainNode(nodeList, parentPath = '') {
  const arr = [];
  nodeList.forEach((node) => {
    const item = node;
    item.path = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
    item.exact = true;
    if (item.children && !item.component) {
      arr.push(...getPlainNode(item.children, item.path));
    } else {
      if (item.children && item.component) {
        item.exact = false;
      }
      arr.push(item);
    }
  });
  return arr;
}

export function digitUppercase(n) {
  const fraction = ['角', '分'];
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const unit = [['元', '万', '亿'], ['', '拾', '佰', '仟']];
  let num = Math.abs(n);
  let s = '';
  fraction.forEach((item, index) => {
    s += (digit[Math.floor(num * 10 * 10 ** index) % 10] + item).replace(/零./, '');
  });
  s = s || '整';
  num = Math.floor(num);
  for (let i = 0; i < unit[0].length && num > 0; i += 1) {
    let p = '';
    for (let j = 0; j < unit[1].length && num > 0; j += 1) {
      p = digit[num % 10] + unit[1][j] + p;
      num = Math.floor(num / 10);
    }
    s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
  }

  return s
    .replace(/(零.)*零元/, '元')
    .replace(/(零.)+/g, '零')
    .replace(/^整$/, '零元整');
}

function getRelation(str1, str2) {
  if (str1 === str2) {
    console.warn('Two path are equal!'); // eslint-disable-line
  }
  const arr1 = str1.split('/');
  const arr2 = str2.split('/');
  if (arr2.every((item, index) => item === arr1[index])) {
    return 1;
  } else if (arr1.every((item, index) => item === arr2[index])) {
    return 2;
  }
  return 3;
}

export function getRoutes(path, routerData) {
  let routes = Object.keys(routerData).filter(
    routePath => routePath.indexOf(path) === 0 && routePath !== path
  );
  routes = routes.map(item => item.replace(path, ''));
  let renderArr = [];
  renderArr.push(routes[0]);
  for (let i = 1; i < routes.length; i += 1) {
    let isAdd = false;
    isAdd = renderArr.every(item => getRelation(item, routes[i]) === 3);
    renderArr = renderArr.filter(item => getRelation(item, routes[i]) !== 1);
    if (isAdd) {
      renderArr.push(routes[i]);
    }
  }
  const renderRoutes = renderArr.map((item) => {
    const exact = !routes.some(route => route !== item && getRelation(route, item) === 1);
    return {
      ...routerData[`${path}${item}`],
      key: `${path}${item}`,
      path: `${path}${item}`,
      exact,
    };
  });
  return renderRoutes;
}

/*
 * 新增工具方法
*/

/**
 * 设置sessionStorage
 * @param {*} key
 * @param {*} value
 */
export const setSSItem = (key, value, isLocalStorage = true) => {
  /* 需要将 Object 转成字符串 */
  if (isLocalStorage) {
    localStorage.setItem(key, JSON.stringify(value));
  } else {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
};

/**
 * 获取sessionStorage
 * @param {String} key 需要获取的 key
 * @param {Boolean} isNeedJsonParse 是否需要使用 JSON.parse 转换结果
 */
export const getSSItem = (key, isNeedJsonParse = true, isLocalStorage = true) => {
  let val = '';

  val = isLocalStorage ? localStorage.getItem(key) : sessionStorage.getItem(key);

  return isNeedJsonParse ? JSON.parse(val) : val;
};

export const momentFormat = (key = '', format = dateFormat) => {
  return key === '' ? '' : moment(key).format(format);
};

export const bunchStrs = (strings = [], subAttr = null) => {
  let result = '';

  strings.forEach((item) => {
    if (!item) return;

    result += `${subAttr !== null ? item[subAttr] || '' : item || ''}、`;
  });

  return result.slice(0, result.length - 1);
};

/**
 * money的装换（后台保存的单位是：分）
 * @param {Number} value money的数值
 * @param {Boolean} isShift true - 用来显示给用户， false - 用来传递给后台
 */
export const shiftMoney = (value = 0, isShift = true) => {
  if (isShift) {
    return (value / 100).toFixed(2);
  } else {
    return Math.ceil(value * 100);
  }
};

/**
 * 将对象转成 FormData
 * @param {Object} tarObj
 */
export const toFormData = (tarObj) => {
  const formData = new FormData();
  let key = '';
  const objKeys = Object.keys(tarObj);

  for (key of objKeys) {
    formData.append(key, tarObj[key]);
  }

  return formData;
};

/**
 * 装换area的各个字段的key-value键值对
 * @param {*} list 需要装换的数据
 * @param {*} labelAttr label的属性名
 * @param {*} valueAttr value的属性名
 * @param {*} childAttr children的属性名
 */
export const amendArea = (
  list = [],
  labelAttr = 'label',
  valueAttr = 'value',
  childAttr = 'children'
) => {
  let item = null;
  let temp = {};
  const result = [];
  let subChildren = null;

  for (item of list) {
    temp = {};
    subChildren = item.sub || []; // ! item.sub中的sub，根据具体情况而定

    temp[labelAttr] = item.name; // ! item.name中的name，根据具体情况而定
    temp[valueAttr] = item.code; // ! item.code中的code，根据具体情况而定
    temp[childAttr] = [];

    if (subChildren.length !== 0) {
      temp[childAttr] = amendArea(subChildren);
    }

    result.push(temp);
  }

  return result;
};

/**
 * 根据value查找label
 * @param {*} list 待搜索的数组
 * @param {*} value 需要查找对应label的value
 * @param {*} keys 数据中项的key
 */
export const searchLabel = (
  list = [],
  value = '',
  keys = { label: 'label', value: 'value', children: 'children' }
) => {
  let item = null;
  let result = null;
  let subChildren = null;

  for (item of list) {
    if (item[keys.value] === value) {
      result = item[keys.label];
      break;
    }

    subChildren = item[keys.children] || [];

    if (subChildren.length !== 0) {
      result = searchLabel(subChildren, value);
      if (result) break;
    }
  }

  return result || '';
};

export const getAreaLabels = (list = [], areaCode = {}) => {
  const areaCodeKeys = Object.keys(areaCode);
  const result = {};

  areaCodeKeys.forEach((item) => {
    result[item] = searchLabel(list, areaCode[item]);
  });
  return result;
};

export const getUuidFileName = () => {
  const nowDate = new Date();
  const year = nowDate.getFullYear();
  let month = nowDate.getMonth() + 1;
  let date = nowDate.getDate();
  let curr = '';
  // const prefix = '';
  const suffix = uuid.v4();

  month = month < 10 ? `0${month}` : month;
  date = date < 10 ? `0${date}` : date;
  curr = `${year}${month}${date}`;

  return encodeURI(`${curr}/${suffix}`);
};

// text格式后文变省略号
export const TextToF = (value) => {
  if(value.length === 0){
      return
  }
  let num = value.length;
  if(num >= 10){
      value = value.substring(0,10)
      value = value + '......'
      return ( <span>{value}</span> )
  }else{
      return ( <span>{value}</span> )
  }
}
