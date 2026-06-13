import { http } from "@/utils/http";
import { request } from "@/utils/request";
type Result = {
  success: boolean;
  data?: Array<any>;
};

type ResultTable = {
  success: boolean;
  data?: {
    /** 列表数据 */
    list: Array<any>;
    /** 总条目数 */
    total?: number;
    /** 每页显示条目个数 */
    pageSize?: number;
    /** 当前页数 */
    currentPage?: number;
  };
};

/** 获取系统管理-用户管理列表 */
export function getUserList(params: any) {
  return request({
    url: "/user/pageList",
    method: "get",
    params: params
  });
}
// 更新用户
export function updateUser(data: any) {
  return request({
    url: "/user/update",
    method: "post",
    data: data
  });
}
// 新增用户
export function addUser(data: any) {
  return request({
    url: "/user/register",
    method: "post",
    data: data
  });
}
/** 系统管理-用户管理-获取所有角色列表 */
export function getAllRoleList() {
  return request({
    url: "/role/listAll",
    method: "get"
  });
}

// 删除用户
export function deleteUser(ids: number[]) {
  return request({
    url: "user/deleteByIds",
    method: "delete",
    params: { ids: ids }
  });
}

/** 系统管理-用户管理-根据userId，获取对应角色id列表（userId：用户id） */
export const getRoleIds = (data?: object) => {
  return http.request<Result>("post", "/list-role-ids", { data });
};

/** 获取系统管理-角色管理列表 */
export function getRoleList(params: any) {
  return request({
    url: "/role/listRole",
    method: "get",
    params: params
  });
}

// 新增角色
export function addRole(data: any) {
  return request({
    url: "/role/add",
    method: "post",
    data: data
  });
}

//更新角色
export function updateRole(data: any) {
  return request({
    url: "/role/update",
    method: "put",
    data: data
  });
}
//删除角色
export function deleteRole(id: number) {
  return request({
    url: "/role/" + id,
    method: "delete"
  });
}
/** 获取系统管理-菜单管理列表 */
export function getMenuList() {
  return request({
    url: "/route/getRouteTree",
    method: "get"
  });
}

// 更新角色菜单
export function updateRoleMenus(data: any) {
  return request({
    url: "/route/assignRoutesToRole",
    method: "post",
    data: data
  });
}

// 更新角色权限
export function updateRolePermissions(data: any) {
  return request({
    url: "/permission/assignPermissionsToRole",
    method: "post",
    data: data
  });
}

//全部权限列表
export function getAllPermissionList() {
  return request({
    url: "/permission/listAll",
    method: "get"
  });
}
/** 获取系统管理-部门管理列表 */
export const getDeptList = (data?: object) => {
  return http.request<Result>("post", "/dept", { data });
};

/** 获取系统监控-在线用户列表 */
export const getOnlineLogsList = (data?: object) => {
  return http.request<ResultTable>("post", "/online-logs", { data });
};

/** 获取系统监控-登录日志列表 */
export const getLoginLogsList = (data?: object) => {
  return http.request<ResultTable>("post", "/login-logs", { data });
};

/** 获取系统监控-操作日志列表 */
export const getOperationLogsList = (data?: object) => {
  return http.request<ResultTable>("post", "/operation-logs", { data });
};

/** 获取系统监控-系统日志列表 */
export const getSystemLogsList = (data?: object) => {
  return http.request<ResultTable>("post", "/system-logs", { data });
};

/** 获取系统监控-系统日志-根据 id 查日志详情 */
export const getSystemLogsDetail = (data?: object) => {
  return http.request<Result>("post", "/system-logs-detail", { data });
};

/** 获取角色管理-权限-菜单权限 */
export const getRoleMenu = (data?: object) => {
  return http.request<Result>("post", "/role-menu", { data });
};

/** 获取角色管理-权限-菜单权限-根据角色 id 查对应菜单 */
export const getRoleMenuIds = (data?: object) => {
  return http.request<Result>("post", "/role-menu-ids", { data });
};
