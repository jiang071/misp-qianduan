export default [
  {
    path: "/pos/pdm",
    redirect: "/pos/category",
    meta: {
      icon: "ep:menu",
      title: "基础数据",
      rank: 11
    },
    children: [
      {
        path: "/pos/category",
        name: "category",
        component: () => import("@/views/pos/category/index.vue"),
        meta: {
          icon: "ep:folder",
          title: "商品类别"
        }
      },
      {
        path: "/pos/product",
        name: "product",
        component: () => import("@/views/pos/product/index.vue"),
        meta: {
          icon: "ep:files",
          title: "商品管理"
        }
      }
    ]
  },
  {
    path: "/pos/som",
    redirect: "/pos/sale",
    meta: {
      icon: "ep:shop",
      title: "销售管理",
      rank: 12
    },
    children: [
      {
        path: "/pos/sale",
        name: "sale",
        component: () => import("@/views/pos/sale/index.vue"),
        meta: {
          icon: "ep:shopping-cart-full",
          title: "订单收银"
        }
      },
      {
        path: "/pos/payment",
        name: "payment",
        component: () => import("@/views/pos/payment/index.vue"),
        meta: {
          icon: "ep:money",
          title: "订单支付"
        }
      }
    ]
  }
] satisfies Array<RouteConfigsTable>;
