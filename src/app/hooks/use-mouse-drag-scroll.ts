import {
  useCallback,
  useRef,
  type DragEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";

type DragState = {
  active: boolean;
  pointerId: number | null;
  startX: number;
  startScrollLeft: number;
  moved: boolean;
  captured: boolean;
  suppressClick: boolean;
};

const DEFAULT_STATE: DragState = {
  active: false,
  pointerId: null,
  startX: 0,
  startScrollLeft: 0,
  moved: false,
  captured: false,
  suppressClick: false,
};

const DRAG_THRESHOLD_PX = 6;

export function useMouseDragScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const stateRef = useRef<DragState>(DEFAULT_STATE);

  const resetDragState = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    stateRef.current.active = false;
    stateRef.current.pointerId = null;
    stateRef.current.captured = false;
    el.style.cursor = "grab";
  }, []);

  const onPointerDown = useCallback((event: PointerEvent<T>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const el = ref.current;
    if (!el) return;

    stateRef.current.active = true;
    stateRef.current.pointerId = event.pointerId;
    stateRef.current.startX = event.clientX;
    stateRef.current.startScrollLeft = el.scrollLeft;
    stateRef.current.moved = false;
    stateRef.current.captured = false;
    stateRef.current.suppressClick = false;
  }, []);

  const onPointerMove = useCallback((event: PointerEvent<T>) => {
    const el = ref.current;
    const state = stateRef.current;
    if (!el || !state.active || state.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - state.startX;
    if (!state.moved && Math.abs(deltaX) >= DRAG_THRESHOLD_PX) {
      state.moved = true;
      state.suppressClick = true;
      el.style.cursor = "grabbing";
      if (!state.captured) {
        try {
          el.setPointerCapture(event.pointerId);
          state.captured = true;
        } catch {
          state.captured = false;
        }
      }
    }
    if (!state.moved) return;
    el.scrollLeft = state.startScrollLeft - deltaX;
    event.preventDefault();
  }, []);

  const onPointerUp = useCallback((event: PointerEvent<T>) => {
    const el = ref.current;
    const state = stateRef.current;
    if (el && state.pointerId === event.pointerId && state.captured) {
      try {
        el.releasePointerCapture(event.pointerId);
      } catch {
        // no-op
      }
    }
    resetDragState();
  }, [resetDragState]);

  const onPointerCancel = useCallback(() => {
    resetDragState();
  }, [resetDragState]);

  const onLostPointerCapture = useCallback(() => {
    resetDragState();
  }, [resetDragState]);

  const onClickCapture = useCallback((event: MouseEvent<T>) => {
    if (!stateRef.current.suppressClick) return;
    event.preventDefault();
    event.stopPropagation();
    stateRef.current.suppressClick = false;
  }, []);

  const onDragStart = useCallback((event: DragEvent<T>) => {
    event.preventDefault();
  }, []);

  return {
    ref,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onLostPointerCapture,
      onClickCapture,
      onDragStart,
    },
  };
}
