import { apiAxios } from "./axios"

import type { AxiosRequestConfig } from "axios"

async function get<TResponse>(
  url: string,
  config?: AxiosRequestConfig
): Promise<TResponse> {
  const response = await apiAxios.get<TResponse>(url, config)
  return response.data
}

async function post<TResponse, TBody = unknown>(
  url: string,
  body?: TBody,
  config?: AxiosRequestConfig
): Promise<TResponse> {
  const response = await apiAxios.post<TResponse>(url, body, config)
  return response.data
}

async function put<TResponse, TBody = unknown>(
  url: string,
  body?: TBody,
  config?: AxiosRequestConfig
): Promise<TResponse> {
  const response = await apiAxios.put<TResponse>(url, body, config)
  return response.data
}

async function patch<TResponse, TBody = unknown>(
  url: string,
  body?: TBody,
  config?: AxiosRequestConfig
): Promise<TResponse> {
  const response = await apiAxios.patch<TResponse>(url, body, config)
  return response.data
}

async function del<TResponse>(
  url: string,
  config?: AxiosRequestConfig
): Promise<TResponse> {
  const response = await apiAxios.delete<TResponse>(url, config)
  return response.data
}

const apiClient = {
  get,
  post,
  put,
  patch,
  del,
}

export { apiClient }
