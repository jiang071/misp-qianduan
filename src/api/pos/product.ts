import { http } from "@/utils/http";
import { stringify } from "qs";
import type { ApiResult } from "@/utils/request/types";
import { baseUrlApi } from "@/utils/request";
import type {
  Product,
  ProductQueryParams,
  ProductSku,
  ProductSpecAttr
} from "@/types/pos";

export const getProductById = (productId: number) => {
  return http.request<ApiResult>("get", baseUrlApi("/product/" + productId));
};

export const getProductBySn = (productSn: string) => {
  return http.request<ApiResult>(
    "get",
    baseUrlApi("/product/getBySn/" + productSn)
  );
};

export const listAllProduct = () => {
  return http.request<ApiResult>("get", baseUrlApi("/product/list"));
};

export const listProductByPage = (params?: ProductQueryParams) => {
  return http.request<ApiResult>("get", baseUrlApi("/product/page"), {
    params
  });
};

export const addProduct = (data: Product) => {
  return http.request<ApiResult>("post", baseUrlApi("/product/add"), {
    data
  });
};

export const updateProduct = (data: Product) => {
  return http.request<ApiResult>("put", baseUrlApi("/product/update"), {
    data
  });
};

export const deleteProduct = (productId: number) => {
  return http.request<ApiResult>("delete", baseUrlApi("/product/" + productId));
};

export const deleteProductBatch = (productIds: number[]) => {
  return http.request<ApiResult>("delete", baseUrlApi("/product/delete"), {
    params: {
      productIds // 以数组形式传入，下面通过 paramsSerializer 序列化为重复的查询参数
    },
    paramsSerializer: {
      serialize: params => stringify(params, { arrayFormat: "repeat" })
    }
  });
};

export const updateProductSpecAttr = (data: ProductSpecAttr) => {
  return http.request<ApiResult>("put", baseUrlApi("/product/spec-attr"), {
    data
  });
};

export const getProductSpecAttrById = (productId: number) => {
  return http.request<ApiResult>(
    "get",
    baseUrlApi("/product/spec-attr/list/" + productId)
  );
};

export const addProductSpecAttr = (data: ProductSpecAttr) => {
  return http.request<ApiResult>("post", baseUrlApi("/product/spec-attr"), {
    data
  });
};

export const deleteProductSpecAttr = (attrId: number) => {
  return http.request<ApiResult>(
    "delete",
    baseUrlApi("/product/spec-attr/" + attrId)
  );
};

export const deleteProductSpecAttrByProductId = (productId: number) => {
  return http.request<ApiResult>(
    "delete",
    baseUrlApi("/product/spec-attr/product/" + productId)
  );
};

export const updateProductSku = (data: ProductSku) => {
  return http.request<ApiResult>("put", baseUrlApi("/product/sku"), {
    data
  });
};

export const addProductSku = (data: ProductSku) => {
  return http.request<ApiResult>("post", baseUrlApi("/product/sku"), {
    data
  });
};

export const getProductSkuBySkuId = (skuId: number) => {
  return http.request<ApiResult>("get", baseUrlApi("/product/sku/" + skuId));
};

export const deleteProductSkuBySkuId = (skuId: number) => {
  return http.request<ApiResult>("delete", baseUrlApi("/product/sku/" + skuId));
};

export const deleteProductSkuByProductId = (productId: number) => {
  return http.request<ApiResult>(
    "delete",
    baseUrlApi("/product/sku/product/" + productId)
  );
};

export const getProductSkuByProductId = (productId: number) => {
  return http.request<ApiResult>(
    "get",
    baseUrlApi("/product/sku/list/" + productId)
  );
};

export const addProductSkus = (skus: ProductSku[]) => {
  return http.request<ApiResult>("post", baseUrlApi("/product/sku/addSkus"), {
    data: skus
  });
};
