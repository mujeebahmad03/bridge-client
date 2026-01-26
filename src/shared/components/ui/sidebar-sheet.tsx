import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Non-modal "sheet" that behaves like a sidebar:
 * - No overlay/backdrop
 * - Allows interacting with the page while open
 * - Keeps the same SheetContent styling/animations as the standard Sheet
 */
const SidebarSheet = (
  props: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>
) => {
  return <DialogPrimitive.Root modal={false} {...props} />;
};

const SidebarSheetTrigger = DialogPrimitive.Trigger;
const SidebarSheetClose = DialogPrimitive.Close;
const SidebarSheetPortal = DialogPrimitive.Portal;

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
);

interface SidebarSheetContentProps
  extends
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SidebarSheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SidebarSheetContentProps
>(
  (
    {
      side = "right",
      className,
      children,
      onInteractOutside,
      onPointerDownOutside,
      onFocusOutside,
      ...props
    },
    ref
  ) => (
    <SidebarSheetPortal>
      <DialogPrimitive.Content
        ref={ref}
        className={cn(sheetVariants({ side }), className)}
        // Keep sidebar open while user interacts with the page.
        onInteractOutside={(e) => {
          e.preventDefault();
          onInteractOutside?.(e);
        }}
        onPointerDownOutside={(e) => {
          e.preventDefault();
          onPointerDownOutside?.(e);
        }}
        onFocusOutside={(e) => {
          e.preventDefault();
          onFocusOutside?.(e);
        }}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-secondary hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </SidebarSheetPortal>
  )
);
SidebarSheetContent.displayName = DialogPrimitive.Content.displayName;

const SidebarSheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
SidebarSheetHeader.displayName = "SidebarSheetHeader";

const SidebarSheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
SidebarSheetFooter.displayName = "SidebarSheetFooter";

const SidebarSheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
));
SidebarSheetTitle.displayName = DialogPrimitive.Title.displayName;

const SidebarSheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
SidebarSheetDescription.displayName = DialogPrimitive.Description.displayName;

export {
  SidebarSheet,
  SidebarSheetClose,
  SidebarSheetContent,
  SidebarSheetDescription,
  SidebarSheetFooter,
  SidebarSheetHeader,
  SidebarSheetPortal,
  SidebarSheetTitle,
  SidebarSheetTrigger,
};
