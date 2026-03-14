import { http } from "@/utils/http";
import type { ApiResult } from "@/utils/request/types";
import { baseUrlApi, request } from "@/utils/request";

/**
 * Prue Admin接口风格
 * 请求配置参见utils/http
 * 函数返回值是Promise
 */
export const hello1 = () => {
  return http.request<ApiResult>("get", baseUrlApi("/"));
};

/**
 * ISDP课程API风格
 * 从utils中导入request 方法
 * params / data
 */
export function hello() {
  return request({
    url: "/",
    method: "get"
  });
}
