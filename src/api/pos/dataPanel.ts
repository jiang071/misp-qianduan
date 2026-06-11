import { request } from "@/utils/request";
import axios from "axios";
import { baseUrlApi } from "@/utils/request";

// 订单状态统计
export function orderStatusCount() {
  return request({
    url: "/dashboard/order-status",
    method: "get"
  });
}

//交易额统计
export function salesAmountCount() {
  return request({
    url: "/dashboard/trend",
    method: "get"
  });
}

//分析概览
export function overview() {
  return request({
    url: "/dashboard/overview",
    method: "get"
  });
}

// 销售排行榜
export function salesRanking(params: any) {
  return request({
    url: "/dashboard/product-ranking",
    method: "get",
    params: params
  });
}

//导出销售排行榜
export function exportSalesRanking(params: any) {
  return axios.get(baseUrlApi("dashboard/export"), {
    params,
    responseType: "blob"
  });
}
