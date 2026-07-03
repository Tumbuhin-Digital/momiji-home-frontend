/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import Autoplay from "embla-carousel-autoplay"

interface ImageCarouselProps {
  images: any[]
  altText: string
  className?: string
  imageClassName?: string
  sizes?: string
  autoplayDelay?: number
  playOnHover?: boolean
  isHovered?: boolean
}

const defaultImageClassName =
  "relative block aspect-square h-auto max-w-full object-cover align-middle transition-opacity duration-200"

function HoverFadeImageCarousel({
  images,
  altText,
  className = "h-full w-full",
  imageClassName,
  sizes,
  autoplayDelay = 1000,
  isHovered = false,
}: Required<Pick<ImageCarouselProps, "images" | "altText">> &
  Pick<
    ImageCarouselProps,
    "className" | "imageClassName" | "sizes" | "autoplayDelay" | "isHovered"
  >) {
  const [activeIndex, setActiveIndex] = useState(0)
  const displayedIndex = isHovered ? activeIndex : 0

  useEffect(() => {
    if (!isHovered || images.length <= 1) return

    const id = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length)
    }, autoplayDelay)

    return () => window.clearInterval(id)
  }, [isHovered, images.length, autoplayDelay])

  const resolvedImageClassName =
    imageClassName ??
    "relative block aspect-square h-auto max-w-full object-cover align-middle"

  return (
    <div className={cn("relative", className)}>
      {images.map((img, idx) => (
        <Image
          key={idx}
          src={img.src}
          alt={img.alt || altText}
          fill
          className={cn(
            resolvedImageClassName,
            "absolute inset-0 transition-opacity duration-500 ease-in-out",
            idx === displayedIndex ? "opacity-100" : "opacity-0"
          )}
          sizes={sizes}
          unoptimized={!sizes}
          loading="lazy"
        />
      ))}
    </div>
  )
}

function AutoplayImageCarousel({
  images,
  altText,
  className = "h-full w-full",
  imageClassName,
  sizes,
  autoplayDelay = 5000,
}: Required<Pick<ImageCarouselProps, "images" | "altText">> &
  Pick<ImageCarouselProps, "className" | "imageClassName" | "sizes" | "autoplayDelay">) {
  const plugins = useMemo(
    () => [
      Autoplay({
        delay: autoplayDelay,
        playOnInit: true,
        stopOnInteraction: false,
      }),
    ],
    [autoplayDelay]
  )

  const resolvedImageClassName = imageClassName ?? defaultImageClassName

  return (
    <Carousel
      opts={{ loop: true, dragFree: false }}
      plugins={plugins}
      className={`${className} [&>div]:h-full`}
    >
      <CarouselContent className="ml-0 h-full w-full">
        {images.map((img, idx) => (
          <CarouselItem key={idx} className="relative h-full w-full pl-0">
            <Image
              src={img.src}
              alt={img.alt || altText}
              fill
              className={resolvedImageClassName}
              sizes={sizes}
              unoptimized={!sizes}
              loading="lazy"
            />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}

export default function ImageCarousel({
  images,
  altText,
  className = "h-full w-full",
  imageClassName,
  sizes,
  autoplayDelay,
  playOnHover = false,
  isHovered = false,
}: ImageCarouselProps) {
  if (playOnHover) {
    return (
      <HoverFadeImageCarousel
        key={isHovered ? "playing" : "idle"}
        images={images}
        altText={altText}
        className={className}
        imageClassName={imageClassName}
        sizes={sizes}
        autoplayDelay={autoplayDelay ?? 1000}
        isHovered={isHovered}
      />
    )
  }

  return (
    <AutoplayImageCarousel
      images={images}
      altText={altText}
      className={className}
      imageClassName={imageClassName}
      sizes={sizes}
      autoplayDelay={autoplayDelay ?? 5000}
    />
  )
}
