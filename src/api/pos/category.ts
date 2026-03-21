import { request } from "@/utils/request";
import type { Category, CategoryQueryParams } from "@/types/pos";

// 查询所有类别
export function listCategory() {
  return request({
    url: "/category/listAll",
    method: "get"
  });
}

// 根据id查询产品
export function getCategoryById(categoryId: number) {
  return request({
    url: "/category/" + categoryId,
    method: "get"
  });
}

export function getCategoryTree() {
  return request({
    url: "/category/tree",
    method: "get"
  });
}

// 根据条件查询产品
export function getCategoryByquery(params?: CategoryQueryParams) {
  return request({
    url: "/category/list",
    method: "post",
    data: params
  });
}

// 添加类别
export function addCategory(data: Category) {
  return request({
    url: "/category/add",
    method: "post",
    data
  });
}

//删除类别
export function deleteCategory(categoryId: number) {
  return request({
    url: "/category/delete/" + categoryId,
    method: "delete"
  });
}

// 批量删除类别
export function deleteCategoryBatch(data: number[]) {
  return request({
    url: "/category/batchDelete",
    method: "delete",
    data
  });
}

// 更新类别
export function updateCategory(data: Category) {
  return request({
    url: "/category/update",
    method: "put",
    data
  });
}
