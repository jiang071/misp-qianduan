import { http } from "@/utils/http";
import type { AjaxRequest, ApiResult } from "./types";
import type { AxiosRequestConfig } from "axios";
export const baseUrlApi = (url: string) => `/api${url}`;

/** 适配NextGenPos风格请求工具类 */
class HttpRequest {
  public axios(ajaxRequest: AjaxRequest): Promise<ApiResult> {
    const axiosRequestConfig: AxiosRequestConfig = {
      params: ajaxRequest.params,
      data: ajaxRequest.data
    };
    return http.request<ApiResult>(
      ajaxRequest.method,
      baseUrlApi(ajaxRequest.url),
      axiosRequestConfig,
      ajaxRequest.config
    );
  }
}
export const request = new HttpRequest().axios;
