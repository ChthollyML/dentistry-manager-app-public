import { get, post, put, del } from "../utils/request";

// 获取医生列表
export const getDoctorList = (params?: any) =>
  get("/doctor", { query: params });

// 添加医生
export const addDoctor = (data: any) => post("/doctor", data);

// 更新医生信息
export const updateDoctor = (id: string, data: any) =>
  put(`/doctor/${id}`, data);

// 删除医生
export const deleteDoctor = (id: string) => del(`/doctor/${id}`);

// 获取医生详情
export const getDoctorDetail = (id: string) => get(`/doctor/${id}`);
