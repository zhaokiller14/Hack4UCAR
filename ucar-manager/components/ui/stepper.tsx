"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface StepProps {
  step: number;
  currentStep: number;
  title: string;
  description?: string;
  isCompleted?: boolean;
}

export function Stepper({
  steps,
  currentStep,
  className,
}: {
  steps: Array<{ step: number; title: string; description?: string }>;
  currentStep: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between w-full", className)}>
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.step;
        const isCurrent = currentStep === step.step;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={step.step}>
            <div className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  isCompleted &&
                    "bg-[#1B4F6B] border-[#1B4F6B] text-white",
                  isCurrent &&
                    "bg-white border-[#1B4F6B] text-[#1B4F6B] shadow-md",
                  !isCompleted &&
                    !isCurrent &&
                    "bg-gray-100 border-gray-300 text-gray-400"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{step.step}</span>
                )}
              </div>
              <div className="mt-2 text-center">
                <p
                  className={cn(
                    "text-sm font-medium transition-colors duration-300",
                    isCompleted || isCurrent
                      ? "text-[#0D2B3E]"
                      : "text-gray-400"
                  )}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p
                    className={cn(
                      "text-xs mt-1 transition-colors duration-300",
                      isCompleted || isCurrent
                        ? "text-gray-600"
                        : "text-gray-300"
                    )}
                  >
                    {step.description}
                  </p>
                )}
              </div>
            </div>
            {!isLast && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-4 transition-colors duration-300",
                  isCompleted ? "bg-[#1B4F6B]" : "bg-gray-200"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}