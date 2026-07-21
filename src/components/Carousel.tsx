import { motion, type PanInfo } from 'framer-motion'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  images: string[]
  alt?: string
  className?: string
}

const DRAG_THRESHOLD = 50

export default function Carousel({ images, alt = '', className = '' }: Props) {
  const [index, setIndex] = useState(0)

  if (images.length === 0) return null

  const canPrev = index > 0
  const canNext = index < images.length - 1

  function goTo(next: number) {
    setIndex(Math.min(Math.max(next, 0), images.length - 1))
  }

  function handleDragEnd(_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (info.offset.x <= -DRAG_THRESHOLD) {
      goTo(index + 1)
    } else if (info.offset.x >= DRAG_THRESHOLD) {
      goTo(index - 1)
    }
  }

  return (
    <div className={`relative overflow-hidden rounded-[28px] bg-slate-100 ${className}`}>
      <motion.div
        className="flex h-full cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'pan-y' }}
        drag={images.length > 1 ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        animate={{ x: `-${index * 100}%` }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={alt ? `${alt} - foto ${i + 1}` : `foto ${i + 1}`}
            draggable={false}
            className="h-full w-full flex-shrink-0 object-cover"
          />
        ))}
      </motion.div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            disabled={!canPrev}
            aria-label="Foto anterior"
            className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm transition disabled:opacity-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            disabled={!canNext}
            aria-label="Próxima foto"
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm transition disabled:opacity-0"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ir para foto ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === index ? 'w-6 bg-white' : 'w-2 bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
