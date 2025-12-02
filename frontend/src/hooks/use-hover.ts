"use client";

import { useState, useRef, useEffect, useCallback, RefObject } from "react";

interface UseHoverOptions {
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  delay?: number;
}

interface UseHoverReturn<T extends HTMLElement> {
  ref: RefObject<T>;
  isHovered: boolean;
  hoverProps: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
  };
}

export function useHover<T extends HTMLElement = HTMLDivElement>(
  options: UseHoverOptions = {}
): UseHoverReturn<T> {
  const { onHoverStart, onHoverEnd, delay = 0 } = options;
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<T>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleHoverStart = useCallback(() => {
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsHovered(true);
        onHoverStart?.();
      }, delay);
    } else {
      setIsHovered(true);
      onHoverStart?.();
    }
  }, [delay, onHoverStart]);

  const handleHoverEnd = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHovered(false);
    onHoverEnd?.();
  }, [onHoverEnd]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ref,
    isHovered,
    hoverProps: {
      onMouseEnter: handleHoverStart,
      onMouseLeave: handleHoverEnd,
      onFocus: handleHoverStart,
      onBlur: handleHoverEnd,
    },
  };
}

// Hook for tracking mouse position within an element
interface UseMousePositionReturn<T extends HTMLElement> {
  ref: RefObject<T>;
  x: number;
  y: number;
  isInside: boolean;
}

export function useMousePosition<T extends HTMLElement = HTMLDivElement>(): UseMousePositionReturn<T> {
  const ref = useRef<T>(null);
  const [position, setPosition] = useState({ x: 0, y: 0, isInside: false });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      setPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        isInside: true,
      });
    };

    const handleMouseLeave = () => {
      setPosition((prev) => ({ ...prev, isInside: false }));
    };

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return { ref, ...position };
}

// Hook for press/active state
export function usePress() {
  const [isPressed, setIsPressed] = useState(false);

  const pressProps = {
    onMouseDown: () => setIsPressed(true),
    onMouseUp: () => setIsPressed(false),
    onMouseLeave: () => setIsPressed(false),
    onTouchStart: () => setIsPressed(true),
    onTouchEnd: () => setIsPressed(false),
  };

  return { isPressed, pressProps };
}
