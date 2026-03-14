import { request } from "@/utils/request";

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
