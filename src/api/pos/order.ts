import { request } from "@/utils/request";
import type { Order } from "@/types/pos";

export function listOrderByPage(params: any) {
  return request({
    url: "/sale/listByPage",
    method: "post",
    data: params
  });
}

export function deleteOrder(saleId: number) {
  return request({
    url: "/sale/" + saleId,
    method: "delete"
  });
}

export function deleteOrderBatch(saleIds: number[]) {
  return request({
    url: "/sale/delete",
    method: "delete",
    params: {
      saleIds
    }
  });
}

export function getOrderById(saleId: number) {
  return request({
    url: "/sale/" + saleId,
    method: "get"
  });
}

export function updateOrder(data: Order) {
  return request({
    url: "/sale/update",
    method: "put",
    data
  });
}
