"use client";

import { X } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

interface SlidePanelContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SlidePanelContext = React.createContext<SlidePanelContextValue | null>(
  null
);

function useSlidePanel() {
  const context = React.useContext(SlidePanelContext);
  if (!context) {
    throw new Error("SlidePanel components must be used within a SlidePanel");
  }
  return context;
}

interface SlidePanelProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

function SlidePanel({ open = false, onOpenChange, children }: SlidePanelProps) {
  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      onOpenChange?.(newOpen);
    },
    [onOpenChange]
  );

  return (
    <SlidePanelContext.Provider
      value={{ open, onOpenChange: handleOpenChange }}
    >
      {children}
    </SlidePanelContext.Provider>
  );
}

interface SlidePanelTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

function SlidePanelTrigger({
  children,
  asChild,
  ...props
}: SlidePanelTriggerProps) {
  const { onOpenChange } = useSlidePanel();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(
      children as React.ReactElement<{ onClick?: () => void }>,
      {
        onClick: () => onOpenChange(true),
      }
    );
  }

  return (
    <button type="button" onClick={() => onOpenChange(true)} {...props}>
      {children}
    </button>
  );
}

interface SlidePanelContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "left" | "right" | "top" | "bottom";
  onEscapeKeyDown?: () => void;
  onInteractOutside?: () => void;
}

function SlidePanelContent({
  className,
  children,
  side = "right",
  onEscapeKeyDown,
  onInteractOutside,
  ...props
}: SlidePanelContentProps) {
  const { open, onOpenChange } = useSlidePanel();
  const [mounted, setMounted] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (open) {
      // Small delay to trigger CSS transition
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    } else {
      setIsVisible(false);
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Handle escape key
  React.useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEscapeKeyDown?.();
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange, onEscapeKeyDown]);

  // Focus trap
  React.useEffect(() => {
    if (!open || !contentRef.current) {
      return;
    }

    const focusableElements = contentRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const [firstFocusable] = focusableElements;
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") {
        return;
      }

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTab);
    firstFocusable?.focus();

    return () => document.removeEventListener("keydown", handleTab);
  }, [open]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onInteractOutside?.();
      onOpenChange(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onInteractOutside?.();
      onOpenChange(false);
    }
  };

  if (!mounted || !open) {
    return null;
  }

  const sideStyles = {
    right: {
      panel: cn(
        "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
        isVisible ? "translate-x-0" : "translate-x-full"
      ),
    },
    left: {
      panel: cn(
        "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
        isVisible ? "translate-x-0" : "-translate-x-full"
      ),
    },
    top: {
      panel: cn(
        "inset-x-0 top-0 h-auto border-b",
        isVisible ? "translate-y-0" : "-translate-y-full"
      ),
    },
    bottom: {
      panel: cn(
        "inset-x-0 bottom-0 h-auto border-t",
        isVisible ? "translate-y-0" : "translate-y-full"
      ),
    },
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
    >
      {/* Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-black/50 transition-opacity duration-300",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={contentRef}
        className={cn(
          "bg-background fixed z-50 flex flex-col gap-4 shadow-lg transition-transform duration-300 ease-out",
          sideStyles[side].panel,
          className
        )}
        {...props}
      >
        {children}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="ring-offset-background focus:ring-ring absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>,
    document.body
  );
}

function SlidePanelHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-1.5 p-4", className)} {...props} />
  );
}

function SlidePanelFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function SlidePanelTitle({
  className,
  children,
  ...props
}: React.PropsWithChildren<React.HTMLAttributes<HTMLHeadingElement>>) {
  return (
    <h2
      className={cn("text-foreground text-lg font-semibold", className)}
      {...props}
    >
      {children ?? "\u00A0"}
    </h2>
  );
}

function SlidePanelDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-muted-foreground text-sm", className)} {...props} />
  );
}

function SlidePanelClose({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { onOpenChange } = useSlidePanel();

  return (
    <button
      type="button"
      onClick={() => onOpenChange(false)}
      className={className}
      {...props}
    />
  );
}

export {
  SlidePanel,
  SlidePanelClose,
  SlidePanelContent,
  SlidePanelDescription,
  SlidePanelFooter,
  SlidePanelHeader,
  SlidePanelTitle,
  SlidePanelTrigger,
};
