import { http } from "@/utils/http";
import { baseUrlApi } from "@/utils/request";

export type RouteItem = {
  id: number;
  parentId: number;
  path: string;
  name: string;
  component: string;
  redirect: string;
  title: string;
  icon: string;
  hidden: number;
  sort: number;
  status: number;
  createTime: string;
  updateTime: string;
};

export type PermissionRoutesResult = {
  code: number;
  message: string;
  data: Array<RouteItem>;
};

export const getAsyncRoutes = () => {
  return http.request<PermissionRoutesResult>(
    "get",
    baseUrlApi("/route/getPermissionRoutes")
  );
};
