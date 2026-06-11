import { http } from "@/utils/http";
import type { AjaxRequest, ApiResult } from "./types";
import type { AxiosRequestConfig } from "axios";
export const baseUrlApi = (url: string) => `/api/${url}`;

/** 适配NextGenPos风格请求工具类 */
class HttpRequest {
  public axios(ajaxRequest: AjaxRequest): Promise<ApiResult> {
    const axiosRequestConfig: AxiosRequestConfig = {
      params: ajaxRequest.params,
      data: ajaxRequest.data,

      // 👇 直接用 Axios 内置配置，一行搞定
      paramsSerializer: {
        indexes: null // 数组 → ids=1&ids=2
      }
    };

    // 合并外部 config（外部优先级更高）
    const finalConfig = { ...axiosRequestConfig, ...ajaxRequest.config };

    return http.request<ApiResult>(
      ajaxRequest.method,
      baseUrlApi(ajaxRequest.url),
      finalConfig
    );
  }
}

export const request = new HttpRequest().axios;
