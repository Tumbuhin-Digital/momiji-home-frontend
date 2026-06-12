"use client"

import { useState } from "react"
import { Check, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  useAcceptOrder,
  useCancelOrder,
  useUpdateItemStep,
} from "@/hooks/use-orders"

import type { Order } from "@/types/orders"

interface OrderFulfillmentPanelProps {
  order: Order
  type: "ship-ready" | "pre-order"
}

export function OrderFulfillmentPanel({
  order,
  type,
}: OrderFulfillmentPanelProps) {
  const acceptOrder = useAcceptOrder()
  const cancelOrder = useCancelOrder()
  const updateStep = useUpdateItemStep()

  const [trackingNumber, setTrackingNumber] = useState(
    order.fulfillment?.trackingNumber || ""
  )
  const [carrier, setCarrier] = useState(order.fulfillment?.carrier || "FedEx")
  const [isEditingTracking, setIsEditingTracking] = useState(
    !order.fulfillment?.trackingNumber
  )

  const items = order.lineItems.filter(
    (item) => item.type === type || (!item.type && order.type === type)
  )

  if (items.length === 0) return null

  const isPreOrder = type === "pre-order"

  const handleAccept = () => {
    acceptOrder.mutate({ orderId: order.id, fulfillmentType: type })
  }

  const handleCancel = () => {
    cancelOrder.mutate({
      orderId: order.id,
      reason: "Cancelled by admin",
      fulfillmentType: type,
    })
  }

  const handleReadyToShip = () => {
    // Usually Stock Ready is step 2
    if (items.length > 0) {
      updateStep.mutate({
        orderId: order.id,
        itemId: items[0].productId,
        body: { fulfillment_step: 2 },
      })
    }
  }

  const handleSaveTracking = () => {
    // In real app, call API to save tracking
    setIsEditingTracking(false)
    // also update step to shipped (3)
    if (items.length > 0) {
      updateStep.mutate({
        orderId: order.id,
        itemId: items[0].productId,
        body: { fulfillment_step: 3 },
      })
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount)
  }

  // Get current max step from items
  const currentStep = items.reduce(
    (max, item) => Math.max(max, item.fulfillmentStep || 1),
    1
  )

  return (
    <div className="overflow-hidden rounded-xl border border-[#D9E2E8] bg-[#F4F7F9]/30">
      <div className="flex items-center justify-between border-b border-[#D9E2E8] bg-[#EBF0F3] px-6 py-3">
        <h3 className="text-lg font-bold text-slate-700">
          {type === "ship-ready" ? "Ship Ready" : "Pre-Order"}
        </h3>
        <div className="flex gap-2">
          {type === "pre-order" && currentStep === 1 && (
            <Button
              variant="default"
              size="sm"
              className="border border-[#A2D2FF] bg-[#D3E5FF] text-[#0052CC] hover:bg-[#BDE0FE]"
              onClick={handleReadyToShip}
              disabled={updateStep.isPending}
            >
              Ready to Ship
            </Button>
          )}
          {currentStep === 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="border-[#A2D2FF] bg-[#D3E5FF] text-[#0052CC] hover:bg-[#BDE0FE]"
                onClick={handleAccept}
                disabled={acceptOrder.isPending}
              >
                Accept Order
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-[#FFB3B3] bg-[#FFD6D6] text-[#D8000C] hover:bg-[#FFC2C2]"
                onClick={handleCancel}
                disabled={cancelOrder.isPending}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="p-6">
        <h4 className="mb-4 text-sm font-bold">Total Item</h4>
        <div className="mb-8 space-y-4">
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-slate-100">
                {/* Product Image placeholder */}
                <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                  Img
                </div>
              </div>
              <div>
                <p className="font-medium text-slate-800">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {item.quantity} pcs -{" "}
                  {formatCurrency(
                    item.unitPrice * item.quantity,
                    item.currency
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Stepper */}
        <div className="relative mb-6">
          <div className="absolute top-4 right-4 left-4 h-px border-t border-dashed border-slate-400 bg-slate-300"></div>
          <div className="relative z-10 flex justify-between">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${currentStep >= 1 ? "bg-[#7EA4B3] text-white" : "border border-slate-300 bg-white text-slate-400"}`}
              >
                1
              </div>
              <span className="mt-2 text-[10px] font-medium text-[#7EA4B3]">
                Order Placed
              </span>
            </div>

            {isPreOrder && (
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${currentStep >= 2 ? "bg-[#7EA4B3] text-white" : "border border-slate-300 bg-white text-slate-400"}`}
                >
                  2
                </div>
                <span
                  className={`mt-2 text-[10px] font-medium ${currentStep >= 2 ? "text-[#7EA4B3]" : "text-slate-400"}`}
                >
                  Stock Ready
                </span>
              </div>
            )}

            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${currentStep >= 3 ? "bg-[#7EA4B3] text-white" : "border border-slate-300 bg-white text-slate-400"}`}
              >
                3
              </div>
              <span
                className={`mt-2 text-[10px] font-medium ${currentStep >= 3 ? "text-[#7EA4B3]" : "text-slate-400"}`}
              >
                Shipped
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${currentStep >= 4 ? "bg-[#7EA4B3] text-white" : "border border-slate-300 bg-white text-slate-400"}`}
              >
                4
              </div>
              <span
                className={`mt-2 text-[10px] font-medium ${currentStep >= 4 ? "text-[#7EA4B3]" : "text-slate-400"}`}
              >
                Delivered
              </span>
            </div>
          </div>
        </div>

        {/* Airway Bill Section */}
        {currentStep >= 2 && (
          <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-lg border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <div className="rounded bg-slate-50 p-2 text-[#7EA4B3]">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h5 className="text-sm font-bold">Airway Bill</h5>
                {isEditingTracking ? (
                  <div className="mt-2 flex items-center gap-2">
                    <Input
                      placeholder="Carrier (e.g. FedEx)"
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      className="h-8 w-24 text-xs"
                    />
                    <Input
                      placeholder="Tracking number"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="h-8 w-40 text-xs"
                    />
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-slate-800">
                      {carrier}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Tracking number: {trackingNumber || "-"}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div>
              {isEditingTracking ? (
                <Button size="sm" onClick={handleSaveTracking} className="h-8">
                  <Check className="mr-1 h-4 w-4" /> Save & Ship
                </Button>
              ) : (
                <div className="text-right">
                  <p className="text-[10px] tracking-wide text-slate-400 uppercase">
                    Last Updated
                  </p>
                  <p className="mt-1 text-xs text-slate-700">
                    Package departed from facility
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
