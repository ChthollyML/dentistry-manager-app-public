import { post } from "../utils/request";

export const uploadImg = (file: FormData) => post(`/upload/file`, file);
