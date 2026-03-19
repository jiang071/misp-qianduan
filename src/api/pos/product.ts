import { http } from "@/utils/http";
import type { ApiResult } from "@/utils/request/types";
import { baseUrlApi } from "@/utils/request";
import type { Product, ProductQueryParams } from "@/types/pos";

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
  return http.request<ApiResult>("get", baseUrlApi("/product/listAll"));
};

export const listProductByPage = (params?: ProductQueryParams) => {
  return http.request<ApiResult>("get", baseUrlApi("/product/page"), {
    params
  });
};

export const addProduct = (data: Product) => {
  return http.request<ApiResult>("post", baseUrlApi("/product/add"), { data });
};

export const updateProduct = (data: Product) => {
  return http.request<ApiResult>("put", baseUrlApi("/product/update"), {
    data
  });
};

export const deleteProduct = (productId: number) => {
  return http.request<ApiResult>(
    "delete",
    baseUrlApi("/product/delete/" + productId)
  );
};

export const deleteProductBatch = (productIds: number[]) => {
  return http.request<ApiResult>(
    "delete",
    baseUrlApi("/product/deleteByIds/" + productIds)
  );
};
