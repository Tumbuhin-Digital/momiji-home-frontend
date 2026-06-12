import { apiClient } from "@/lib/api"

import type { AuthUser } from "@/lib/stores/auth.store"

import type { BaseResponse } from "@/types/core"

export interface LoginInput {
  email: string
  password: string
}

export interface AuthUserResponse {
  email: string
  id: string
  role: string
  shopify_customer_id: string
}

export interface AuthTokens {
  user: AuthUserResponse
}

async function login(input: LoginInput): Promise<AuthUser> {
  const response = await apiClient.post<BaseResponse<AuthTokens>>(
    "/auth/login",
    input
  )
  if (!response.data || !response.data.user) {
    throw new Error("Backend returned empty data")
  }

  return {
    id: response.data.user.id,
    email: response.data.user.email,
    name: response.data.user.email,
    role: response.data.user.role,
    shopify_customer_id: response.data.user.shopify_customer_id,
  }
}

async function logout(): Promise<void> {
  await apiClient.post("/auth/logout")
}

async function me(): Promise<AuthUser> {
  const response =
    await apiClient.get<BaseResponse<AuthUserResponse>>("/auth/me")
  if (!response.data) {
    throw new Error("Backend returned empty data")
  }
  return {
    id: response.data.id,
    email: response.data.email,
    name: response.data.email,
    role: response.data.role,
    shopify_customer_id: response.data.shopify_customer_id,
  }
}

export const authService = {
  login,
  logout,
  me,
}
