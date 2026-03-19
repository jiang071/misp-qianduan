import type { EnterItemForm, MakePaymentForm, SaleItem } from "@/types/pos";
import { request } from "@/utils/request";

// 开始新的销售
export function makeNewSale() {
  return request({
    url: "/sale/makeNewSale",
    method: "get"
  });
}
// 录入订单明细
export function enterItem(params: EnterItemForm) {
  return request({
    url: "/sale/enterItem",
    method: "post",
    params: params
  });
}
// 结束录入
export function endSale() {
  return request({
    url: "/sale/endSale",
    method: "get"
  });
}

// 确认支付
export function makePayment(params: MakePaymentForm) {
  return request({
    url: "/sale/makePayment",
    method: "put",
    params: params
  });
}

// 修改一行订单明细数量
export function changeQuantity(data: SaleItem) {
  return request({
    url: "/sale/changeQuantity",
    method: "put",
    data: data
  });
}

// 删除一行订单明细
export function deleteSaleItem(itemSn: string) {
  return request({
    url: "/sale/deleteSaleItem/" + itemSn,
    method: "delete"
  });
}

// 根据Id查询订单
export function getSaleById(saleId: number) {
  return request({
    url: "/sale/" + saleId,
    method: "get"
  });
}

// 根据Id查询订单明细
export function listSaleItemById(saleId: number) {
  return request({
    url: "/sale/listSaleItemById/" + saleId,
    method: "get"
  });
}
