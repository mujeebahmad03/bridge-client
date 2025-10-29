"use client";

import { X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { AboutYouStep } from "./about-you-step";
import { YourCompanyStep } from "./your-company-step";
import { type OnboardingFormData } from "@/onboarding/types";

interface OnboardingModalProps {
  onClose: () => void;
}

export function OnboardingModal({ onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<OnboardingFormData>({
    // Step 1: About You
    howYouHeardAboutUs: "",
    howYouHeardAboutUsOther: "",
    role: "",
    workType: [],
    // Step 2: Your Company
    companySize: "",
    salesReps: "",
    teamMembers: [],
  });

  const totalSteps = 2;

  const handleNext = (): void => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Onboarding complete
      onClose();
    }
  };

  const handleBack = (): void => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormChange = (
    field: string,
    value: string | string[] | Array<{ email: string; role: string }>
  ): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-foreground/10 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex border border-border">
        {/* Left side - Form */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-12">
            {Array.from({ length: totalSteps }).map((_, index) => {
              const stepNum = index + 1;
              const isCompleted = stepNum < currentStep;
              const isActive = stepNum === currentStep;

              return (
                <div key={stepNum} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                      isCompleted
                        ? "bg-primary text-primary-foreground"
                        : isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? "✓" : stepNum}
                  </div>
                  {stepNum < totalSteps && (
                    <div
                      className={`w-12 h-1 mx-2 transition ${isCompleted ? "bg-primary" : "bg-muted"}`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Form content */}
          <div className="min-h-96">
            {currentStep === 1 && (
              <AboutYouStep data={formData} onChange={handleFormChange} />
            )}
            {currentStep === 2 && (
              <YourCompanyStep data={formData} onChange={handleFormChange} />
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-4 mt-12">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1">
              {currentStep === totalSteps ? "Complete" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
