import { request } from "@/utils/request";
import { stringify } from "qs";
import { baseUrlApi } from "@/utils/request";
import type { Order, OrderItem } from "@/types/pos";
import { http } from "@/utils/http";
import type { ApiResult } from "@/utils/request/types";

export function listOrderByPage(params: any) {
  return request({
    url: "/pos/listOrder",
    method: "get",
    params: params
  });
}

export function getOrderItemsByOrderNo(orderNo: string) {
  return request({
    url: "/pos/items/" + orderNo,
    method: "get"
  });
}

export function deleteOrderByOrderId(orderId: number) {
  return request({
    url: "/pos/" + orderId,
    method: "delete"
  });
}

// 批量删除订单
export const deleteOrderBatch = (ids: number[]) => {
  return http.request<ApiResult>("delete", baseUrlApi("/pos/delete"), {
    params: {
      ids // 以数组形式传入，下面通过 paramsSerializer 序列化为重复的查询参数
    },
    paramsSerializer: {
      serialize: params => stringify(params, { arrayFormat: "repeat" })
    }
  });
};

export function updateOrder(data: Order) {
  return request({
    url: "/pos/update",
    method: "put",
    data: data
  });
}

export function updateOrderItems(orderNo: string, items: OrderItem[]) {
  return request({
    url: "/pos/update/Items",
    method: "put",
    params: { orderNo }, // 订单号放在 URL 参数
    data: items // 商品数组直接放在请求体
  });
}

export function createOrder(data: Order) {
  return request({
    url: "/pos/create",
    method: "post",
    data: data
  });
}
