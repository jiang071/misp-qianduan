import { request } from "@/utils/request";
import { stringify } from "qs";
import { baseUrlApi } from "@/utils/request";
import { http } from "@/utils/http";
import type { ApiResult } from "@/utils/request/types";
import type { CouponQueryParams, CouponInfo } from "@/types/pos";

/**
 * 分页查询优惠券列表 /coupon/list
 * @param params 分页查询参数
 */
export function listCouponByPage(params: CouponQueryParams) {
  return request({
    url: "coupon/list",
    method: "get",
    params: params
  });
}

/**
 * 根据优惠券编码删除单条优惠券
 * @param couponCode 优惠券唯一编码
 */
export function deleteCouponByCode(couponCode: string) {
  return request({
    url: "coupon/" + couponCode,
    method: "delete"
  });
}

/**
 * 批量删除优惠券
 * @param codes 优惠券编码数组
 */
export const deleteCouponBatch = (codes: string[]) => {
  return http.request<ApiResult>("delete", baseUrlApi("/coupon/delete"), {
    params: {
      codes
    },
    paramsSerializer: {
      serialize: params => stringify(params, { arrayFormat: "repeat" })
    }
  });
};

/**
 * 新增优惠券
 * @param data 优惠券表单实体
 */
export function addCoupon(data: CouponInfo) {
  return request({
    url: "coupon/add",
    method: "post",
    data: data
  });
}

/**
 * 禁用优惠券
 * @param couponCode 优惠券唯一编码
 */
export function disableCoupon(couponCode: string) {
  return request({
    url: `coupon/disable/${couponCode}`,
    method: "put"
  });
}

/**
 * 启用优惠券
 * @param couponCode 优惠券唯一编码
 */
export function enableCoupon(couponCode: string) {
  return request({
    url: `coupon/enable/${couponCode}`,
    method: "put"
  });
}

/**
 * 更新优惠券信息
 * @param data 优惠券完整实体数据
 */
export function updateCoupon(data: CouponInfo) {
  return request({
    url: "coupon/update",
    method: "put",
    data: data
  });
}

/** 分页查询优惠券使用记录 */
export function listCouponRecords(params: CouponQueryParams) {
  return request({
    url: "coupon/records",
    method: "get",
    params: params
  });
}
