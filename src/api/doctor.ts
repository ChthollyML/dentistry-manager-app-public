import { get, post, put, del, patch } from "../utils/request";

// 获取医生列表
export const getDoctorList = (params?: any) =>
  get("/doctor", { query: params });

// 添加医生
export const addDoctor = (data: any) => post("/doctor", data);

// 更新医生信息
export const updateDoctor = (data: any) => patch(`/doctor`, data);

// 删除医生
export const deleteDoctor = (id: string) => del(`/doctor`, { query: { id } });

// 获取医生详情
export const getDoctorDetail = (id: string) => get(`/doctor/${id}`);
