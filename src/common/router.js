import { createElement } from 'react';
import dynamic from 'dva/dynamic';  // 异步路由
import { getMenuData } from './menu';

let routerDataCache;

const modelNotExisted = (app, model) =>
  // eslint-disable-next-line
  !app._models.some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  });

// wrapper of dynamic
const dynamicWrapper = (app, models, component) => {
  // () => require('module')
  // transformed by babel-plugin-dynamic-import-node-sync
  if (component.toString().indexOf('.then(') < 0) {
    models.forEach((model) => {
      if (modelNotExisted(app, model)) {
        // eslint-disable-next-line
        app.model(require(`../models/${model}`).default);
      }
    });
    return (props) => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return createElement(component().default, {
        ...props,
        routerData: routerDataCache,
      });
    };
  }
  // () => import('module')
  return dynamic({
    app,
    models: () =>
      models.filter(model => modelNotExisted(app, model)).map(m => import(`../models/${m}.js`)),
    // add routerData prop
    component: () => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return component().then((raw) => {
        const Component = raw.default || raw;
        return props =>
          createElement(Component, {
            ...props,
            routerData: routerDataCache,
          });
      });
    },
  });
};

function getFlatMenuData(menus) {
  let keys = {};
  menus.forEach((item) => {
    if (item.children) {
      keys[item.path] = { ...item };
      keys = { ...keys, ...getFlatMenuData(item.children) };
    } else {
      keys[item.path] = { ...item };
    }
  });
  return keys;
}

export const getRouterData = (app) => {
  const routerConfig = {
    '/': {
      component: dynamicWrapper(app, ['user', 'login'], () => import('../layouts/BasicLayout')),
    },
    '/exception/403': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/403')),
    },
    '/exception/404': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/404')),
    },
    '/exception/500': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/500')),
    },
    '/user': {
      component: dynamicWrapper(app, [], () => import('../layouts/UserLayout')),
    },
    '/user/login': {
      component: dynamicWrapper(app, ['login'], () => import('../routes/User/Login')),
    },
    '/admin': {
      component: dynamicWrapper(app, ['admin'], () => import('../routes/Admin/AdminManage')),
    },
    '/activity/info': {
      component: dynamicWrapper(app, ['activity'], () => import('../routes/Activity/ActivityInfo'),
      ),
    },
    '/activity/checked': {
      component: dynamicWrapper(app, ['activity'], () => import('../routes/Activity/ActivityChecked'),
      ),
    },
    '/members': {
      component: dynamicWrapper(app, ['members'], () => import('../routes/Members/Members')),
    },
    '/certified-architect/info': {
      component: dynamicWrapper(app, ['certifiedArchitect'], () => import('../routes/CertifiedArchitect/CertifiedArchitectInfo')),
    },
    '/certified-architect/checked': {
      component: dynamicWrapper(app, ['certifiedArchitect'], () => import('../routes/CertifiedArchitect/CertifiedArchitectChecked')),
    },
    '/production/info': {
      component: dynamicWrapper(app, ['production'], () => import('../routes/Production/ProductionInfo')),
    },
    '/production/checked': {
      component: dynamicWrapper(app, ['production'], () => import('../routes/Production/ProductionChecked')),
    },
    '/comments/comments': {
      component: dynamicWrapper(app, ['comments'], () => import('../routes/Comments/Comments')),
    },
    '/comments/massage': {
      component: dynamicWrapper(app, ['comments'], () => import('../routes/Comments/Massage')),
    }
  };

  // Get name from ./menu.js or just set it in the router data.
  const menuData = getFlatMenuData(getMenuData());
  const routerData = {};
  Object.keys(routerConfig).forEach((item) => {
    const menuItem = menuData[item.replace(/^\//, '')] || {};
    routerData[item] = {
      ...routerConfig[item],
      name: routerConfig[item].name || menuItem.name,
      authority: routerConfig[item].authority || menuItem.authority,
    };
  });
  return routerData;
};
