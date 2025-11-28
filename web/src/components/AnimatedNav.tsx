import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'

interface NavItem {
  label: string
  href?: string
  onClick?: () => void
}

interface AnimatedNavProps {
  items: NavItem[]
  activeHref?: string
  baseColor?: string
  pillColor?: string
  hoverTextColor?: string
  ease?: string
}

const AnimatedNav = ({
  items,
  activeHref,
  baseColor = '#fff',
  pillColor = 'rgba(132, 0, 255, 0.15)',
  hoverTextColor = '#fff',
  ease = 'power3.out',
}: AnimatedNavProps) => {
  const pillRefs = useRef<(HTMLElement | null)[]>([])
  const circleRefs = useRef<(HTMLSpanElement | null)[]>([])
  const tlRefs = useRef<(gsap.core.Timeline | null)[]>([])
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    pillRefs.current.forEach((pill, i) => {
      if (!pill) return

      const circle = circleRefs.current[i]
      const label = pill.querySelector('.text-normal')
      const altLabel = pill.querySelector('.text-hover')

      if (!circle || !label || !altLabel) return

      // Reset
      gsap.set(circle, { scale: 0, xPercent: -50 })
      gsap.set(label, { y: 0, opacity: 1 })
      gsap.set(altLabel, { y: '100%', opacity: 0 })

      const tl = gsap.timeline({ paused: true })
      tl.to(circle, { scale: 1.5, duration: 0.4, ease }, 0)
      tl.to(label, { y: '-100%', opacity: 0, duration: 0.4, ease }, 0)
      tl.to(altLabel, { y: 0, opacity: 1, duration: 0.4, ease }, 0)

      tlRefs.current[i] = tl
    })
  }, [items, ease])

  const onEnter = (i: number) => {
    setHoveredIndex(i)
    tlRefs.current[i]?.play()
  }

  const onLeave = (i: number) => {
    setHoveredIndex(null)
    tlRefs.current[i]?.reverse()
  }

  return (
    <nav className="flex items-center gap-2">
      {items.map((item, i) => {
        const isActive = activeHref === item.href
        const isHovered = hoveredIndex === i
        const showBorder = isActive || isHovered

        const commonProps = {
          ref: (el: HTMLElement | null) => {
            pillRefs.current[i] = el
          },
          onMouseEnter: () => onEnter(i),
          onMouseLeave: () => onLeave(i),
          className:
            'relative group px-5 py-2 rounded-full font-semibold text-sm uppercase cursor-pointer overflow-hidden transition-all',
          style: {
            background: pillColor,
            color: baseColor,
            position: 'relative' as const,
            border: `1px solid rgba(132, 0, 255, ${showBorder ? 0.6 : 0.3})`,
          },
        }

        const content = (
          <>
            {/* Hover Background */}
            <span
              ref={(el: HTMLSpanElement | null) => {
                circleRefs.current[i] = el
              }}
              className="absolute w-32 h-32 rounded-full -bottom-4 left-1/2"
              style={{
                background: 'rgba(132, 0, 255, 0.4)',
                transform: 'translateX(-50%)',
                zIndex: 1,
              }}
            />

            {/* Text stack */}
            <span style={{ position: 'relative', zIndex: 2, overflow: 'hidden', display: 'block', height: '1.5em' }}>
              <span className="text-normal block relative" style={{ willChange: 'transform' }}>
                {item.label}
              </span>
              <span
                className="text-hover absolute left-0 top-0 block w-full"
                style={{ color: hoverTextColor, willChange: 'transform' }}
              >
                {item.label}
              </span>
            </span>

            {/* Active Indicator */}
            {isActive && (
              <span
                className="absolute w-2 h-2 rounded-full left-1/2 -bottom-2"
                style={{
                  background: 'rgba(132, 0, 255, 0.8)',
                  transform: 'translateX(-50%)',
                  boxShadow: '0 0 8px rgba(132, 0, 255, 0.6)',
                }}
              />
            )}
          </>
        )

        if (item.href && !item.onClick) {
          return (
            <Link
              key={item.href || i}
              to={item.href}
              ref={(el: HTMLElement | null) => {
                pillRefs.current[i] = el
              }}
              onMouseEnter={() => onEnter(i)}
              onMouseLeave={() => onLeave(i)}
              className="relative group px-5 py-2 rounded-full font-semibold text-sm uppercase cursor-pointer overflow-hidden transition-all"
              style={{
                background: pillColor,
                color: baseColor,
                position: 'relative' as const,
                border: `1px solid rgba(132, 0, 255, ${showBorder ? 0.6 : 0.3})`,
              }}
            >
              {content}
            </Link>
          )
        }

        return (
          <button key={item.href || i} onClick={item.onClick} {...commonProps}>
            {content}
          </button>
        )
      })}
    </nav>
  )
}

export default AnimatedNav

