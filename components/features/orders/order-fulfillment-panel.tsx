import dynamic from "next/dynamic"
import { useState } from "react"

import { Check, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Input } from "@/components/ui/input"
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper"

import {
  useAcceptOrder,
  useCancelOrder,
  useUpdateItemReceived,
  useUpdateItemStep,
  useUpdateItemTracking,
} from "@/hooks/use-orders"

import type { Order } from "@/types/orders"
import type { OrderLineItem } from "@/types/orders/entities"

const UpdateReceivedModal = dynamic(
  () =>
    import("./update-received-modal").then((mod) => mod.UpdateReceivedModal),
  { ssr: false }
)
const UpdateStepModal = dynamic(
  () => import("./update-step-modal").then((mod) => mod.UpdateStepModal),
  { ssr: false }
)
const UpdateTrackingModal = dynamic(
  () =>
    import("./update-tracking-modal").then((mod) => mod.UpdateTrackingModal),
  { ssr: false }
)

const shipReadySteps = [
  { step: 1, title: "Order Placed" },
  { step: 3, title: "Shipped" },
  { step: 4, title: "Delivered" },
]

const preOrderSteps = [
  { step: 1, title: "Order Placed" },
  { step: 2, title: "Stock Ready" },
  { step: 3, title: "Shipped" },
  { step: 4, title: "Delivered" },
]

interface OrderFulfillmentPanelProps {
  order: Order
  type: "ship-ready" | "pre-order"
}

export function OrderFulfillmentPanel({
  order,
  type,
}: OrderFulfillmentPanelProps) {
  const [trackingNumber, setTrackingNumber] = useState(
    order.fulfillment?.trackingNumber || ""
  )
  const [carrier, setCarrier] = useState(order.fulfillment?.carrier || "FedEx")
  const [isEditingTracking, setIsEditingTracking] = useState(
    !order.fulfillment?.trackingNumber
  )

  const [selectedReceivedItem, setSelectedReceivedItem] =
    useState<OrderLineItem | null>(null)
  const [selectedStepItem, setSelectedStepItem] =
    useState<OrderLineItem | null>(null)
  const [selectedTrackingItem, setSelectedTrackingItem] =
    useState<OrderLineItem | null>(null)

  const acceptOrder = useAcceptOrder()
  const cancelOrder = useCancelOrder()
  const updateReceived = useUpdateItemReceived()
  const updateStep = useUpdateItemStep()
  const updateTracking = useUpdateItemTracking()

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
    if (items.length > 0) {
      updateStep.mutate({
        orderId: order.id,
        itemId: items[0].productId,
        body: { fulfillment_step: 2 },
      })
    }
  }

  const handleSaveTracking = () => {
    setIsEditingTracking(false)
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

  const currentStep = items.reduce(
    (max, item) => Math.max(max, item.fulfillmentStep || 1),
    1
  )

  const renderItemContent = (item: OrderLineItem) => (
    <div className="flex gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-slate-100">
        {/* Product Image placeholder */}
        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
          Img
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <p className="truncate font-medium text-slate-800" title={item.title}>
          {item.title}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {item.quantity} pcs -{" "}
          {formatCurrency(item.unitPrice * item.quantity, item.currency)}
        </p>
      </div>
    </div>
  )

  return (
    <div className="overflow-hidden rounded-xl border border-[#D9E2E8] bg-[#F4F7F9]/30">
      <div className="flex items-center justify-between border-b border-[#D9E2E8] bg-[#EBF0F3] px-6 py-3">
        <h3 className="text-lg font-bold text-slate-700">
          {type === "ship-ready" ? "Ship Ready" : "Pre-Order"}
        </h3>
        <div className="flex gap-2">
          {type === "pre-order" && currentStep === 2 && (
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
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-sm font-bold">Total Item ({items.length})</h4>
        </div>
        {items.length > 1 ? (
          <Carousel opts={{ align: "start" }} className="mb-8 w-full">
            <CarouselContent>
              {items.map((item, idx) => (
                <CarouselItem key={idx}>{renderItemContent(item)}</CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-4 size-8 bg-white/90 shadow-md backdrop-blur-sm hover:bg-white" />
            <CarouselNext className="-right-4 size-8 bg-white/90 shadow-md backdrop-blur-sm hover:bg-white" />
          </Carousel>
        ) : (
          <div className="mb-8 w-full">{renderItemContent(items[0])}</div>
        )}

        {/* Stepper */}
        <Stepper value={currentStep} className="mb-6">
          {(isPreOrder ? preOrderSteps : shipReadySteps).map(
            ({ step, title }, idx, arr) => (
              <StepperItem
                key={step}
                step={step}
                className="relative flex-1 flex-col!"
              >
                <StepperTrigger className="flex-col gap-3 rounded">
                  <StepperIndicator />
                  <div className="space-y-0.5 px-2">
                    <StepperTitle>{title}</StepperTitle>
                  </div>
                </StepperTrigger>
                {idx < arr.length - 1 && (
                  <StepperSeparator className="absolute inset-x-0 top-3 left-[calc(50%+0.75rem+0.125rem)] -order-1 m-0 -translate-y-1/2 border-dashed group-data-[orientation=horizontal]/stepper:w-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:flex-none" />
                )}
              </StepperItem>
            )
          )}
        </Stepper>

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

      <UpdateStepModal
        item={selectedStepItem}
        isOpen={!!selectedStepItem}
        onClose={() => setSelectedStepItem(null)}
        onConfirm={async (step: number) => {
          if (!selectedStepItem) return
          await updateStep.mutateAsync({
            orderId: order.id,
            itemId: selectedStepItem.productId,
            body: { fulfillment_step: step },
          })
          setSelectedStepItem(null)
        }}
        isConfirming={updateStep.isPending}
      />

      <UpdateReceivedModal
        item={selectedReceivedItem}
        isOpen={!!selectedReceivedItem}
        onClose={() => setSelectedReceivedItem(null)}
        onConfirm={async (received: number) => {
          if (!selectedReceivedItem) return
          await updateReceived.mutateAsync({
            orderId: order.id,
            itemId: selectedReceivedItem.productId,
            body: { items_received: received },
          })
          setSelectedReceivedItem(null)
        }}
        isConfirming={updateReceived.isPending}
      />

      <UpdateTrackingModal
        item={selectedTrackingItem}
        isOpen={!!selectedTrackingItem}
        onClose={() => setSelectedTrackingItem(null)}
        onConfirm={async (trackingNumber: string, trackingUrl: string) => {
          if (!selectedTrackingItem) return
          await updateTracking.mutateAsync({
            orderId: order.id,
            itemId: selectedTrackingItem.productId,
            body: {
              tracking_number: trackingNumber,
              tracking_url: trackingUrl,
            },
          })
          setSelectedTrackingItem(null)
        }}
        isConfirming={updateTracking.isPending}
      />
    </div>
  )
}
