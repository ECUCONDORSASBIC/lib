"use client"

import * as React from "react";
import { useState } from "react";

// Simple utility function to join classNames - replace the cn import if it doesn't exist
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
}

// Simple tooltip implementation without external dependencies
const Tooltip = ({ children, content, className, delayDuration = 700, side = "top", ...props }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  let timeout;

  const handleMouseEnter = (e) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      setIsVisible(true);

      // Calculate position
      const rect = e.currentTarget.getBoundingClientRect();
      let x = rect.left + rect.width / 2;
      let y;

      switch (side) {
        case "top":
          y = rect.top - 10;
          break;
        case "bottom":
          y = rect.bottom + 10;
          break;
        case "left":
          x = rect.left - 10;
          y = rect.top + rect.height / 2;
          break;
        case "right":
          x = rect.right + 10;
          y = rect.top + rect.height / 2;
          break;
        default:
          y = rect.top - 10;
      }

      setPosition({ x, y });
    }, delayDuration);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeout);
    setIsVisible(false);
  };

  return (
    <div
      className="inline-block relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      {...props}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 px-3 py-1.5 text-sm bg-popover text-popover-foreground rounded-md shadow-md border",
            side === "top" && "transform -translate-x-1/2 -translate-y-full mb-2",
            side === "bottom" && "transform -translate-x-1/2 mt-2",
            side === "left" && "transform -translate-x-full -translate-y-1/2 mr-2",
            side === "right" && "transform -translate-y-1/2 ml-2",
            className
          )}
          style={{
            left: position.x,
            top: position.y,
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};

// Export dummy components to avoid import errors in existing code
const TooltipProvider = ({ children }) => <>{children}</>;
const TooltipRoot = ({ children }) => <>{children}</>;
const TooltipTrigger = ({ children }) => <>{children}</>;
const TooltipContent = React.forwardRef(({ children, className, ...props }, ref) => (
  <div ref={ref} className={className} {...props}>{children}</div>
));
TooltipContent.displayName = "TooltipContent";

export {
  Tooltip, TooltipContent,
  TooltipProvider, TooltipRoot,
  TooltipTrigger
};

