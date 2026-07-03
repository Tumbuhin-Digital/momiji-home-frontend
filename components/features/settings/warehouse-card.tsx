"use client"

import { useEffect, useState } from "react"

import { toastManager } from "@/components/ui/toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { US_STATES_LIST } from "@/constants/states"
import { useUpdateWarehouse } from "@/hooks/use-settings"

import type { UpdateWarehouseInput, Warehouse } from "@/types/settings"

type WarehouseCardProps = {
  warehouse: Warehouse
}

function toFormState(warehouse: Warehouse): UpdateWarehouseInput {
  return {
    name: warehouse.name,
    phone: warehouse.phone,
    address1: warehouse.address1,
    city: warehouse.city,
    state: warehouse.state,
    zip: warehouse.zip,
    country: warehouse.country || "US",
    shipstationWarehouseId: warehouse.shipstationWarehouseId ?? "",
    groundServiceCode: warehouse.groundServiceCode ?? "",
  }
}

function validateForm(values: UpdateWarehouseInput): string | null {
  if (!values.name.trim()) return "Name is required"
  if (!values.address1.trim()) return "Street address is required"
  if (!values.city.trim()) return "City is required"
  if (!values.state.trim()) return "State is required"
  if (!values.zip.trim()) return "ZIP code is required"
  if (values.zip.trim().length < 5) return "ZIP code must be at least 5 characters"
  return null
}

export function WarehouseCard({ warehouse }: WarehouseCardProps) {
  const updateMutation = useUpdateWarehouse(warehouse.code)
  const [form, setForm] = useState<UpdateWarehouseInput>(() =>
    toFormState(warehouse)
  )

  useEffect(() => {
    setForm(toFormState(warehouse))
  }, [warehouse])

  const title =
    warehouse.code === "east" ? "East Coast Warehouse" : "West Coast Warehouse"

  const handleSave = async () => {
    const error = validateForm(form)
    if (error) {
      toastManager.add({
        title: "Error",
        description: error,
        type: "error",
      })
      return
    }

    try {
      await updateMutation.mutateAsync({
        ...form,
        name: form.name.trim(),
        phone: form.phone.trim(),
        address1: form.address1.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        zip: form.zip.trim(),
        country: form.country.trim() || "US",
        shipstationWarehouseId: form.shipstationWarehouseId?.trim() || null,
        groundServiceCode: form.groundServiceCode?.trim() || null,
      })
      toastManager.add({
        title: "Saved",
        description: `${title} updated successfully`,
        type: "success",
      })
    } catch {
      toastManager.add({
        title: "Error",
        description: `Failed to update ${title}`,
        type: "error",
      })
    }
  }

  const setField = <K extends keyof UpdateWarehouseInput>(
    key: K,
    value: UpdateWarehouseInput[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Card className="max-w-3xl rounded-xl border-neutral-200 shadow-sm">
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-medium text-alternate">{title}</h2>
          {warehouse.isDefault && (
            <Badge variant="secondary">Default (ship-ready origin)</Badge>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor={`${warehouse.code}-name`}>Name</Label>
            <Input
              id={`${warehouse.code}-name`}
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              disabled={updateMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${warehouse.code}-phone`}>Phone</Label>
            <Input
              id={`${warehouse.code}-phone`}
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              disabled={updateMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${warehouse.code}-country`}>Country</Label>
            <Input
              id={`${warehouse.code}-country`}
              value={form.country}
              onChange={(e) => setField("country", e.target.value)}
              disabled={updateMutation.isPending}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor={`${warehouse.code}-address1`}>Street address</Label>
            <Input
              id={`${warehouse.code}-address1`}
              value={form.address1}
              onChange={(e) => setField("address1", e.target.value)}
              disabled={updateMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${warehouse.code}-city`}>City</Label>
            <Input
              id={`${warehouse.code}-city`}
              value={form.city}
              onChange={(e) => setField("city", e.target.value)}
              disabled={updateMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${warehouse.code}-state`}>State</Label>
            <Select
              value={form.state}
              onValueChange={(value) => {
                if (value) setField("state", value)
              }}
              disabled={updateMutation.isPending}
            >
              <SelectTrigger id={`${warehouse.code}-state`}>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES_LIST.map((state) => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${warehouse.code}-zip`}>ZIP code</Label>
            <Input
              id={`${warehouse.code}-zip`}
              value={form.zip}
              onChange={(e) => setField("zip", e.target.value)}
              disabled={updateMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${warehouse.code}-ss-wh`}>
              ShipStation warehouse ID
            </Label>
            <Input
              id={`${warehouse.code}-ss-wh`}
              value={form.shipstationWarehouseId ?? ""}
              onChange={(e) =>
                setField("shipstationWarehouseId", e.target.value)
              }
              disabled={updateMutation.isPending}
              placeholder="Optional"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${warehouse.code}-ground`}>
              Ground service code
            </Label>
            <Input
              id={`${warehouse.code}-ground`}
              value={form.groundServiceCode ?? ""}
              onChange={(e) => setField("groundServiceCode", e.target.value)}
              disabled={updateMutation.isPending}
              placeholder="e.g. ups_ground (optional)"
            />
          </div>
        </div>

        <Button
          type="button"
          onClick={handleSave}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <>
              <Spinner className="mr-2" />
              Saving...
            </>
          ) : (
            `Save ${title}`
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
