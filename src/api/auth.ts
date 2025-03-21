import { post } from "../utils/request";

type LoginData = {
  username: string;
  password: string;
};

export enum Role {
  ADMIN = "admin",
  CLINIC_MANAGER = "clinic_manager",
  DOCTOR = "doctor",
}
export enum AccountStatus {
  ACTIVE = "active",
  DISABLED = "disabled",
}

type RegisterData = {
  username: string;
  password: string;
  email: string;
  phone: string;
  role: Role;
  status: AccountStatus;
};

/**
 * 管理后台登录接口
 * @param data
 * @returns
 */
export const loginAPI = async (data: LoginData) => {
  try {
    console.log(data);
    const response = await post("/login", data);
    return response; // 返回后端响应数据
  } catch (error) {
    return { code: -1, error: error }; // 其他错误
  }
};

/**
 * 管理后台注册接口
 * @param data
 * @returns
 */
export const registerAPI = async (data: RegisterData) => {
  try {
    const response = await post("/login/register", data);
    return response; // 返回后端响应数据
  } catch (error) {
    return { code: -1, error: error }; // 其他错误
  }
};
