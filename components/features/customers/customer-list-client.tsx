"use client"

import { useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"

import { useCustomers } from "@/hooks/use-customers"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function CustomerListClient() {
  const [search, setSearch] = useState("")

  // Custom hook usage
  const {
    data: customers,
    isLoading,
    isError,
    refetch,
  } = useCustomers({
    search: search.length >= 3 ? search : undefined,
  })

  return (
    <div className="flex w-full flex-col gap-6 px-6 lg:pr-6 lg:pl-0">
      <div className="flex flex-col items-start justify-between gap-4 pt-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[32px] font-medium text-neutral-800">
            Customers
          </h1>
          <p className="text-lg text-neutral-400">
            Manage your retail and B2B customers
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative w-full max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 text-center">
          <p className="mb-2 font-medium text-destructive">
            Failed to load customers
          </p>
          <p className="mb-4 text-sm text-destructive/80">
            Please check your connection or try again later.
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !isError && (
        <div className="rounded-xl border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead>Member Since</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-37.5" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-50" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-30" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-4 w-10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-25" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-8 w-20" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && customers?.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-white text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
            <Search className="h-6 w-6 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900">
            No customers found
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            {search
              ? `No customer matches "${search}"`
              : "You don't have any customers yet."}
          </p>
        </div>
      )}

      {/* Data Table */}
      {!isLoading && !isError && customers && customers.length > 0 && (
        <div className="rounded-xl border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead>Member Since</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">
                    {customer.firstName} {customer.lastName}
                  </TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone || "-"}</TableCell>
                  <TableCell className="text-right">
                    {customer.ordersCount}
                  </TableCell>
                  <TableCell>
                    {new Date(customer.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/customers/${customer.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
