// 订单商品项
export interface OrderItem {
  id?: number;
  orderNo: string;
  productId?: number;
  productSn?: string;
  skuId: number;
  skuCode?: string;
  specCombo?: string[];
  productName?: string;
  categoryId?: number;
  categoryName?: string;
  orderPrice?: number;
  orderQuantity: number;
  createTime?: string;
}

// 订单完整结构
export interface Order {
  id?: number;
  orderNo: string;
  userId?: string;
  username?: string;
  payAmount?: number;
  orderStatus?: number;
  createTime?: string;
  alipayTradeNo?: string;
  payUrl?: string;
  payTime?: string;
  payStatus?: number;
  orderItems?: OrderItem[];
  couponCode?: string | null;
  couponDiscount?: number | null;
  orderTotal: number;
}

// 优惠券校验入参
export interface ValidateCouponRequest {
  couponCode?: string;
  userId?: number;
  orderTotal?: number;
}

// 优惠券校验返回data
export interface ValidateCouponResponse {
  valid: boolean;
  discountAmount: number;
  actualPayAmount: number;
  message: string;
}

export interface AvailableCouponItem {
  id: number;
  couponName: string;
  couponCode: string;
  couponType: number; // 1折扣券 2现金抵用券
  discount: number; // 后端实际抵扣数值，替代你之前的discountAmount
  minAmount: number;
  quantity: number;
  remainQuantity: number;
  validStartTime: string;
  validEndTime: string;
  status: number;
  createTime: string;
}
