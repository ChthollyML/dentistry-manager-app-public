import { get, post, put, del, patch } from "../utils/request";

// 获取诊所列表
export const getClinicList = (params?: any) =>
  get("/clinic", { query: params });

// 获取单个诊所信息
export const getClinicInfo = (id: string) => get(`/clinic/${id}`);

// 添加诊所
export const addClinic = (data: any) => post("/clinic", data);

// 更新诊所信息
export const updateClinic = (id: string, data: any) =>
  put(`/clinic/${id}`, data);

// 删除诊所
export const deleteClinic = (id: string) => del(`/clinic/${id}`);

// 注销诊所
export const deactivateClinic = (id: string) =>
  post(`/clinic/${id}/deactivate`);

// 禁用诊所
export const forbidClinic = (id: string) => post(`/clinic/${id}/forbid`);

// 获取诊所审核记录
export const getClinicAuditLogs = (params?: any) =>
  get("/audit", { query: params });

// 审核诊所
export const auditClinic = (data: any) => post(`/audit/admin`, data);

// 提交诊所申请
export const submitClinicApplication = (data: any) =>
  post("/audit/clinicAdmin", data);

// 更新诊所申请
export const updateClinicApplication = (data: any) =>
  patch(`/clinic/update`, data);

// 获取诊所的申请记录
export const getMyClinicApplications = (clinic_id: number) =>
  get(`/audit/${clinic_id}`);

// 撤销记录
export const withdrawApplication = (log_id: number) => del(`/audit/${log_id}`);
