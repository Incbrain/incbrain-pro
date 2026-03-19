import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const config = {
  "Agency-Brokered": { class: "bg-orange-500/10 text-orange-700 border-orange-200", label: "NXTSYS / Agency" },
  "Incbrain-Direct":  { class: "bg-emerald-500/10 text-emerald-700 border-emerald-200", label: "Incbrain Direct" },
  "Hybrid":           { class: "bg-violet-500/10 text-violet-700 border-violet-200", label: "Hybrid" },
};

export default function SourcingBadge({ model, className }) {
  if (!model) return null;
  const cfg = config[model] || config["Incbrain-Direct"];
  return (
    <Badge variant="outline" className={cn("text-[11px] font-semibold gap-1", cfg.class, className)}>
      {model === "Agency-Brokered" && <span className="font-bold">N</span>}
      {cfg.label}
    </Badge>
  );
}