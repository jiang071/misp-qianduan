import { http } from "@/utils/http";
import { baseUrlApi } from "@/utils/request";

export type LoginResult = {
  code: number;
  message: string;
  data: {
    /** 用户id */
    id: number;
    /** 用户ID */
    userId: string;
    /** 手机号 */
    phone: string;
    /** 昵称 */
    nickname: string;
    /** 状态 */
    status: number;
    /** 角色id列表 */
    roleIdList: Array<number>;
    /** 角色编码列表 */
    roleCodeList: Array<string>;
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间戳 */
    expires: number;
  };
};

export type RefreshTokenResult = {
  code: number;
  message: string;
  data: {
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间戳 */
    expires: number;
  };
};

/** 登录 */
export const getLogin = (data?: object) => {
  return http.request<LoginResult>("post", baseUrlApi("/user/login"), { data });
};

/** 刷新`token` */
export const refreshTokenApi = (data?: object) => {
  return http.request<RefreshTokenResult>(
    "post",
    baseUrlApi("/user/refreshToken"),
    {
      data
    }
  );
};

// 兼容旧代码
export type UserResult = LoginResult;

export interface LoginForm {
  userId: string;
  password: string;
}
