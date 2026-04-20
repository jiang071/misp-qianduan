import type { EnterItemForm, MakePaymentForm, SaleItem } from "@/types/pos";
import { request } from "@/utils/request";
import type { Order, OrderItem } from "@/types/order";

// 开始新的销售
export function makeNewSale(params: {
  userId: number;
  orderStatus: number;
  payStatus: number;
}) {
  return request({
    url: "/pos/create",
    method: "post",
    data: params
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
export function deleteSaleItem(orderNo: string, skuId: number) {
  return request({
    url: "/pos/item/delete",
    method: "delete",
    params: {
      orderNo,
      skuId
    }
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

// 根据sku获取商品信息、
export function getProductBySku(sku: string) {
  return request({
    url: "/product/sku/selectSkuDetailByCode/" + sku,
    method: "get"
  });
}

// 更新订单
export function updateSale(data: Order) {
  return request({
    url: "/pos/update",
    method: "put",
    data: data
  });
}

// 更新订单项
export function updateSaleItem(data: OrderItem[]) {
  return request({
    url: "/pos/update/items",
    method: "put",
    data: data
  });
}
