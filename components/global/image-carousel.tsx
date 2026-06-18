/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Image from "next/image"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

interface ImageCarouselProps {
  images: any[]
  altText: string
  className?: string
  imageClassName?: string
  sizes?: string
}

export default function ImageCarousel({
  images,
  altText,
  className = "h-full w-full",
  imageClassName = "relative block aspect-square h-auto max-w-full object-cover align-middle transition-opacity duration-200",
  sizes,
}: ImageCarouselProps) {
  return (
    <Carousel
      opts={{ loop: true, dragFree: false }}
      plugins={[Autoplay({ delay: 5000 })]}
      className={`${className} [&>div]:h-full`}
    >
      <CarouselContent className="ml-0 h-full w-full">
        {images.map((img, idx) => (
          <CarouselItem key={idx} className="relative h-full w-full pl-0">
            <Image
              src={img.src}
              alt={img.alt || altText}
              fill
              className={imageClassName}
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
