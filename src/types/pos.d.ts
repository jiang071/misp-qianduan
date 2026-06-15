// 商品管理
export interface Category {
  categoryId?: number;
  parentId: number;
  state: boolean;
  categoryName: string;
  level: number;
  path: string;
}

export interface CategoryTree {
  label: string;
  value: number;
  children?: CategoryTree[];
}

export interface Product {
  productId?: number;
  productSn: string;
  productName: string;
  productDesc: string;
  displayPrice: number;
  categoryId?: number;
  categoryName?: string;
  mainImage: string;
  detailImages: string;
  productStock: integer;
  productStatus: enum;
  stockStatus: enum;
  createTime?: string;
  updateTime?: string;
}

export interface ProductSku {
  skuId?: number; // 规格ID
  productId?: number; // 所属商品ID
  skuCode: string; // 规格编码
  specCombo: List<String>; // 规格组合（如 "颜色:红色;尺寸:M"）
  skuPrice: number; // 规格价格
  skuStock: number; // 规格库存
  skuImage: string; // 规格图片URL
}

export interface ProductSpecAttr {
  attrId?: number; // 规格ID
  productId?: number; // 所属商品ID
  attrName: string; // 规格属性名称（如 "颜色"）
  attrValues: List<String>; // 规格属性值（如 "红色,蓝色,绿色"）
  attrType: enum; // 规格属性类型（如 "单选"、"多选"）
}

export interface ProductParams {
  productName?: string;
  productSn?: string;
  productCategoryId?: number;
}

export interface ProductQueryParams {
  pageNum: number;
  pageSize: number;
  productName?: string;
  productSn?: string;
  productCategoryId?: number;
  categoryId?: number; // 可选：如果后端支持按分类路径查询，可传递categoryIds
  categoryIds?: number[];
}

export interface CategoryQueryParams {
  pageNum: number;
  pageSize: number;
  categoryName?: string;
  categoryId?: number;
  state?: boolean;
  parentId?: number;
  level?: number;
}

export interface CategoryQueryParams {
  pageNum: number;
  pageSize: number;
  categoryName?: string;
  categoryId?: number;
  state?: boolean;
  parentId?: number;
  level?: number;
}

// 收银

export interface Sale {
  saleId?: number;
  saleNo: string;
  total: number;
  totalQuantity: number;
  status: string;
  couponCode?: string | null;
  couponDiscount?: number | null;
  orderTotal: number;
}

export interface SaleItem {
  index?: number;
  skuId?: number;
  skuCode: string;
  productName: string;
  skuPrice: number;
  quantity: number;
  skuStock?: number;
  skuImage?: string;
  productId?: number;
  productSn?: string;
  prouctDesc?: string;
  mainImage?: string;
  detailImages?: string;
  productStatus?: string;
  categoryId?: number;
  categoryName?: string;
  categoryLevel?: number;
}

export interface EnterItemForm {
  itemSn: string;
  quantity: number;
}

export interface MakePaymentForm {
  saleId?: number;
  payMethod: string;
  cashTendered: number;
  changeDue?: number;
}

export interface OrderQueryParams {
  pageNum: number;
  pageSize: number;
  orderNo?: string;
  userId?: string;
  orderStatus?: string;
}

export interface Order {
  id: number;
  orderNo: string;
  userId: string;
  username: string | null;
  payAmount: number | null;
  orderStatus: number;
  createTime: string;
  alipayTradeNo: string | null;
  payUrl: string | null;
  payTime: string | null;
  payStatus: number;
}

// 订单商品明细表接口
export interface OrderItem {
  id: number;
  orderNo: string;
  productId: number;
  productSn: string;
  skuId: number;
  skuCode: string;
  specCombo: string | Record<string, any>;
  productName: string;
  categoryId: number | null;
  categoryName: string | null;
  orderPrice: number;
  orderQuantity: number;
  createTime: string | null;
  orderItemStatus: number;
}

// 订单状态新增：4-已退款
export const OrderStatusMap = {
  0: "待支付",
  1: "已支付",
  2: "已完成",
  3: "已取消",
  4: "已退款" // 【新增】
} as const;

// 【新增】订单商品状态
export const OrderItemStatusMap = {
  0: "待支付",
  1: "已支付",
  2: "已退款",
  3: "已换货"
} as const;

// 优惠券主体信息
export interface CouponInfo {
  id?: bigint; // 主键自增
  couponName: string; // 优惠券名称
  couponCode: string; // 优惠券唯一编码
  couponType: number; // 类型：0代表对应业务类型
  discount: number; // 优惠值（满减金额/折扣比例）
  minAmount: number; // 最低消费门槛
  quantity: number; // 发行总数量
  remainQuantity: number; // 剩余可领数量
  validStartTime: string; // 有效期开始时间
  validEndTime: string; // 有效期结束时间
  status: number; // 优惠券状态 0=启用/停用等
  createTime?: string; // 创建时间
}

// 优惠券分页查询参数
export interface CouponQueryParams {
  pageNum: number;
  pageSize: number;
  couponName?: string;
  couponCode?: string;
  couponType?: number;
  status?: number;
}

// 用户优惠券领取&使用记录
export interface CouponUserRecord {
  id?: bigint;
  couponCode: string; // 关联优惠券编码
  userId: string; // 领取用户ID
  orderNo?: string | null; // 抵扣订单号，未使用为null
  discountAmount: number; // 实际抵扣金额
  useTime?: string | null; // 使用时间，未使用为null
}

// 用户优惠券查询参数（查个人领到的券）
export interface UserCouponQueryParams {
  pageNum: number;
  pageSize: number;
  userId: string;
  useStatus?: number; // 自定义：0未使用 1已使用 2已过期
}

// 优惠券类型映射
export const CouponTypeMap = {
  0: "满减券"
  // 可自行扩展 1折扣券 2无门槛券...
} as const;

// 优惠券整体状态映射
export const CouponStatusMap = {
  0: "未启用",
  1: "正常发放",
  2: "已过期"
} as const;

// 用户券使用状态（业务判断用）
export const UserCouponUseStatusMap = {
  0: "未使用",
  1: "已使用",
  2: "已过期"
} as const;
