"use client"

import Link from "next/link"
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  MapPin,
} from "lucide-react"

import { useCustomerById, useCustomerOrders } from "@/hooks/use-customers"
import { formatCurrency } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function CustomerDetailClient({ customerId }: { customerId: string }) {
  const {
    data: customer,
    isLoading: isCustomerLoading,
    isError: isCustomerError,
    refetch: refetchCustomer,
  } = useCustomerById(customerId)

  const {
    data: orders,
    isLoading: isOrdersLoading,
    isError: isOrdersError,
    refetch: refetchOrders,
  } = useCustomerOrders(customerId)

  const renderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
      case "unpaid":
        return (
          <Badge
            variant="outline"
            className="border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-50"
          >
            {status}
          </Badge>
        )
      case "paid":
      case "completed":
      case "ship_ready":
        return (
          <Badge
            variant="outline"
            className="border-green-200 bg-green-50 text-green-700 hover:bg-green-50"
          >
            {status}
          </Badge>
        )
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="border-red-200 bg-red-50 text-red-700 hover:bg-red-50"
          >
            {status}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="flex w-full flex-col gap-6 px-6 pb-12 lg:pr-6 lg:pl-0">
      {/* Header & Back Button */}
      <div className="flex flex-col gap-4 pt-6">
        <div>
          <Link href="/customers">
            <Button
              variant="ghost"
              size="sm"
              className="mb-2 -ml-3 gap-1 text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Customers
            </Button>
          </Link>
        </div>
        <h1 className="text-[32px] font-medium text-neutral-800">
          Customer Detail
        </h1>
      </div>

      {/* Customer Info Section */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="col-span-2 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-neutral-800">
            Profile Information
          </h2>
          {isCustomerError ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="mb-2 text-sm text-destructive">
                Failed to load profile
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchCustomer()}
              >
                Retry
              </Button>
            </div>
          ) : isCustomerLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-50" />
              <Skeleton className="h-4 w-62.5" />
              <Skeleton className="h-4 w-37.5" />
            </div>
          ) : customer ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-neutral-500">
                  Full Name
                </p>
                <p className="text-base font-semibold text-neutral-900">
                  {customer.firstName} {customer.lastName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-500">
                    Email Address
                  </p>
                  <p className="text-base text-neutral-900">{customer.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-500">
                    Phone Number
                  </p>
                  <p className="text-base text-neutral-900">
                    {customer.phone || "-"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-500">
                    Member Since
                  </p>
                  <p className="text-base text-neutral-900">
                    {new Date(customer.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-neutral-800">
            Account Summary
          </h2>
          {isCustomerError ? (
            <div className="text-center text-sm text-destructive">
              Error loading summary
            </div>
          ) : isCustomerLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : customer ? (
            <div className="flex items-center gap-4 rounded-lg bg-primary/5 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary">Total Orders</p>
                <p className="text-2xl font-bold text-primary">
                  {customer.ordersCount}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Addresses Section */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-neutral-800">
          Saved Addresses
        </h2>
        {isCustomerError ? (
          <div className="text-center text-sm text-destructive">
            Failed to load addresses
          </div>
        ) : isCustomerLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : customer?.addresses && customer.addresses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {customer.addresses.map((addr) => (
              <div
                key={addr.id}
                className={`relative rounded-lg border p-4 ${addr.isDefault ? "border-primary/50 bg-primary/5" : "bg-neutral-50/50"}`}
              >
                {addr.isDefault && (
                  <Badge className="absolute top-3 right-3 bg-primary text-xs font-normal hover:bg-primary">
                    Default
                  </Badge>
                )}
                <div className="mb-2 flex items-center gap-2 font-medium text-neutral-900">
                  <MapPin className="h-4 w-4 text-neutral-500" />
                  <span>
                    {addr.firstName} {addr.lastName}
                  </span>
                </div>
                <div className="text-sm text-neutral-600">
                  <p>{addr.address1}</p>
                  {addr.address2 && <p>{addr.address2}</p>}
                  <p>
                    {addr.city}, {addr.province} {addr.zip}
                  </p>
                  <p>{addr.country}</p>
                  {addr.phone && (
                    <p className="mt-1 flex items-center gap-1 text-neutral-500">
                      <Phone className="h-3 w-3" /> {addr.phone}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center text-neutral-500">
            No saved addresses found for this customer.
          </div>
        )}
      </div>

      {/* Order History Section */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-800">
            Order History
          </h2>
        </div>

        {isOrdersError ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 py-8 text-center">
            <p className="mb-2 text-sm text-destructive">
              Failed to load order history
            </p>
            <Button variant="outline" size="sm" onClick={() => refetchOrders()}>
              Retry
            </Button>
          </div>
        ) : isOrdersLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      #{order.id.slice(-6).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      {renderStatusBadge(order.aggregateStatus)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(order.totalPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/order-management/${order.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:bg-primary/10 hover:text-primary"
                        >
                          Details
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center text-neutral-500">
            This customer hasn&apos;t placed any orders yet.
          </div>
        )}
      </div>
    </div>
  )
}
