import { request } from "@/utils/request";
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
    params: { ids }
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

export function payOrder(orderNo: string) {
  return request({
    url: "/pos/pay",
    method: "post",
    params: { orderNo }
  });
}

export function refundOrder(orderNo: string) {
  return request({
    url: "/pos/refund",
    method: "post",
    params: { orderNo }
  });
}

export function deleteOrderItemById(orderNo: number, skuId: number) {
  return request({
    url: "/pos/item/delete",
    method: "delete",
    params: { orderNo: orderNo, skuId: skuId }
  });
}

// 原方法修改：新增newItem入参，body传递换货SKU信息
export function changeOrderItem(
  orderId: number,
  oldOrderItemId: number,
  newItem: {
    productName: string;
    categoryName: string;
    categoryId: number | null;
    skuId: number;
    productId: number;
    productSn: string;
    orderPrice: number;
    skuCode: string;
    specCombo: string[];
    orderQuantity: number;
  }
) {
  return request({
    url: "/pos/item/change",
    method: "post",
    // url拼接两个query参数
    params: { orderId, oldOrderItemId },
    // 请求体JSON，传递新商品数据
    data: newItem
  });
}

export function refundOrderItem(skuIdList: number[]) {
  return request({
    url: "/pos/item/refund",
    method: "post",
    data: skuIdList
  });
}

export function updateOrderItem(data: any[]) {
  return request({
    url: "pos/item/update",
    method: "put",
    data: data
  });
}

export function getOrderByOrderNo(orderNo: string) {
  return request({
    url: "/pos/list",
    method: "get",
    params: { orderNo }
  });
}

export function selectSkuDetailToChange(productId: number, skuPrice: number) {
  return request({
    url: "/product/sku/selectSkuDetailToChange",
    method: "get",
    params: {
      productId,
      skuPrice
    }
  });
}
