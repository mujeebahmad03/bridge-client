"use client";

import { X } from "lucide-react";
import { v7 } from "uuid";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  companySizeOptions,
  salesRepsOptions,
  teamRoles,
} from "@/onboarding/constants";

interface TeamMember {
  email: string;
  role: string;
}

interface YourCompanyStepProps {
  data: {
    companySize: string;
    salesReps: string;
    teamMembers: TeamMember[];
  };
  onChange: (field: string, value: string | TeamMember[]) => void;
}

export function YourCompanyStep({ data, onChange }: YourCompanyStepProps) {
  const addTeamMember = (): void => {
    onChange("teamMembers", [
      ...data.teamMembers,
      { email: "", role: "MEMBER" },
    ]);
  };

  const removeTeamMember = (index: number): void => {
    onChange(
      "teamMembers",
      data.teamMembers.filter((_, i) => i !== index)
    );
  };

  const updateTeamMember = (
    index: number,
    field: keyof TeamMember,
    value: string
  ): void => {
    const updatedMembers = [...data.teamMembers];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    onChange("teamMembers", updatedMembers);
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-foreground mb-2">Your company</h2>
      <p className="text-muted-foreground mb-8">
        A few quick details to set up your workspace and team.
      </p>

      {/* Company size */}
      <div className="mb-8">
        <Label className="text-sm font-semibold mb-4 block">Company size</Label>
        <div className="flex flex-wrap gap-2">
          {companySizeOptions.map((option) => (
            <Button
              key={option}
              variant={data.companySize === option ? "default" : "outline"}
              onClick={() => onChange("companySize", option)}
              className="font-medium"
            >
              {option}
            </Button>
          ))}
        </div>
      </div>

      {/* Sales reps */}
      <div className="mb-8">
        <Label className="text-sm font-semibold mb-4 block">
          How many sales reps in your company will use this?
        </Label>
        <div className="flex flex-wrap gap-2">
          {salesRepsOptions.map((option) => (
            <Button
              key={option}
              variant={data.salesReps === option ? "default" : "outline"}
              onClick={() => onChange("salesReps", option)}
              className="font-medium"
            >
              {option}
            </Button>
          ))}
        </div>
      </div>

      {/* Invite team members */}
      <div className="mb-8">
        <Label className="text-sm font-semibold mb-4 block">
          Invite team members (optional)
        </Label>

        <div className="space-y-3 mb-4">
          {data.teamMembers.map((member, index) => (
            <div key={v7()} className="flex gap-3 items-end">
              <Input
                type="email"
                placeholder="Email address"
                value={member.email}
                onChange={(e) =>
                  updateTeamMember(index, "email", e.target.value)
                }
                className="flex-1"
              />
              <Select
                value={member.role}
                onValueChange={(value) =>
                  updateTeamMember(index, "role", value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teamRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeTeamMember(index)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={addTeamMember}>
          + Add another team member
        </Button>
      </div>
    </div>
  );
}
