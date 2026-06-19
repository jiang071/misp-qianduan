import { defineStore } from "pinia";
import {
  type userType,
  store,
  router,
  resetRouter,
  routerArrays,
  storageLocal
} from "../utils";
import {
  type UserResult,
  type RefreshTokenResult,
  getLogin,
  refreshTokenApi
} from "@/api/user";
import { useMultiTagsStoreHook } from "./multiTags";
import { type DataInfo, setToken, removeToken, userKey } from "@/utils/auth";

export const useUserStore = defineStore({
  id: "pure-user",
  state: (): userType => ({
    // 用户数字id
    id: storageLocal().getItem<DataInfo<number>>(userKey)?.id ?? 0,
    // 用户id
    userId: storageLocal().getItem<DataInfo<number>>(userKey)?.userId ?? "",
    // 头像
    avatar: storageLocal().getItem<DataInfo<number>>(userKey)?.avatar ?? "",
    // 用户名
    username: storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? "",
    // 昵称
    nickname: storageLocal().getItem<DataInfo<number>>(userKey)?.nickname ?? "",
    // 手机号
    phone: storageLocal().getItem<DataInfo<number>>(userKey)?.phone ?? "",
    // 状态
    status: storageLocal().getItem<DataInfo<number>>(userKey)?.status ?? 0,
    // 角色id列表
    roleIdList:
      storageLocal().getItem<DataInfo<number>>(userKey)?.roleIdList ?? [],
    // 角色编码列表
    roleCodeList:
      storageLocal().getItem<DataInfo<number>>(userKey)?.roleCodeList ?? [],
    // 页面级别权限
    roles: storageLocal().getItem<DataInfo<number>>(userKey)?.roles ?? [],
    // 按钮级别权限
    permissions:
      storageLocal().getItem<DataInfo<number>>(userKey)?.permissions ?? [],
    // 是否勾选了登录页的免登录
    isRemembered: false,
    // 登录页的免登录存储几天，默认7天
    loginDay: 7
  }),
  actions: {
    /** 存储用户id */
    SET_ID(id: number) {
      this.id = id;
    },
    /** 存储用户账号 */
    SET_USERID(userId: string) {
      this.userId = userId;
    },
    /** 存储头像 */
    SET_AVATAR(avatar: string) {
      this.avatar = avatar;
    },
    /** 存储用户名 */
    SET_USERNAME(username: string) {
      this.username = username;
    },
    /** 存储昵称 */
    SET_NICKNAME(nickname: string) {
      this.nickname = nickname;
    },
    /** 存储手机号 */
    SET_PHONE(phone: string) {
      this.phone = phone;
    },
    /** 存储状态 */
    SET_STATUS(status: number) {
      this.status = status;
    },
    /** 存储角色id列表 */
    SET_ROLEIDLIST(roleIdList: Array<number>) {
      this.roleIdList = roleIdList;
    },
    /** 存储角色编码列表 */
    SET_ROLECODELIST(roleCodeList: Array<string>) {
      this.roleCodeList = roleCodeList;
    },
    /** 存储角色 */
    SET_ROLES(roles: Array<string>) {
      this.roles = roles;
    },
    /** 存储按钮级别权限 */
    SET_PERMS(permissions: Array<string>) {
      this.permissions = permissions;
    },
    /** 存储是否勾选了登录页的免登录 */
    SET_ISREMEMBERED(bool: boolean) {
      this.isRemembered = bool;
    },
    /** 设置登录页的免登录存储几天 */
    SET_LOGINDAY(value: number) {
      this.loginDay = Number(value);
    },
    /** 登入 */
    async loginByUsername(data) {
      return new Promise<UserResult>((resolve, reject) => {
        getLogin(data)
          .then(res => {
            // 后端返回 code: 200 表示成功
            if (res.code === 200) {
              // 适配后端数据结构，将 data 转换为 setToken 需要的格式
              setToken({
                accessToken: res.data.accessToken,
                refreshToken: res.data.refreshToken,
                expires: res.data.expires as any,
                id: res.data.id,
                userId: res.data.userId,
                phone: res.data.phone,
                nickname: res.data.nickname,
                status: res.data.status,
                roleIdList: res.data.roleIdList,
                roleCodeList: res.data.roleCodeList
              });
            }
            resolve(res);
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    /** 前端登出（不调用接口） */
    logOut() {
      this.username = "";
      this.roles = [];
      this.permissions = [];
      removeToken();
      useMultiTagsStoreHook().handleTags("equal", [...routerArrays]);
      resetRouter();
      router.push("/login");
    },
    /** 刷新`token` */
    async handRefreshToken(data) {
      return new Promise<RefreshTokenResult>((resolve, reject) => {
        refreshTokenApi(data)
          .then(res => {
            if (res && res.code === 200) {
              setToken({
                accessToken: res.data.accessToken,
                refreshToken: res.data.refreshToken,
                expires: res.data.expires as any
              });
              resolve(res);
            } else if (res && res.code === 600) {
              // refreshToken 已过期或非法，跳转到登录页
              this.logOut();
              reject(res);
            } else {
              // 其他错误也跳转到登录页
              this.logOut();
              reject(res);
            }
          })
          .catch(error => {
            // 接口报错，跳转到登录页
            this.logOut();
            reject(error);
          });
      });
    }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}
