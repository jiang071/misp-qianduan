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
  count: number;
  restock: number;
  status: string;
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
