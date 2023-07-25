import { useEffect, useRef, useCallback, useState, useMemo, CSSProperties } from "react";
import type { VirtualElement } from "@popperjs/core";
import { usePopper } from "react-popper";
import * as PopperJS from "@popperjs/core";

export type TriggerType = "click" | "right-click" | "hover" | "focus";

export type Config = {
  /**
   * Whether to close the tooltip when its trigger is out of boundary
   * @default false
   */
  closeOnTriggerHidden?: boolean;
  /**
   * Event or events that trigger the tooltip
   * @default hover
   */
  trigger?: TriggerType | TriggerType[] | null;
  /**
   * Delay in hiding the tooltip (ms)
   * @default 0
   */
  delayHide?: number;
  /**
   * Delay in showing the tooltip (ms)
   * @default 0
   */
  delayShow?: number;
  /**
   * Whether to make the tooltip spawn at cursor position
   * @default false
   */
  followCursor?: boolean;
  /**
   * Options to MutationObserver, used internally for updating
   * tooltip position based on its DOM changes
   * @default  { attributes: true, childList: true, subtree: true }
   */
  mutationObserverOptions?: MutationObserverInit | null;
  /**
   * Whether tooltip is shown by default
   * @default false
   */
  defaultVisible?: boolean;
  /**
   * Used to create controlled tooltip
   */
  visible?: boolean;
  /**
   * Called when the visibility of the tooltip changes
   */
  onVisibleChange?: (state: boolean) => void;
  /**
   * If `true`, a click outside the trigger element closes the tooltip
   * @default true
   */
  closeOnOutsideClick?: boolean;
  /**
   * If `true`, hovering the tooltip will keep it open. Normally tooltip closes when the mouse cursor moves out of
   * the trigger element. If it moves to the tooltip element, the tooltip stays open.
   * @default false
   */
  interactive?: boolean;
  /**
   * Alias for popper.js placement, see https://popper.js.org/docs/v2/constructors/#placement
   */
  placement?: PopperJS.Placement;
  /**
   * Shorthand for popper.js offset modifier, see https://popper.js.org/docs/v2/modifiers/offset/
   * @default [0, 6]
   */
  offset?: [number, number];
};

export type PopperOptions = Partial<PopperJS.Options> & {
  createPopper?: typeof PopperJS.createPopper;
};

export type PropsGetterArgs = {
  style?: CSSProperties;
  [key: string]: unknown;
};

function useGetLatest<T>(val: T) {
  const ref = useRef<T>(val);
  ref.current = val;
  return useCallback(() => ref.current, []);
}

const noop = () => {
  // do nothing
};

function useControlledState<T>({
  initial,
  value,
  onChange = noop
}: {
  initial?: T;
  value?: T;
  onChange?: (state: T) => void;
}): [T, (state: T) => void] {
  if (initial === undefined && value === undefined) {
    throw new TypeError("Either 'value' or 'initial' variable must be set. Now both are undefined");
  }

  const [state, setState] = useState(initial);

  const getLatest = useGetLatest(state);

  const set = useCallback(
    (updater: T) => {
      const state = getLatest();

      const updatedState = typeof updater === "function" ? updater(state) : updater;

      if (typeof updatedState.persist === "function") updatedState.persist();

      setState(updatedState);
      if (typeof onChange === "function") onChange(updatedState);
    },
    [getLatest, onChange]
  );

  const isControlled = value !== undefined;

  return [isControlled ? value! : state!, isControlled ? onChange : set];
}

function generateBoundingClientRect(x = 0, y = 0): () => DOMRect {
  return () => ({
    width: 0,
    height: 0,
    top: y,
    right: x,
    bottom: y,
    left: x,
    x: 0,
    y: 0,
    toJSON: () => null
  });
}

const virtualElement: VirtualElement = {
  getBoundingClientRect: generateBoundingClientRect()
};

const defaultConfig: Config = {
  closeOnOutsideClick: true,
  closeOnTriggerHidden: false,
  defaultVisible: false,
  delayHide: 0,
  delayShow: 0,
  followCursor: false,
  interactive: false,
  mutationObserverOptions: {
    attributes: true,
    childList: true,
    subtree: true
  },
  offset: [0, 6],
  trigger: "hover"
};

export function usePopperTooltip(config: Config = {}, popperOptions: PopperOptions = {}) {
  // Merging options with default options.
  // Keys with undefined values are replaced with the default ones if any.
  // Keys with other values pass through.
  const finalConfig = (Object.keys(defaultConfig) as Array<keyof typeof defaultConfig>).reduce(
    (config, key) => ({
      ...config,
      [key]: config[key] !== undefined ? config[key] : defaultConfig[key]
    }),
    config
  );

  const defaultModifiers = useMemo(
    () => [{ name: "offset", options: { offset: finalConfig.offset } }],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    Array.isArray(finalConfig.offset) ? finalConfig.offset : []
  );

  const finalPopperOptions = {
    ...popperOptions,
    placement: popperOptions.placement || finalConfig.placement,
    modifiers: popperOptions.modifiers || defaultModifiers
  };

  const [triggerRef, setTriggerRef] = useState<HTMLElement | null>(null);
  const [tooltipRef, setTooltipRef] = useState<HTMLElement | null>(null);
  const [visible, setVisible] = useControlledState({
    initial: finalConfig.defaultVisible,
    value: finalConfig.visible,
    onChange: finalConfig.onVisibleChange
  });

  const timer = useRef<number>();
  useEffect(() => () => clearTimeout(timer.current), []);

  const { styles, attributes, ...popperProps } = usePopper(finalConfig.followCursor ? virtualElement : triggerRef, tooltipRef, finalPopperOptions);

  const update = popperProps.update;

  const getLatest = useGetLatest({
    visible,
    triggerRef,
    tooltipRef,
    finalConfig
  });

  const isTriggeredBy = useCallback(
    (trigger: TriggerType) => {
      return Array.isArray(finalConfig.trigger) ? finalConfig.trigger.includes(trigger) : finalConfig.trigger === trigger;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    Array.isArray(finalConfig.trigger) ? finalConfig.trigger : [finalConfig.trigger]
  );

  const hideTooltip = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setVisible(false), finalConfig.delayHide);
  }, [finalConfig.delayHide, setVisible]);

  const showTooltip = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setVisible(true), finalConfig.delayShow);
  }, [finalConfig.delayShow, setVisible]);

  const toggleTooltip = useCallback(() => {
    if (getLatest().visible) {
      hideTooltip();
    } else {
      showTooltip();
    }
  }, [getLatest, hideTooltip, showTooltip]);

  // Handle click outside
  useEffect(() => {
    if (!getLatest().finalConfig.closeOnOutsideClick) return;

    const handleClickOutside: EventListener = (event) => {
      const { tooltipRef, triggerRef } = getLatest();
      const target = event.composedPath?.()?.[0] || event.target;
      if (target instanceof Node) {
        if (tooltipRef != null && triggerRef != null && !tooltipRef.contains(target) && !triggerRef.contains(target)) {
          hideTooltip();
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [getLatest, hideTooltip]);

  // Trigger: click
  useEffect(() => {
    if (triggerRef == null || !isTriggeredBy("click")) return;

    triggerRef.addEventListener("click", toggleTooltip);

    return () => triggerRef.removeEventListener("click", toggleTooltip);
  }, [triggerRef, isTriggeredBy, toggleTooltip]);

  // Trigger: right-click
  useEffect(() => {
    if (triggerRef == null || !isTriggeredBy("right-click")) return;

    const preventDefaultAndToggle: EventListener = (event) => {
      // Don"t show the context menu
      event.preventDefault();
      toggleTooltip();
    };

    triggerRef.addEventListener("contextmenu", preventDefaultAndToggle);
    return () => triggerRef.removeEventListener("contextmenu", preventDefaultAndToggle);
  }, [triggerRef, isTriggeredBy, toggleTooltip]);

  // Trigger: focus
  useEffect(() => {
    if (triggerRef == null || !isTriggeredBy("focus")) return;

    triggerRef.addEventListener("focus", showTooltip);
    triggerRef.addEventListener("blur", hideTooltip);
    return () => {
      triggerRef.removeEventListener("focus", showTooltip);
      triggerRef.removeEventListener("blur", hideTooltip);
    };
  }, [triggerRef, isTriggeredBy, showTooltip, hideTooltip]);

  // Trigger: hover on trigger
  useEffect(() => {
    if (triggerRef == null || !isTriggeredBy("hover")) return;

    triggerRef.addEventListener("mouseenter", showTooltip);
    triggerRef.addEventListener("mouseleave", hideTooltip);
    return () => {
      triggerRef.removeEventListener("mouseenter", showTooltip);
      triggerRef.removeEventListener("mouseleave", hideTooltip);
    };
  }, [triggerRef, isTriggeredBy, showTooltip, hideTooltip]);

  // Trigger: hover on tooltip, keep it open if hovered
  useEffect(() => {
    if (tooltipRef == null || !getLatest().finalConfig.interactive) return;

    tooltipRef.addEventListener("mouseenter", showTooltip);
    tooltipRef.addEventListener("mouseleave", hideTooltip);
    return () => {
      tooltipRef.removeEventListener("mouseenter", showTooltip);
      tooltipRef.removeEventListener("mouseleave", hideTooltip);
    };
  }, [tooltipRef, showTooltip, hideTooltip, getLatest]);

  // Handle closing tooltip if trigger hidden
  const isReferenceHidden = popperProps?.state?.modifiersData?.hide?.isReferenceHidden;
  useEffect(() => {
    if (finalConfig.closeOnTriggerHidden && isReferenceHidden) hideTooltip();
  }, [finalConfig.closeOnTriggerHidden, hideTooltip, isReferenceHidden]);

  // Handle follow cursor
  useEffect(() => {
    if (!finalConfig.followCursor || triggerRef == null) return;

    function setMousePosition({ clientX, clientY }: { clientX: number; clientY: number }) {
      virtualElement.getBoundingClientRect = generateBoundingClientRect(clientX, clientY);
      update?.();
    }

    triggerRef.addEventListener("mousemove", setMousePosition);
    return () => triggerRef.removeEventListener("mousemove", setMousePosition);
  }, [finalConfig.followCursor, triggerRef, update]);

  // Handle tooltip DOM mutation changes (aka mutation observer)
  useEffect(() => {
    if (tooltipRef == null || update == null || finalConfig.mutationObserverOptions == null) return;

    const observer = new MutationObserver(update);
    observer.observe(tooltipRef, finalConfig.mutationObserverOptions);
    return () => observer.disconnect();
  }, [finalConfig.mutationObserverOptions, tooltipRef, update]);

  // Tooltip props getter
  const getTooltipProps = (args: PropsGetterArgs = {}) => {
    return {
      ...args,
      style: {
        ...args.style,
        ...styles.popper
      },
      ...attributes.popper,
      "data-popper-interactive": finalConfig.interactive
    };
  };

  // Arrow props getter
  const getArrowProps = (args: PropsGetterArgs = {}) => {
    return {
      ...args,
      ...attributes.arrow,
      style: {
        ...args.style,
        ...styles.arrow
      },
      "data-popper-arrow": true
    };
  };

  return {
    getArrowProps,
    getTooltipProps,
    setTooltipRef,
    setTriggerRef,
    tooltipRef,
    triggerRef,
    visible,
    ...popperProps
  };
}
