/**
 * Accessibility utilities for the LiteLLM Dashboard
 *
 * This file provides helper functions and constants for implementing
 * accessible UI patterns consistently across the application.
 */

// ============================================================================
// Screen Reader Utilities
// ============================================================================

/**
 * Announces a message to screen readers using an ARIA live region
 * Use this for dynamic content updates that users should be aware of
 *
 * @param message - The message to announce
 * @param priority - "polite" waits for idle, "assertive" interrupts
 */
export function announceToScreenReader(
  message: string,
  priority: "polite" | "assertive" = "polite"
): void {
  // Create or find existing announcer element
  let announcer = document.getElementById("sr-announcer");

  if (!announcer) {
    announcer = document.createElement("div");
    announcer.id = "sr-announcer";
    announcer.setAttribute("aria-live", priority);
    announcer.setAttribute("aria-atomic", "true");
    announcer.className = "sr-only"; // Visually hidden but screen reader accessible
    announcer.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;
    document.body.appendChild(announcer);
  }

  // Update priority if needed
  announcer.setAttribute("aria-live", priority);

  // Clear and set message (timeout ensures screen readers pick up the change)
  announcer.textContent = "";
  setTimeout(() => {
    announcer!.textContent = message;
  }, 100);
}

// ============================================================================
// Focus Management
// ============================================================================

/**
 * Traps focus within a container element (useful for modals)
 * Returns a cleanup function to remove the trap
 *
 * @param container - The element to trap focus within
 * @returns Cleanup function
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = getFocusableElements(container);

  if (focusableElements.length === 0) return () => {};

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Tab") return;

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  container.addEventListener("keydown", handleKeyDown);

  // Focus first element
  firstElement.focus();

  return () => {
    container.removeEventListener("keydown", handleKeyDown);
  };
}

/**
 * Gets all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled]):not([type='hidden'])",
    "select:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(", ");

  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => !el.hasAttribute("disabled") && el.offsetParent !== null
  );
}

/**
 * Restores focus to a previously focused element
 * Useful when closing modals or dialogs
 */
export function restoreFocus(element: HTMLElement | null): void {
  if (element && typeof element.focus === "function") {
    // Delay to ensure element is still in DOM
    setTimeout(() => {
      element.focus();
    }, 0);
  }
}

// ============================================================================
// ARIA Helpers
// ============================================================================

/**
 * Generates a unique ID for ARIA relationships
 */
let idCounter = 0;
export function generateAriaId(prefix = "aria"): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

/**
 * Props for elements that describe another element
 */
export interface AriaDescribedByProps {
  id: string;
  "aria-describedby": string;
}

/**
 * Creates paired IDs for aria-describedby relationships
 */
export function createAriaDescribedBy(prefix = "desc"): {
  descriptionId: string;
  describedByProps: { "aria-describedby": string };
} {
  const descriptionId = generateAriaId(prefix);
  return {
    descriptionId,
    describedByProps: { "aria-describedby": descriptionId },
  };
}

/**
 * Props for expanded/collapsed elements
 */
export function getExpandedProps(isExpanded: boolean): {
  "aria-expanded": boolean;
} {
  return { "aria-expanded": isExpanded };
}

// ============================================================================
// Common ARIA Patterns
// ============================================================================

/**
 * ARIA props for a button that opens a menu
 */
export function getMenuButtonProps(
  isOpen: boolean,
  menuId: string
): {
  "aria-haspopup": "menu";
  "aria-expanded": boolean;
  "aria-controls": string;
} {
  return {
    "aria-haspopup": "menu",
    "aria-expanded": isOpen,
    "aria-controls": menuId,
  };
}

/**
 * ARIA props for a button that opens a dialog
 */
export function getDialogTriggerProps(dialogId: string): {
  "aria-haspopup": "dialog";
  "aria-controls": string;
} {
  return {
    "aria-haspopup": "dialog",
    "aria-controls": dialogId,
  };
}

/**
 * ARIA props for a dialog/modal
 */
export function getDialogProps(
  titleId: string,
  descriptionId?: string
): {
  role: "dialog";
  "aria-modal": true;
  "aria-labelledby": string;
  "aria-describedby"?: string;
} {
  const props: {
    role: "dialog";
    "aria-modal": true;
    "aria-labelledby": string;
    "aria-describedby"?: string;
  } = {
    role: "dialog",
    "aria-modal": true,
    "aria-labelledby": titleId,
  };

  if (descriptionId) {
    props["aria-describedby"] = descriptionId;
  }

  return props;
}

/**
 * ARIA props for loading states
 */
export function getLoadingProps(isLoading: boolean): {
  "aria-busy": boolean;
  "aria-live"?: "polite";
} {
  if (isLoading) {
    return { "aria-busy": true };
  }
  return { "aria-busy": false, "aria-live": "polite" };
}

// ============================================================================
// Keyboard Navigation Helpers
// ============================================================================

/**
 * Key codes for common navigation keys
 */
export const Keys = {
  Enter: "Enter",
  Space: " ",
  Escape: "Escape",
  ArrowUp: "ArrowUp",
  ArrowDown: "ArrowDown",
  ArrowLeft: "ArrowLeft",
  ArrowRight: "ArrowRight",
  Tab: "Tab",
  Home: "Home",
  End: "End",
} as const;

/**
 * Handles arrow key navigation in a list
 */
export function handleArrowNavigation(
  event: KeyboardEvent,
  currentIndex: number,
  totalItems: number,
  onNavigate: (newIndex: number) => void
): void {
  let newIndex = currentIndex;

  switch (event.key) {
    case Keys.ArrowDown:
      event.preventDefault();
      newIndex = (currentIndex + 1) % totalItems;
      break;
    case Keys.ArrowUp:
      event.preventDefault();
      newIndex = (currentIndex - 1 + totalItems) % totalItems;
      break;
    case Keys.Home:
      event.preventDefault();
      newIndex = 0;
      break;
    case Keys.End:
      event.preventDefault();
      newIndex = totalItems - 1;
      break;
    default:
      return;
  }

  onNavigate(newIndex);
}
