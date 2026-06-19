/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import dynamic from "next/dynamic"
import { useState } from "react"

import Autoplay from "embla-carousel-autoplay"
import { AnimatePresence, motion } from "motion/react"
import { Boxes, CheckCircle2, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper"

import { AcceptOrderModal } from "@/components/features/orders/accept-order-modal"
import { CancelOrderModal } from "@/components/features/orders/cancel-order-modal"

import {
  useAcceptOrder,
  useCancelOrder,
  useUpdateItemReceived,
  useUpdateItemStep,
  useUpdateItemTracking,
  // useItemTracking,
} from "@/hooks/use-orders"
import { formatCurrency } from "@/lib/utils"

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
  onOrderActioned?: () => void
  isLoading?: boolean
}

export function OrderFulfillmentPanel({
  order,
  type,
  onOrderActioned,
  isLoading = false,
}: OrderFulfillmentPanelProps) {
  const [selectedReceivedItem, setSelectedReceivedItem] =
    useState<OrderLineItem | null>(null)
  const [selectedStepItem, setSelectedStepItem] =
    useState<OrderLineItem | null>(null)
  const [selectedTrackingItem, setSelectedTrackingItem] =
    useState<OrderLineItem | null>(null)

  const [acceptSuccess, setAcceptSuccess] = useState(false)
  const [cancelSuccess, setCancelSuccess] = useState(false)
  const [showAcceptModal, setShowAcceptModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  const acceptOrder = useAcceptOrder()
  const cancelOrder = useCancelOrder()
  const updateReceived = useUpdateItemReceived()
  const updateStep = useUpdateItemStep()
  const updateTracking = useUpdateItemTracking()

  const items = order.lineItems.filter(
    (item) => item.type === type || (!item.type && order.type === type)
  )

  const isPreOrder = type === "pre-order"

  if (isLoading) {
    const steps = isPreOrder ? preOrderSteps : shipReadySteps
    return (
      <div className="relative overflow-hidden rounded-xl border border-[#D9E2E8] bg-[#F4F7F9]/30">
        <div className="flex items-center justify-between border-b border-[#D9E2E8] bg-[#EBF0F3] px-6 py-3">
          <h3 className="text-lg font-bold text-slate-700">
            {type === "ship-ready" ? "Ship Ready" : "Pre-Order"}
          </h3>
          <div className="flex gap-2">
            <Skeleton className="h-7 w-24 rounded-[6px]" />
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <Skeleton className="h-4 w-28" />
          </div>

          <div className="mb-8 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-none sm:flex-row">
            <div className="flex min-w-0 flex-1 gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-slate-100">
                <Skeleton className="absolute inset-0 h-full w-full" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          </div>

          {/* Stepper Skeleton */}
          <Stepper value={1} className="mb-6">
            {steps.map(({ step, title }) => (
              <StepperItem
                key={step}
                step={step}
                className="relative flex-1 flex-col!"
              >
                <StepperTrigger className="pointer-events-none flex-col gap-3 rounded opacity-60">
                  <StepperIndicator>
                    <Skeleton className="absolute inset-0 rounded-full" />
                  </StepperIndicator>
                  <div className="space-y-0.5 px-2">
                    <StepperTitle>{title}</StepperTitle>
                  </div>
                </StepperTrigger>
              </StepperItem>
            ))}
          </Stepper>
        </div>
      </div>
    )
  }

  if (items.length === 0) return null

  const hasTrackingInfo = items.some(
    (item) =>
      item.trackingNumber ||
      item.trackingUrl ||
      item.trackingCompany ||
      item.trackingLastEvent
  )

  // const trackedItem = items.find((item) => item.trackingNumber)
  // const { data: liveTracking } = useItemTracking(
  //   order.id,
  //   trackedItem?.productId || "",
  //   {
  //     enabled: !!trackedItem?.productId && !!trackedItem?.trackingNumber,
  //   }
  // )
  const apiFulfillmentType = type.replace("-", "_")

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAccept = async (_orderId: string) => {
    await acceptOrder.mutateAsync({
      orderId: order.id,
      fulfillmentType: apiFulfillmentType,
    })
    setShowAcceptModal(false)
    setAcceptSuccess(true)
    setTimeout(() => {
      setAcceptSuccess(false)
      onOrderActioned?.()
    }, 2000)
  }

  const handleCancel = async (_orderId: string, reason: string) => {
    await cancelOrder.mutateAsync({
      orderId: order.id,
      reason,
      fulfillmentType: apiFulfillmentType,
    })
    setShowCancelModal(false)
    setCancelSuccess(true)
    setTimeout(() => {
      setCancelSuccess(false)
      onOrderActioned?.()
    }, 2000)
  }

  const currentStep = items.reduce(
    (max, item) => Math.max(max, item.fulfillmentStep || 1),
    1
  )

  const visualStep = currentStep

  const isCancelled = order.fulfillmentStatus === "cancelled"
  const isNewOrder = currentStep === 1 && !isCancelled

  const handleTrackingConfirm = async (
    trackingNumber: string,
    trackingUrl: string
  ) => {
    // Apply tracking to all items in the panel that need it
    const isGlobal = !selectedTrackingItem?.productId
    const itemsToUpdate = isGlobal ? items : [selectedTrackingItem]

    for (const item of itemsToUpdate) {
      await updateTracking.mutateAsync({
        orderId: order.id,
        itemId: item.productId,
        body: {
          tracking_number: trackingNumber,
          tracking_url: trackingUrl,
        },
      })
    }

    setSelectedTrackingItem(null)
  }

  const handleUpdateStepAll = async (targetStep: number) => {
    for (const item of items) {
      if ((item.fulfillmentStep || 1) < targetStep) {
        await updateStep.mutateAsync({
          orderId: order.id,
          itemId: item.productId,
          body: { fulfillment_step: targetStep },
        })
      }
    }
  }

  const renderItemContent = (item: OrderLineItem) => {
    const step = item.fulfillmentStep || 1

    return (
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-none sm:flex-row">
        <div className="flex min-w-0 flex-1 gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-linear-to-b from-white via-white to-black/5">
            {/* Product Image placeholder */}
            {item.imageSrc ? (
              <img
                src={item.imageSrc}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center">
                <Boxes className="size-6 text-neutral-400" strokeWidth={0.5} />
                <span className="text-[10px] font-light text-neutral-400">
                  No Image
                </span>
              </div>
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <div className="flex items-center gap-2">
              <p
                className="truncate font-medium text-slate-800"
                title={item.title}
              >
                {item.title}
              </p>
              {order.fulfillmentStatus === "cancelled" && (
                <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                  CANCELLED
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {item.quantity} pcs - {formatCurrency(item.unitPrice)} USD
            </p>
            {item.trackingNumber && (
              <p className="mt-1 text-xs font-semibold text-slate-600">
                Tracking: {item.trackingNumber}
              </p>
            )}
            {item.itemsReceived !== undefined && step === 5 && isPreOrder && (
              <p className="mt-0.5 text-xs text-slate-500">
                Received: {item.itemsReceived}
              </p>
            )}
          </div>
        </div>

        {step === 4 &&
          isPreOrder &&
          order.fulfillmentStatus !== "cancelled" && (
            <div className="flex items-center gap-2 sm:flex-col sm:justify-center sm:border-l sm:border-slate-100 sm:pl-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs whitespace-nowrap"
                onClick={() => setSelectedReceivedItem(item)}
              >
                Update Received
              </Button>
            </div>
          )}
      </div>
    )
  }

  const renderAirwayBill = (item: OrderLineItem) => {
    const itemHasTrackingInfo =
      item.trackingNumber ||
      item.trackingUrl ||
      item.trackingCompany ||
      item.trackingLastEvent

    if (!itemHasTrackingInfo) return null

    return (
      <div
        key={`airway-bill-${item.productId}`}
        className="mt-3 flex flex-col gap-2 rounded-xl border border-[#D9E2E8] bg-white p-4"
      >
        <h4 className="text-sm font-bold text-slate-700">Airway Bill</h4>
        <div className="flex flex-col gap-1 text-sm text-slate-600">
          <p>
            <span className="font-medium">Carrier:</span>{" "}
            {item.trackingCompany || ""}
          </p>
          <p>
            <span className="font-medium">Tracking Number:</span>{" "}
            {item.trackingNumber || ""}
          </p>
          {item.trackingLastEvent && (
            <p>
              <span className="font-medium">Last Event:</span>{" "}
              {item.trackingLastEvent || ""}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#D9E2E8] bg-[#F4F7F9]/30">
      {/* Success overlay animation */}
      <AnimatePresence>
        {(acceptSuccess || cancelSuccess) && (
          <motion.div
            key="success-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-xl bg-white/95 backdrop-blur-sm"
          >
            {acceptSuccess ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.1,
                  }}
                >
                  <CheckCircle2 className="h-14 w-14 text-emerald-500" />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-base font-bold text-emerald-700"
                >
                  Order Accepted!
                </motion.p>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.1,
                  }}
                >
                  <XCircle className="h-14 w-14 text-red-500" />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-base font-bold text-red-700"
                >
                  Order Cancelled
                </motion.p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between border-b border-[#D9E2E8] bg-[#EBF0F3] px-6 py-3">
        <h3 className="text-lg font-bold text-slate-700">
          {type === "ship-ready" ? "Ship Ready" : "Pre-Order"}
        </h3>
        <div className="flex gap-2">
          {isNewOrder ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="border-[#A2D2FF] bg-[#D3E5FF] text-[#0052CC] hover:bg-[#BDE0FE]"
                onClick={() => setShowAcceptModal(true)}
                disabled={acceptOrder.isPending}
              >
                Accept Order
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-[#FFB3B3] bg-[#FFD6D6] text-[#D8000C] hover:bg-[#FFC2C2]"
                onClick={() => setShowCancelModal(true)}
                disabled={cancelOrder.isPending}
              >
                Cancel
              </Button>
            </>
          ) : !isCancelled ? (
            <>
              {isPreOrder && currentStep === 2 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#A2D2FF] bg-[#D3E5FF] text-[#0052CC] hover:bg-[#BDE0FE]"
                  onClick={() => handleUpdateStepAll(3)}
                  disabled={updateStep.isPending}
                >
                  Mark Stock Ready
                </Button>
              )}
              {isPreOrder && currentStep === 3 && !hasTrackingInfo && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#A2D2FF] bg-[#D3E5FF] text-[#0052CC] hover:bg-[#BDE0FE]"
                  onClick={() =>
                    setSelectedTrackingItem({ title: "All Items" } as any)
                  }
                >
                  Add Tracking
                </Button>
              )}
            </>
          ) : null}
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-sm font-bold">Total Item ({items.length})</h4>
        </div>
        {items.length > 1 ? (
          <Carousel
            opts={{ align: "start", loop: true }}
            plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
            className="mb-8 w-full"
          >
            <CarouselContent>
              {items.map((item) => (
                <CarouselItem key={item.productId}>
                  <div className="flex flex-col gap-1">
                    {renderItemContent(item)}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        ) : (
          <div className="mb-8 w-full">{renderItemContent(items[0])}</div>
        )}

        {/* Stepper */}
        <Stepper value={visualStep} className="mb-6">
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
        {items.map((item) => renderAirwayBill(item))}
      </div>

      {/* Update Step Modal */}
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

      {/* Update Received Modal */}
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

      {/* Update Tracking Modal */}
      <UpdateTrackingModal
        item={selectedTrackingItem}
        isOpen={!!selectedTrackingItem}
        onClose={() => setSelectedTrackingItem(null)}
        onConfirm={handleTrackingConfirm}
        isConfirming={updateTracking.isPending || updateStep.isPending}
      />

      {/* Accept confirmation modal */}
      <AcceptOrderModal
        order={order}
        isOpen={showAcceptModal}
        onClose={() => setShowAcceptModal(false)}
        onConfirm={handleAccept}
        isConfirming={acceptOrder.isPending}
      />

      {/* Cancel confirmation modal */}
      <CancelOrderModal
        order={order}
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        isConfirming={cancelOrder.isPending}
      />
    </div>
  )
}
