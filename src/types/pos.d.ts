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

// 收银

export interface Sale {
  saleId?: number;
  saleNo: string;
  total: number;
  totalQuantity: number;
  status: string;
}

export interface SaleItem {
  index?: number;
  itemSn: string;
  productName: string;
  price: number;
  quantity: number;
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
  orderSn?: string;
  payUserName?: string;
  orderStatus?: string;
}

export interface Order {
  orderId?: number;
  orderSn?: string;
  payUserName?: string;
  payAmount?: number;
  orderStatus?: string;
  payTime?: string;
  createTime?: string;
  remark?: string;
}
