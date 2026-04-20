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
}
