const menuData = [
  {
    name: '账户',
    icon: 'user',
    path: 'user',
    children: [
      {
        name: '登录',
        path: 'login',
      },
      {
        name: '注册',
        path: 'register',
      },
      {
        name: '注册结果',
        path: 'register-result',
      },
    ],
  },
  {
    name: '管理员',
    icon: 'book',
    path: 'admin',
    authority: 'admin',
  },
  {
    name: '活动管理',
    icon: 'android',
    path: 'activity',
    children: [
      {
        name: '活动信息',
        path: 'info',
      },
      {
        name: '活动审核',
        path: 'checked',
        authority: 'admin',
      },
    ],
  },
  {
    name: '会员管理',
    icon: 'team',
    path: 'members',
  },
  {
    name: '认证师管理',
    icon: 'usergroup-add',
    path: 'certified-architect',
    children: [
      {
        name: '认证师信息',
        path: 'info',
      },
      {
        name: '认证师审核',
        path: 'checked',
        authority: 'admin',
      }
    ],
  },
  {
    name: '作品管理',
    icon: 'profile',
    path: '/production-manage',
    children: [
      {
        name: '作品信息',
        path: 'info',
      },
      {
        name: '作品审核',
        path: 'checked',
      },
    ],
  },
  {
    name: '评论留言管理',
    icon: 'bulb',
    path: '/comments-manage',
    children: [
      {
        name: '评论管理',
        path: 'comments',
      },
      {
        name: '留言管理',
        path: 'massage',
      },
    ],
  },
  {
    name: '点赞关注相关',
    icon: 'form',
    path: '/attention-manage',
  },
];

function formatter(data, parentPath = '', parentAuthority) {
  return data.map((item) => {
    const result = {
      ...item,
      path: `${parentPath}${item.path}`,
      authority: item.authority || parentAuthority,
    };
    if (item.children) {
      result.children = formatter(item.children, `${parentPath}${item.path}/`, item.authority);
    }
    return result;
  });
}

export const getMenuData = () => formatter(menuData);
