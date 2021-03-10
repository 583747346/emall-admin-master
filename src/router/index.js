import Vue from 'vue'
import VueRouter from 'vue-router'
import login from '../views/login/login.vue'
import layout from '../components/layout/layout'
import dashboard from '../views/dashboard/dashboard'
import user from '../views/user/user'
import role from '../views/role/role'
import roleResource from '../views/role/roleResource'
import menu from '../views/menu/menu'
import resource from '../views/resource/resource'
import productList from '../views/product/productList'
import brand from '../views/brand/brand'
import category from '../views/category/category'
import subcategory from '../views/category/subcategory'
import productAttribute from '../views/productAttribute/productAttribute'
import productSpecsOrParam from '../views/productAttribute/productSpecsOrParam'
import productAdd from '../views/product/insert/productAdd'
import productSaleInfo from '../views/product/detail/productSaleInfo'
import productAttributeInfo from '../views/product/detail/productAttributeInfo'
import productCollocationInfo from '../views/product/detail/productCollocationInfo'
import productBasicInfo from '../views/product/detail/productBasicInfo'
import productUnit from '../views/productUnit/productUnit'
import member from '../views/member/member'
import memberRank from '../views/member/memberRank'
import stockList from '../views/stock/stockList'
import orderList from '../views/order/orderList'
import productUpdate from '../views/product/update/productUpdate'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Login',
    component: login
  },
  {
    path: '/home',
    component: layout,
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        component: dashboard,
        name: 'Dashboard',
        meta: {
          auth: true
        }
        //meta: { title: '首页', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/authManege',
    component: layout,
    redirect: 'user',
    meta: {
      auth: true,
      title: '权限管理'
    },
    children: [
      {
        path: '/user',
        component: user,
        name: 'user',
        meta: {
          auth: true,
          title: '用户管理'
        }
      },
      {
        path: '/role',
        component: role,
        name: 'role',
        meta: {
          auth: true,
          title: '角色管理'
        }
      },
      {
        path: '/roleResource',
        component: roleResource,
        name: 'roleResource',
        meta: {
          auth: true,
          title: '分配资源'
        },
        hidden: true
      },
      {
        path: '/menu',
        component: menu,
        name: 'menu',
        meta: {
          auth: true,
          title: '菜单管理'
        }
      },
      {
        path: '/resource',
        component: resource,
        name: 'resource',
        meta: {
          auth: true,
          title: '资源管理'
        }
      }
    ]
  },
  {
    path: '/productManage',
    component: layout,
    redirect: 'productList',
    meta: {
      auth: true,
      title: '商品管理'
    },
    children: [
      {
        path: '/productList',
        component: productList,
        name: 'productList',
        meta: {
          auth: true,
          title: '商品列表信息'
        }
      },
      {
        path: '/productAdd',
        component: productAdd,
        name: 'productAdd',
        meta: {
          auth: true,
          title: '商品基本信息'
        }
      },
      {
        path: '/productSaleInfo',
        component: productSaleInfo,
        name: 'productSaleInfo',
        meta: {
          auth: true,
          title: '商品促销信息'
        }
      },
      {
        path: '/productAttributeInfo',
        component: productAttributeInfo,
        name: 'productAttributeInfo',
        meta: {
          auth: true,
          title: '商品规格参数'
        }
      },
      {
        path: '/productCollocationInfo',
        component: productCollocationInfo,
        name: 'productCollocationInfo',
        meta: {
          auth: true,
          title: '商品推荐搭配'
        }
      },
      {
        path: '/productUpdate',
        component: productUpdate,
        name: 'productUpdate',
        meta: {
          auth: true,
          title: '商品更新'
        }
      },
      {
        path: '/brand',
        component: brand,
        name: 'brand',
        meta: {
          auth: true,
          title: '品牌信息'
        }
      },
      {
        path: '/category',
        component: category,
        name: 'category',
        meta: {
          auth: true,
          title: '商品分类'
        }
      },
      {
        path: '/subcategory',
        component: subcategory,
        name: 'subcategory',
        meta: {
          auth: true,
          title: '商品子分类'
        },
      },
      {
        path: '/productAttribute',
        component: productAttribute,
        name: 'productAttribute',
        meta: {
          auth: true,
          title: '商品属性'
        }
      },
      {
        path: '/productSpecsOrParam',
        component: productSpecsOrParam,
        name: 'productSpecsOrParam',
        meta: {
          auth: true,
          title: '商品属性(规格|参数)'
        }
      },
      {
        path: '/productUnit',
        component: productUnit,
        name: 'productUnit',
        meta: {
          auth: true,
          title: '商品单位'
        }
      }]
  },
  {
    path: '/memberManage',
    component: layout,
    redirect: 'memberList',
    meta: {
      auth: true,
      title: '会员管理'
    },
    children: [
      {
        path: '/memberList',
        component: member,
        name: 'member',
        meta: {
          auth: true,
          title: '会员列表'
        }
      },
      {
        path: '/memberRank',
        component: memberRank,
        name: 'memberRank',
        meta: {
          auth: true,
          title: '会员等级'
        }
      }]
  },
  {
    path: '/stockManage',
    component: layout,
    redirect: 'stockList',
    meta: {
      auth: true,
      title: '库存管理'
    },
    children: [
      {
        path: '/stockList',
        component: stockList,
        name: 'stockList',
        meta: {
          auth: true,
          title: '库存信息列表'
        }
      }]
  },
  {
    path: '/orderManage',
    component: layout,
    redirect: 'orderList',
    meta: {
      auth: true,
      title: '订单管理'
    },
    children: [
      {
        path: '/orderList',
        component: orderList,
        name: 'orderList',
        meta: {
          auth: true,
          title: '订单列表'
        }
      }]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
