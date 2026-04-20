import { useCallback, useRef, type DragEvent, type MouseEvent, type PointerEvent } from "react";

type SwipeState = {
  active: boolean;
  pointerId: number | null;
  startX: number;
  startY: number;
  startScrollTop: number;
  moved: boolean;
  captured: boolean;
  suppressClick: boolean;
  targetEl: HTMLElement | null;
};

const DEFAULT_STATE: SwipeState = {
  active: false,
  pointerId: null,
  startX: 0,
  startY: 0,
  startScrollTop: 0,
  moved: false,
  captured: false,
  suppressClick: false,
  targetEl: null,
};

const DRAG_THRESHOLD_PX = 6;
const DIRECTION_LOCK_OFFSET_PX = 2;

function isVerticalScrollable(element: HTMLElement) {
  const style = window.getComputedStyle(element);
  const canScrollY = style.overflowY === "auto" || style.overflowY === "scroll" || style.overflowY === "overlay";
  return canScrollY && element.scrollHeight > element.clientHeight + 1;
}

function findScrollableParent(target: EventTarget | null, boundary: HTMLElement) {
  let node = target instanceof HTMLElement ? target : null;
  while (node) {
    if (isVerticalScrollable(node)) return node;
    if (node === boundary) break;
    node = node.parentElement;
  }
  return isVerticalScrollable(boundary) ? boundary : null;
}

function isFormField(target: EventTarget | null, boundary: HTMLElement) {
  if (!(target instanceof HTMLElement)) return false;
  const field = target.closest("input, textarea, select, [contenteditable='true']");
  return Boolean(field && boundary.contains(field));
}

export function useWebSwipeScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const stateRef = useRef<SwipeState>(DEFAULT_STATE);

  const resetState = useCallback(() => {
    stateRef.current.active = false;
    stateRef.current.pointerId = null;
    stateRef.current.captured = false;
    stateRef.current.targetEl = null;
  }, []);

  const onPointerDown = useCallback((event: PointerEvent<T>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const boundary = ref.current;
    if (!boundary || isFormField(event.target, boundary)) return;

    const scrollTarget = findScrollableParent(event.target, boundary);
    if (!scrollTarget) return;

    stateRef.current.active = true;
    stateRef.current.pointerId = event.pointerId;
    stateRef.current.startX = event.clientX;
    stateRef.current.startY = event.clientY;
    stateRef.current.startScrollTop = scrollTarget.scrollTop;
    stateRef.current.moved = false;
    stateRef.current.captured = false;
    stateRef.current.suppressClick = false;
    stateRef.current.targetEl = scrollTarget;
  }, []);

  const onPointerMove = useCallback((event: PointerEvent<T>) => {
    const boundary = ref.current;
    const state = stateRef.current;
    if (!boundary || !state.active || state.pointerId !== event.pointerId || !state.targetEl) return;

    const deltaX = event.clientX - state.startX;
    const deltaY = event.clientY - state.startY;

    if (!state.moved) {
      const passedThreshold = Math.abs(deltaY) >= DRAG_THRESHOLD_PX;
      const verticalDominant = Math.abs(deltaY) > Math.abs(deltaX) + DIRECTION_LOCK_OFFSET_PX;
      if (!passedThreshold || !verticalDominant) return;

      state.moved = true;
      state.suppressClick = true;
      if (!state.captured) {
        try {
          boundary.setPointerCapture(event.pointerId);
          state.captured = true;
        } catch {
          state.captured = false;
        }
      }
    }

    state.targetEl.scrollTop = state.startScrollTop - deltaY;
    event.preventDefault();
  }, []);

  const onPointerUp = useCallback(
    (event: PointerEvent<T>) => {
      const boundary = ref.current;
      const state = stateRef.current;
      if (boundary && state.pointerId === event.pointerId && state.captured) {
        try {
          boundary.releasePointerCapture(event.pointerId);
        } catch {
          // no-op
        }
      }
      resetState();
    },
    [resetState]
  );

  const onPointerCancel = useCallback(() => {
    resetState();
  }, [resetState]);

  const onLostPointerCapture = useCallback(() => {
    resetState();
  }, [resetState]);

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
