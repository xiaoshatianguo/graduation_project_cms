const menuData = [
  {
    name: '账户',
    icon: 'user',
    path: 'user',
    authority: 'guest',
    children: [
      {
        name: '登录',
        path: 'login',
      },
    ],
  },
  {
    name: '管理员',
    icon: 'user',
    path: 'admin',
    authority: 'admin',
  },
  {
    name: '活动管理',
    icon: 'bulb',
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
    icon: 'book',
    path: 'production',
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
    name: '作品分类管理',
    icon: 'tags',
    path: 'production-sort',
  },
  {
    name: '评论留言管理',
    icon: 'form',
    path: 'comments',
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
  }
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
