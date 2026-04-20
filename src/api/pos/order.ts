import { request } from "@/utils/request";
import type { Order, OrderItem } from "@/types/pos";

export function listOrderByPage(params: any) {
  return request({
    url: "/pos/listOrder",
    method: "get",
    params: params
  });
}

// export const listOrderByPage = (params?: OrderQueryParams) => {
//   return http.request<ApiResult>("get", baseUrlApi("/pos/listOrder"), {
//     params
//   });
// };

// export function getOrderByOrderNo(orderNo: string) {
//   return request({
//     url: "/pos/list" + orderNo,
//     method: "get"
//   });
// }

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

export function deleteOrderBatch(orderIds: number[]) {
  return request({
    url: "/pos/delete",
    method: "delete",
    params: {
      orderIds
    }
  });
}

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
