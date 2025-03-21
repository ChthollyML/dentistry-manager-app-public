import axios, { AxiosRequestConfig } from "axios";
// @ts-ignore
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { getToken, serverUrl } from "./tools";

// 定义自定义配置
interface CustomConfig {
  showProgress?: boolean; // 是否显示进度条
}

// 定义请求参数接口
interface RequestOptions {
  body?: any; // 请求体参数 (application/json)
  query?: any; // URL 查询参数 (?key=value)
  params?: any; // URL 路径参数 (/api/:id)
  config?: AxiosRequestConfig & CustomConfig; // axios配置与自定义配置
}

// 创建axios实例
const instance = axios.create({
  baseURL: serverUrl, // 请求的基础地址
  timeout: 5000,
  withCredentials: true,
});

// 添加请求拦截器
instance.interceptors.request.use(
  function (config) {
    // 添加token到请求头
    // @ts-ignore
    config.headers.token = getToken();

    // 显示加载进度
    // @ts-ignore
    if (config.customConfig?.showProgress !== false) {
      NProgress.start();
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// 添加响应拦截器
instance.interceptors.response.use(
  function (response) {
    // 关闭加载进度
    NProgress.done();
    return response;
  },
  function (error) {
    // 关闭加载进度
    NProgress.done();
    return Promise.reject(error);
  }
);

/**
 * 处理URL中的路径参数
 * 例如：/api/users/:id 会被替换为 /api/users/123
 * @param url URL模板
 * @param params 路径参数对象
 * @returns 替换后的URL
 */
const processUrlParams = (url: string, params?: any): string => {
  if (!params) return url;

  let processedUrl = url;
  Object.keys(params).forEach((key) => {
    processedUrl = processedUrl.replace(
      `:${key}`,
      encodeURIComponent(params[key])
    );
  });

  return processedUrl;
};

/**
 * 通用请求方法
 * @param method 请求方法
 * @param url 请求地址
 * @param options 请求选项
 * @returns Promise
 */
const request = async (
  method: string,
  url: string,
  options: RequestOptions = {}
) => {
  const { body, query, params, config = {} } = options;
  const { showProgress = true, ...axiosConfig } = config as CustomConfig &
    AxiosRequestConfig;

  // 处理URL路径参数
  const processedUrl = processUrlParams(url, params);

  try {
    const response = await instance.request({
      method,
      url: processedUrl,
      params: query, // 查询参数
      data: body, // 请求体
      ...axiosConfig,
      // @ts-ignore
      customConfig: { showProgress },
    });

    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

/**
 * GET请求
 * @param url 地址
 * @param options 选项，包含 query(查询参数) 和 params(路径参数)
 * @returns Promise
 */
export const get = (url: string, options: RequestOptions = {}) =>
  request("get", url, options);

/**
 * POST请求
 * @param url 地址
 * @param body 请求体数据
 * @param options 其他选项
 * @returns Promise
 */
export const post = (url: string, body?: any, options: RequestOptions = {}) =>
  request("post", url, { ...options, body });

/**
 * PUT请求
 * @param url 地址
 * @param body 请求体数据
 * @param options 其他选项
 * @returns Promise
 */
export const put = (url: string, body?: any, options: RequestOptions = {}) =>
  request("put", url, { ...options, body });

/**
 * PATCH请求
 * @param url 地址
 * @param body 请求体数据
 * @param options 其他选项
 * @returns Promise
 */
export const patch = (url: string, body?: any, options: RequestOptions = {}) =>
  request("patch", url, { ...options, body });

/**
 * DELETE请求
 * @param url 地址
 * @param options 选项
 * @returns Promise
 */
export const del = (url: string, options: RequestOptions = {}) =>
  request("delete", url, options);

// 导出默认请求函数，支持自定义方法
export default request;
