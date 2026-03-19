import React from "react";
import { Badge } from "@/components/ui/badge";
import { Monitor, RefreshCw, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const config = {
  Hardware: {
    icon: Monitor,
    class: "bg-blue-500/10 text-blue-700 border-blue-200",
    label: "Hardware",
  },
  Software: {
    icon: RefreshCw,
    class: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
    label: "Recurring",
  },
  Labor: {
    icon: Wrench,
    class: "bg-violet-500/10 text-violet-700 border-violet-200",
    label: "Services",
  },
};

export default function ItemTypeBadge({ category, className }) {
  const cfg = config[category] || config.Hardware;
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", cfg.class, className)}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </Badge>
  );
}