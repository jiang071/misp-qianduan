import { request } from "@/utils/request";
// import { stringify } from "qs";
// import { baseUrlApi } from "@/utils/request";
// import { http } from "@/utils/http";
// import type { ApiResult } from "@/utils/request/types";
import type { CouponQueryParams, CouponInfo } from "@/types/pos";
import type { ValidateCouponRequest } from "@/types/order";

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
 * 批量删除优惠券 /coupon/batch
 * @param codes 优惠券编码字符串数组
 */
export function deleteCouponBatch(codes: string[]) {
  return request({
    url: "coupon/batch",
    method: "delete",
    data: codes
  });
}
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

/**
 * 查询当前可用的优惠券列表 /coupon/available
 * @param orderTotal 订单金额（必填）
 * @param userId 用户id（可选）
 */
export function getAvailableCoupon(
  orderTotal: number,
  userId?: string | number
) {
  // 组装请求参数
  const params: Record<string, any> = { orderTotal };
  if (userId !== undefined && userId !== null) {
    params.userId = userId;
  }
  return request({
    url: "coupon/available",
    method: "get",
    params: params
  });
}

/**
 * 根据优惠券编码查询优惠券详情 /coupon/{couponCode}
 * @param couponCode 优惠券唯一编码
 */
export function getCouponDetailByCode(couponCode: string) {
  return request({
    url: `coupon/${couponCode}`,
    method: "get"
  });
}

/**
 * 校验优惠券是否可用并计算折后金额 /coupon/validate
 * @param data 校验请求参数
 */
export function validateCoupon(data: ValidateCouponRequest) {
  return request({
    url: "coupon/validate",
    method: "post",
    data: data
  });
}
