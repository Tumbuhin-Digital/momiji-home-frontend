/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

import { useQueryClient } from "@tanstack/react-query"

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

import { PreorderCalculateShippingModal } from "@/components/features/orders/preorder-calculate-shipping-modal"
import { CancelOrderModal } from "@/components/features/orders/cancel-order-modal"
import { FulfillmentGroupCard } from "@/components/features/orders/fulfillment-group-card"
import { SecondPaymentConfirmationModal } from "@/components/features/orders/second-payment-confirmation-modal"
import { IconTruckFast } from "@/public/icons/iconsax-truck-fast"

import {
  useCancelOrder,
  useCreateFulfillment,
  useMarkFulfillmentDelivered,
  useRequestSecondPayment,
  useUpdateItemReceived,
  useUpdateItemStep,
  useUpdateItemTracking,
} from "@/hooks/use-orders"
import { queryKeys } from "@/lib/query/query-keys"
import { formatCurrency } from "@/lib/utils"

import type { Order, OrderFulfillmentSegment } from "@/types/orders"
import { orderLineDisplayUnitPrice } from "@/types/orders/entities"
import type { OrderLineItem } from "@/types/orders/entities"
import type { CreateFulfillmentDto } from "@/types/orders/dtos"

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
const FulfillItemsModal = dynamic(
  () => import("./fulfill-items-modal").then((mod) => mod.FulfillItemsModal),
  { ssr: false }
)

const shipReadySteps = [
  { step: 1, title: "Order Placed" },
  { step: 2, title: "Shipped" },
  { step: 3, title: "Delivered" },
]

function toShipReadyVisualStep(backendStep: number): number {
  if (backendStep >= 4) return 3
  if (backendStep >= 3) return 2
  return 1
}

const preOrderSteps = [
  { step: 1, title: "Order Placed" },
  { step: 2, title: "Calculate Shipping" },
  { step: 3, title: "Second Payment" },
  { step: 4, title: "Shipped" },
  { step: 5, title: "Delivered" },
]

interface OrderFulfillmentPanelProps {
  order: Order
  segment: OrderFulfillmentSegment
  onOrderActioned?: () => void
  isLoading?: boolean
}

function segmentIsPreOrder(segment: OrderFulfillmentSegment): boolean {
  return (
    segment.kind === "preorder_batch" ||
    segment.kind === "preorder_unbatched"
  )
}

function derivePreorderVisualStep(
  segment: OrderFulfillmentSegment
): number {
  const fulfillments = segment.fulfillments ?? []
  if (
    fulfillments.some(
      (f) => f.status === "delivered" || Boolean(f.deliveredAt)
    )
  ) {
    return 5
  }
  if (fulfillments.length > 0) {
    return 4
  }

  // Prefer this segment's payment/shipment state so sibling batches that share
  // the same product line do not inherit shipped/tracking progress.
  const status = segment.secondPaymentStatus
  if (status === "paid" || segment.shipment?.invoicePaidAt) {
    return 4
  }
  if (status === "invoiced" || segment.shipment?.invoiceSentAt) {
    return 3
  }
  if (
    status === "ready" ||
    segment.shipment?.finalShippingPrice != null
  ) {
    return 2
  }
  return 1
}

export function OrderFulfillmentPanel({
  order,
  segment,
  onOrderActioned,
  isLoading = false,
}: OrderFulfillmentPanelProps) {
  const [selectedReceivedItem, setSelectedReceivedItem] =
    useState<OrderLineItem | null>(null)
  const [selectedStepItem, setSelectedStepItem] =
    useState<OrderLineItem | null>(null)
  const [selectedTrackingItem, setSelectedTrackingItem] =
    useState<OrderLineItem | null>(null)

  const [cancelSuccess, setCancelSuccess] = useState(false)
  const [trackingSuccess, setTrackingSuccess] = useState(false)
  const [receivedSuccess, setReceivedSuccess] = useState(false)
  const [showCalculateShippingModal, setShowCalculateShippingModal] =
    useState(false)
  const [calculateShippingModalKey, setCalculateShippingModalKey] = useState(0)
  const [calculateShippingMode, setCalculateShippingMode] = useState<
    "initial" | "edit"
  >("initial")
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showFulfillModal, setShowFulfillModal] = useState(false)
  const [markingDeliveredId, setMarkingDeliveredId] = useState<string | null>(
    null
  )
  const [showSecondPaymentModal, setShowSecondPaymentModal] = useState(false)
  const [secondPaymentError, setSecondPaymentError] = useState<
    string | undefined
  >()
  const [invoiceSuccess, setInvoiceSuccess] = useState(false)

  const queryClient = useQueryClient()

  const cancelOrder = useCancelOrder()
  const updateReceived = useUpdateItemReceived()
  const updateStep = useUpdateItemStep()
  const updateTracking = useUpdateItemTracking()
  const createFulfillment = useCreateFulfillment(order.id)
  const markDelivered = useMarkFulfillmentDelivered(order.id)
  const requestSecondPayment = useRequestSecondPayment(order.id)

  const items = segment.lineItems
  const isPreOrder = segmentIsPreOrder(segment)
  const shipment = segment.shipment

  const maxItemStep = items.reduce(
    (max, item) => Math.max(max, item.fulfillmentStep || 1),
    1
  )

  const currentStep = isPreOrder
    ? derivePreorderVisualStep(segment)
    : maxItemStep

  const visualStep = isPreOrder
    ? currentStep
    : toShipReadyVisualStep(currentStep)

  const panelTitle = segment.title
  const batchSubtitle =
    segment.kind === "preorder_batch" && segment.batchName
      ? `${segment.batchName} (${items.reduce((n, i) => n + i.quantity, 0)} items)`
      : null

  if (isLoading) {
    const steps = isPreOrder ? preOrderSteps : shipReadySteps
    return (
      <div className="relative overflow-hidden rounded-xl border border-[#D9E2E8] bg-[#F4F7F9]/30">
        <div className="flex flex-col gap-3 border-b border-[#D9E2E8] bg-[#EBF0F3] px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-bold text-slate-700">
            {panelTitle}
          </h3>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-7 w-24 rounded-sm" />
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

          <Stepper value={visualStep} className="mb-6">
            {steps.map(({ step, title }, idx, arr) => (
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
                {idx < arr.length - 1 && (
                  <StepperSeparator className="absolute inset-x-0 top-3 left-[calc(50%+0.75rem+0.125rem)] -order-1 m-0 -translate-y-1/2 border-dashed group-data-[orientation=horizontal]/stepper:w-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:flex-none" />
                )}
              </StepperItem>
            ))}
          </Stepper>

          {currentStep >= 3 && (
            <div className="mt-3 flex flex-col gap-2 rounded-xl border border-[#D9E2E8] bg-white p-4">
              <h4 className="text-sm font-bold text-slate-700">Airway Bill</h4>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          )}
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

  const apiFulfillmentType = isPreOrder ? "pre_order" : "ship_ready"

  const handleShippingConfigured = async () => {
    onOrderActioned?.()
    await queryClient.refetchQueries({
      queryKey: queryKeys.orders.detail(order.id),
    })
    setShowCalculateShippingModal(false)
  }

  const handleShippingEdited = async () => {
    onOrderActioned?.()
    await queryClient.refetchQueries({
      queryKey: queryKeys.orders.detail(order.id),
    })
    setShowCalculateShippingModal(false)
  }

  const isCancelled = order.fulfillmentStatus === "cancelled"
  const paymentLocked =
    segment.secondPaymentStatus === "invoiced" ||
    segment.secondPaymentStatus === "paid" ||
    Boolean(shipment?.invoiceSentAt) ||
    Boolean(shipment?.invoicePaidAt)

  const canRequestSecondPayment =
    Boolean(segment.canRequestSecondPayment) ||
    (shipment?.finalShippingPrice != null &&
      !shipment?.invoiceSentAt &&
      !shipment?.invoicePaidAt)

  const showCalculateShipping =
    isPreOrder &&
    !isCancelled &&
    !paymentLocked &&
    shipment?.finalShippingPrice == null

  const showEditShipping =
    isPreOrder &&
    !isCancelled &&
    !paymentLocked &&
    shipment?.finalShippingPrice != null

  const showRequestSecondPayment =
    isPreOrder && !isCancelled && canRequestSecondPayment && !paymentLocked

  const handleRequestSecondPayment = async (
    _orderId: string,
    batchId?: string | null
  ) => {
    setSecondPaymentError(undefined)
    try {
      await requestSecondPayment.mutateAsync({ batchId: batchId ?? null })
      setShowSecondPaymentModal(false)
      setInvoiceSuccess(true)
      setTimeout(() => {
        setInvoiceSuccess(false)
        onOrderActioned?.()
      }, 2000)
    } catch (error: unknown) {
      const err = error as {
        payload?: { message?: string; error?: { message?: string } }
        response?: { data?: { message?: string } }
        message?: string
      }
      setSecondPaymentError(
        err?.payload?.error?.message ||
          err?.payload?.message ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to send second payment invoice."
      )
    }
  }

  const trackingActionStep = isPreOrder ? 4 : 3

  const preOrderFulfillments = segment.fulfillments ?? []

  const hasUnfulfilledPreOrder = isPreOrder
    ? items.some((item) => {
        const remaining = item.remainingQuantity ?? item.quantity
        const hasTracking = Boolean(
          item.trackingNumber?.trim() || item.trackingUrl?.trim()
        )
        if (remaining <= 0) return false
        if (hasTracking && remaining >= item.quantity) return false
        return true
      })
    : false

  const handleFulfillConfirm = async (body: CreateFulfillmentDto) => {
    await createFulfillment.mutateAsync({
      ...body,
      batch_id: segment.batchId ?? null,
    })
    setShowFulfillModal(false)
    await queryClient.refetchQueries({
      queryKey: queryKeys.orders.detail(order.id),
    })
    setTrackingSuccess(true)
    setTimeout(() => {
      setTrackingSuccess(false)
      onOrderActioned?.()
    }, 2000)
  }

  const handleMarkDelivered = async (fulfillmentId: string) => {
    setMarkingDeliveredId(fulfillmentId)
    try {
      await markDelivered.mutateAsync(fulfillmentId)
      await queryClient.refetchQueries({
        queryKey: queryKeys.orders.detail(order.id),
      })
      onOrderActioned?.()
    } finally {
      setMarkingDeliveredId(null)
    }
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

  const handleTrackingConfirm = async (
    trackingNumber: string,
    trackingUrl: string
  ) => {
    const isGlobal = !selectedTrackingItem?.productId
    const ids = isGlobal
      ? items.map((i) => i.productId)
      : [selectedTrackingItem.productId]

    await updateTracking.mutateAsync({
      orderId: order.id,
      body: {
        item_ids: ids,
        tracking_number: trackingNumber,
        tracking_url: trackingUrl,
      },
    })

    setSelectedTrackingItem(null)

    await queryClient.invalidateQueries({
      queryKey: queryKeys.orders.detail(order.id),
    })
    await queryClient.refetchQueries({
      queryKey: queryKeys.orders.detail(order.id),
    })

    setTrackingSuccess(true)
    setTimeout(() => {
      setTrackingSuccess(false)
      onOrderActioned?.()
    }, 2000)
  }

  const renderItemContent = (item: OrderLineItem) => {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-none sm:flex-row">
        <div className="flex min-w-0 flex-1 gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-linear-to-b from-white via-white to-black/5">
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
            <div className="flex flex-col items-start justify-start gap-1">
              {item.itemStatus === "delivered" && (
                <span className="rounded-full bg-[#49944B1A] px-3 py-0.5 text-[10px] font-bold text-[#49944B] hover:bg-[#49944B1A]">
                  Delivered
                </span>
              )}
              {isPreOrder &&
                item.itemStatus !== "delivered" &&
                (segment.secondPaymentStatus === "invoiced" ||
                  (Boolean(shipment?.invoiceSentAt) &&
                    !shipment?.invoicePaidAt)) && (
                <span className="rounded-full bg-amber-50 px-3 py-0.5 text-[10px] font-bold text-amber-800">
                  Waiting for Payment
                </span>
              )}
              {isPreOrder &&
                item.itemStatus !== "delivered" &&
                (segment.secondPaymentStatus === "paid" ||
                  Boolean(shipment?.invoicePaidAt)) && (
                <span className="rounded-full bg-blue-50 px-3 py-0.5 text-[10px] font-bold text-blue-800">
                  Payment Received
                </span>
              )}
              {!isPreOrder && item.itemStatus === "waiting_payment" && (
                <span className="rounded-full bg-amber-50 px-3 py-0.5 text-[10px] font-bold text-amber-800">
                  Waiting for Payment
                </span>
              )}
              {!isPreOrder && item.itemStatus === "payment_received" && (
                <span className="rounded-full bg-blue-50 px-3 py-0.5 text-[10px] font-bold text-blue-800">
                  Payment Received
                </span>
              )}
              {order.fulfillmentStatus === "cancelled" && (
                <span className="rounded-full bg-[#DC26261A] px-3 py-0.5 text-[10px] font-bold text-[#DC2626] hover:bg-[#DC26261A]">
                  Cancelled
                </span>
              )}
              <p
                className="font-medium wrap-break-word text-slate-800"
                title={item.title}
              >
                {item.title}
              </p>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {item.quantity} pcs - {formatCurrency(orderLineDisplayUnitPrice(item))}{" "}
              USD
            </p>
          </div>
        </div>
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
        className="mt-3 flex flex-col gap-3 rounded-md bg-white p-4"
      >
        <h4 className="font-medium text-black">Airway Bill</h4>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center justify-center gap-3">
            <div className="mt-0.5 shrink-0">
              <IconTruckFast className="size-6 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-[#323232]">
                {item.trackingCompany || "Carrier"}
              </p>
              <p className="text-sm text-[#323232]/60">
                Tracking number:{" "}
                {item.trackingUrl ? (
                  <a
                    href={item.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:text-primary/80"
                  >
                    {item.trackingNumber || "-"}
                  </a>
                ) : (
                  item.trackingNumber || "-"
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs text-[#323232]/60">Last Updated</p>
            <p className="text-sm text-[#323232]">
              {item.trackingLastEvent || "Package info updated"}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-t-xl bg-[#F4F7F9]/60">
      <AnimatePresence>
        {(cancelSuccess ||
          trackingSuccess ||
          receivedSuccess ||
          invoiceSuccess) && (
          <motion.div
            key="success-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-xl bg-white/95 backdrop-blur-sm"
          >
            {trackingSuccess || receivedSuccess || invoiceSuccess ? (
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
                  {invoiceSuccess && "Second Payment Invoice Sent!"}
                  {trackingSuccess && "Tracking Added Successfully!"}
                  {receivedSuccess && "Received Count Updated!"}
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

      <div className="flex flex-col gap-3 rounded-t-xl border border-primary bg-primary/20 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-primary">{panelTitle}</h3>
          {batchSubtitle && (
            <p className="text-sm font-medium text-primary/80">{batchSubtitle}</p>
          )}
        </div>
        <div className="flex shrink-0 flex-nowrap items-center gap-2">
          {showCalculateShipping && (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 border-[#A2D2FF] bg-[#D3E5FF] px-2 text-[11px] leading-none text-[#0052CC] hover:bg-[#BDE0FE] sm:text-[11px]"
              onClick={() => {
                setCalculateShippingMode("initial")
                setCalculateShippingModalKey((k) => k + 1)
                setShowCalculateShippingModal(true)
              }}
            >
              Calculate Shipping
            </Button>
          )}
          {showEditShipping && (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 border-[#A2D2FF] bg-[#D3E5FF] px-2 text-[11px] leading-none text-[#0052CC] hover:bg-[#BDE0FE] sm:text-[11px]"
              onClick={() => {
                setCalculateShippingMode("edit")
                setCalculateShippingModalKey((k) => k + 1)
                setShowCalculateShippingModal(true)
              }}
            >
              Edit Shipping Rate
            </Button>
          )}
          {showRequestSecondPayment && (
            <Button
              type="button"
              size="sm"
              className="shrink-0 bg-primary px-2 text-[11px] leading-none text-white hover:bg-primary/90 sm:text-[11px]"
              disabled={requestSecondPayment.isPending}
              onClick={() => {
                setSecondPaymentError(undefined)
                setShowSecondPaymentModal(true)
              }}
            >
              Request Second Payment
            </Button>
          )}
          {!showCalculateShipping &&
            !(isPreOrder && currentStep === 2 && !paymentLocked) &&
            !isCancelled && (
              <>
                {isPreOrder && currentStep === 3 && (
                  <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                    Waiting for payment
                  </span>
                )}

                {isPreOrder &&
                  currentStep === trackingActionStep &&
                  hasUnfulfilledPreOrder && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 border-[#A2D2FF] bg-[#D3E5FF] text-[#0052CC] hover:bg-[#BDE0FE]"
                      onClick={() => setShowFulfillModal(true)}
                      disabled={createFulfillment.isPending}
                    >
                      Add Tracking
                    </Button>
                  )}

                {!isPreOrder &&
                  currentStep === trackingActionStep &&
                  !hasTrackingInfo && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 border-[#A2D2FF] bg-[#D3E5FF] text-[#0052CC] hover:bg-[#BDE0FE]"
                      onClick={() => {
                        if (items.length === 1) {
                          setSelectedTrackingItem(items[0])
                        } else {
                          setSelectedTrackingItem({
                            productId: "",
                            title: "All Items",
                          } as any)
                        }
                      }}
                    >
                      Add Tracking
                    </Button>
                  )}
                {!isPreOrder &&
                  currentStep === trackingActionStep &&
                  hasTrackingInfo && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 border-[#A2D2FF] bg-[#D3E5FF] text-[#0052CC] hover:bg-[#BDE0FE]"
                      onClick={() => {
                        if (items.length === 1) {
                          setSelectedReceivedItem(items[0])
                        } else {
                          const totalQuantity = items.reduce(
                            (sum, item) => sum + item.quantity,
                            0
                          )
                          const totalItemsReceived = items.reduce(
                            (sum, item) => sum + (item.itemsReceived || 0),
                            0
                          )
                          setSelectedReceivedItem({
                            productId: "",
                            title: "All Items",
                            quantity: totalQuantity,
                            itemsReceived: totalItemsReceived,
                          } as any)
                        }
                      }}
                      disabled={updateReceived.isPending}
                    >
                      Update Received
                    </Button>
                  )}
              </>
            )}
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-sm font-medium text-black">
            Total Item{items.length > 1 && ` (${items.length})`}
          </h4>
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

        {isPreOrder && currentStep === 1 && !isCancelled && (
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p>
              Step 1: open <strong>Calculate Shipping</strong> to review the
              checkout estimate, adjust box packing, optionally recalculate the
              current rate, and set the final shipping price from Unishippers.
            </p>
          </div>
        )}

        {isPreOrder && currentStep === 2 && !isCancelled && (
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {shipment?.finalShippingPrice != null ? (
              <p>
                Shipping configured:{" "}
                <span className="font-semibold text-slate-800">
                  {formatCurrency(shipment.finalShippingPrice)} USD
                </span>
                {shipment.estimatedShipping != null && (
                  <span className="text-slate-500">
                    {" "}
                    (checkout estimate{" "}
                    {formatCurrency(shipment.estimatedShipping)})
                  </span>
                )}
                .{" "}
                {canRequestSecondPayment
                  ? "Ready — use Request Second Payment for this group."
                  : paymentLocked
                    ? "Second payment invoice sent for this group."
                    : "Finish setting the final shipping price, then request second payment for this group."}
              </p>
            ) : shipment?.estimatedShipping != null ? (
              <p>
                Checkout estimate saved (
                {formatCurrency(shipment.estimatedShipping)} USD). Open{" "}
                <strong>Calculate Shipping</strong> to set the final price.
              </p>
            ) : (
              <p>
                Open <strong>Calculate Shipping</strong> to calculate a rate and
                set the final price before requesting second payment.
              </p>
            )}
          </div>
        )}

        {(() => {
          const uniqueTrackings = new Map<string, OrderLineItem>()
          items.forEach((item) => {
            const hasTracking =
              item.trackingNumber ||
              item.trackingUrl ||
              item.trackingCompany ||
              item.trackingLastEvent
            if (!hasTracking) return

            const key = [
              item.trackingCompany || "",
              item.trackingNumber || "",
              item.trackingUrl || "",
            ].join("|")

            if (!uniqueTrackings.has(key)) {
              uniqueTrackings.set(key, item)
            }
          })
          return Array.from(uniqueTrackings.values()).map((item) =>
            renderAirwayBill(item)
          )
        })()}

        {isPreOrder && preOrderFulfillments.length > 0 && (
          <div className="mt-4 flex flex-col gap-4">
            {preOrderFulfillments.map((f) => (
              <FulfillmentGroupCard
                key={f.id}
                fulfillment={f}
                onMarkDelivered={handleMarkDelivered}
                isMarkingDelivered={markingDeliveredId === f.id}
              />
            ))}
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
          const isGlobal = !selectedReceivedItem.productId
          const payloadItems: { item_id: string; items_received: number }[] = []

          if (isGlobal) {
            let remaining = received
            for (const item of items) {
              const itemQty = item.quantity
              const itemReceived = Math.min(remaining, itemQty)
              payloadItems.push({
                item_id: item.productId,
                items_received: itemReceived,
              })
              remaining = Math.max(0, remaining - itemQty)
            }
          } else {
            payloadItems.push({
              item_id: selectedReceivedItem.productId,
              items_received: received,
            })
          }

          await updateReceived.mutateAsync({
            orderId: order.id,
            body: {
              items: payloadItems,
            },
          })
          setSelectedReceivedItem(null)

          await queryClient.invalidateQueries({
            queryKey: queryKeys.orders.detail(order.id),
          })
          await queryClient.refetchQueries({
            queryKey: queryKeys.orders.detail(order.id),
          })

          setReceivedSuccess(true)
          setTimeout(() => {
            setReceivedSuccess(false)
            onOrderActioned?.()
          }, 2000)
        }}
        isConfirming={updateReceived.isPending}
      />

      <UpdateTrackingModal
        item={selectedTrackingItem}
        isOpen={!!selectedTrackingItem}
        onClose={() => setSelectedTrackingItem(null)}
        onConfirm={handleTrackingConfirm}
        isConfirming={updateTracking.isPending || updateStep.isPending}
      />

      {isPreOrder && (
        <FulfillItemsModal
          items={items}
          isOpen={showFulfillModal}
          onClose={() => setShowFulfillModal(false)}
          onConfirm={handleFulfillConfirm}
          isConfirming={createFulfillment.isPending}
        />
      )}

      <PreorderCalculateShippingModal
        key={`calc-ship-${order.id}-${segment.key}-${calculateShippingModalKey}`}
        order={order}
        items={items}
        isOpen={showCalculateShippingModal}
        onClose={() => setShowCalculateShippingModal(false)}
        mode={calculateShippingMode}
        batchId={segment.batchId ?? null}
        shipment={shipment}
        onSaved={
          calculateShippingMode === "edit"
            ? handleShippingEdited
            : onOrderActioned
        }
        onShippingConfigured={
          calculateShippingMode === "initial"
            ? handleShippingConfigured
            : undefined
        }
      />

      <CancelOrderModal
        order={order}
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        isConfirming={cancelOrder.isPending}
      />

      {isPreOrder && (
        <SecondPaymentConfirmationModal
          order={order}
          segment={segment}
          isOpen={showSecondPaymentModal}
          onClose={() => {
            setShowSecondPaymentModal(false)
            setSecondPaymentError(undefined)
          }}
          onConfirm={handleRequestSecondPayment}
          isConfirming={requestSecondPayment.isPending}
          error={secondPaymentError}
          shippingTotal={segment.groupShipping ?? shipment?.finalShippingPrice}
          groupBalanceDue={segment.groupBalanceDue}
        />
      )}
    </div>
  )
}
