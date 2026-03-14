import type { RequestMethods, PureHttpRequestConfig } from "@/utils/http/types";

export type ApiResult = {
  code: number;
  msg: string;
  data?: any;
};

export type AjaxRequest = {
  method: RequestMethods;
  url: string;
  params?: any;
  data?: any;
  config?: PureHttpRequestConfig;
};
