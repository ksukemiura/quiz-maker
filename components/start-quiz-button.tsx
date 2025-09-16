"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";

type StartQuizButtonProps = ButtonProps & {
  href: string;
  startingLabel?: string;
};

export default function StartQuizButton({
  href,
  startingLabel = "Starting...",
  children = "Start Quiz",
  disabled,
  onClick,
  ...buttonProps
}: StartQuizButtonProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  return (
    <Button
      {...buttonProps}
      disabled={disabled || isNavigating}
      onClick={(event) => {
        onClick?.(event);

        if (event.defaultPrevented || isNavigating) {
          return;
        }

        setIsNavigating(true);
        router.push(href);
      }}
    >
      {isNavigating ? startingLabel : children}
    </Button>
  );
}
