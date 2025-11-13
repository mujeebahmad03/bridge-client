import { useEffect, useState } from "react";

import { type TeamMember } from "@/teams/types";

type DialogType = "invite" | "details" | "remove" | "toggle" | null;

type DialogState = {
  type: DialogType;
  data?: TeamMember;
};

export const useTeamDialogs = () => {
  const [dialog, setDialog] = useState<DialogState>({ type: null });

  useEffect(() => {
    const handleViewDetails = (e: Event) => {
      const member = (e as CustomEvent).detail;
      setDialog({ type: "details", data: member });
    };

    const handleRemove = (e: Event) => {
      const member = (e as CustomEvent).detail;
      setDialog({ type: "remove", data: member });
    };

    const handleToggleStatus = (e: Event) => {
      const member = (e as CustomEvent).detail;
      setDialog({ type: "toggle", data: member });
    };

    window.addEventListener("member-view-details", handleViewDetails);
    window.addEventListener("member-remove", handleRemove);
    window.addEventListener("member-toggle-status", handleToggleStatus);

    return () => {
      window.removeEventListener("member-view-details", handleViewDetails);
      window.removeEventListener("member-remove", handleRemove);
      window.removeEventListener("member-toggle-status", handleToggleStatus);
    };
  }, []);

  const openDialog = (type: DialogType, data?: TeamMember) => {
    setDialog({ type, data });
  };

  const closeDialog = () => {
    setDialog({ type: null });
  };

  return {
    dialog,
    openDialog,
    closeDialog,
  };
};
