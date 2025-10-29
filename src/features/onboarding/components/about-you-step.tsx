"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  hearAboutUsOptions,
  roleOptions,
  workTypeOptions,
} from "@/onboarding/constants";

interface AboutYouStepProps {
  data: {
    howYouHeardAboutUs: string;
    howYouHeardAboutUsOther: string;
    role: string;
    workType: string[];
  };
  onChange: (field: string, value: string | string[]) => void;
}

export function AboutYouStep({ data, onChange }: AboutYouStepProps) {
  const handleWorkTypeToggle = (option: string): void => {
    const newWorkType = data.workType.includes(option)
      ? data.workType.filter((item) => item !== option)
      : [...data.workType, option];
    onChange("workType", newWorkType);
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-foreground mb-2">About you</h2>
      <p className="text-muted-foreground mb-8">
        A few quick questions so we can tailor your experience.
      </p>

      {/* How did you hear about us */}
      <div className="mb-8">
        <Label className="text-sm font-semibold mb-4 block">
          How did you hear about us?
        </Label>
        <div className="flex flex-wrap gap-2 mb-4">
          {hearAboutUsOptions.map((option) => (
            <Button
              key={option}
              variant={
                data.howYouHeardAboutUs === option ? "default" : "outline"
              }
              onClick={() => onChange("howYouHeardAboutUs", option)}
              className="font-medium"
            >
              {option}
            </Button>
          ))}
        </div>
        {data.howYouHeardAboutUs === "Other" && (
          <Input
            type="text"
            placeholder="Please specify where you found us..."
            value={data.howYouHeardAboutUsOther}
            onChange={(e) =>
              onChange("howYouHeardAboutUsOther", e.target.value)
            }
          />
        )}
      </div>

      {/* Role */}
      <div className="mb-8">
        <Label className="text-sm font-semibold mb-4 block">
          Which best describes your role?
        </Label>
        <div className="flex flex-wrap gap-2">
          {roleOptions.map((option) => (
            <Button
              key={option}
              variant={data.role === option ? "default" : "outline"}
              onClick={() => onChange("role", option)}
              className="font-medium"
            >
              {option}
            </Button>
          ))}
        </div>
      </div>

      {/* Work type */}
      <div className="mb-8">
        <Label className="text-sm font-semibold mb-4 block">
          What kind of work do you do? (Select all that apply)
        </Label>
        <div className="flex flex-wrap gap-2">
          {workTypeOptions.map((option) => (
            <Button
              key={option}
              variant={data.workType.includes(option) ? "default" : "outline"}
              onClick={() => handleWorkTypeToggle(option)}
              className="font-medium"
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
