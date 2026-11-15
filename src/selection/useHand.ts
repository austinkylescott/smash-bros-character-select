/**
 * The hand as the pointer drives it, for any template: where it is on the stage, and whether a
 * gesture on a token was a drag (drop where it lands) or a tap (keep holding until the next tap).
 */
import { ref, type Ref } from "vue";

export interface Point {
  readonly x: number;
  readonly y: number;
}

/** How the hand was last moved. The glove is drawn for the mouse and keyboard, not for touch. */
export type HandInput = "mouse" | "touch" | "keyboard";

/** Further than this, in stage pixels, and a press on a token is a drag rather than a tap. */
const DRAG_DISTANCE = 12;
/** How long after a press on a token its trailing click may still arrive, in milliseconds. */
const CLICK_DELAY = 300;

/**
 * Stops the click that follows a press on a token. Picking up the token takes it from under the
 * pointer, so the browser would otherwise deliver that click to the slot beneath, choosing it.
 */
function swallowTrailingClick() {
  const swallow = (event: Event) => {
    event.stopPropagation();
    event.preventDefault();
    stop();
  };
  const stop = () => {
    window.removeEventListener("click", swallow, true);
    window.removeEventListener("pointerdown", stop, true);
  };
  window.addEventListener("click", swallow, true);
  window.addEventListener("pointerdown", stop, true);
  setTimeout(stop, CLICK_DELAY);
}

export function useHand(root: Ref<HTMLElement | null>, stageWidth: number, start: Point) {
  const position = ref<Point>(start);
  const input = ref<HandInput>("mouse");
  /**
   * Whether the mouse is over the stage, where it replaces the system cursor. True at first, so
   * the hand is seen resting where it starts until the mouse leaves.
   */
  const inside = ref(true);
  function toStage(event: { clientX: number; clientY: number }): Point {
    const rect = root.value!.getBoundingClientRect();
    const scale = rect.width / stageWidth;
    return { x: (event.clientX - rect.left) / scale, y: (event.clientY - rect.top) / scale };
  }

  function follow(event: PointerEvent) {
    position.value = toStage(event);
    input.value = event.pointerType === "mouse" ? "mouse" : "touch";
    inside.value = true;
  }

  /** Puts the hand on a point without the pointer, as the keyboard does. */
  function moveTo(point: Point) {
    position.value = point;
    input.value = "keyboard";
  }

  /**
   * Follows a press that has just picked up a token. If it is dragged and let go, `onDrop` is
   * given the element under the pointer; a press let go where it started does nothing.
   */
  function drag(event: PointerEvent, onDrop: (target: Element | null) => void) {
    follow(event);
    const from = toStage(event);
    const move = (moved: PointerEvent) => follow(moved);
    const end = (ended: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      swallowTrailingClick();
      const to = toStage(ended);
      if (
        ended.type === "pointercancel" ||
        Math.hypot(to.x - from.x, to.y - from.y) < DRAG_DISTANCE
      )
        return;
      onDrop(document.elementFromPoint(ended.clientX, ended.clientY));
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  }

  return {
    position,
    input,
    inside,
    follow,
    leave: () => (inside.value = false),
    moveTo,
    drag,
  };
}
