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
  productDescription: string;
  price: number;
  productCategoryId?: number;
  category: Category;
  imageUrl: string;
  detailUrl: string;
  skuList: ProductSku[];
  count: number;
  restock: number;
  status: string;
}

export interface ProductSku {
  skuId?: number; // 规格ID
  productId?: number; // 所属商品ID
  skuCode: string; // 规格编码
  skuName: string; // 规格名称
  price: number; // 规格价格
  stock: number; // 规格库存
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
