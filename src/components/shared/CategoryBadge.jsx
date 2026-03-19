import React from "react";
import { Badge } from "@/components/ui/badge";
import { Monitor, RefreshCw, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const categoryConfig = {
  Hardware: { icon: Monitor, class: "bg-blue-500/10 text-blue-600 border-blue-200" },
  Software: { icon: RefreshCw, class: "bg-violet-500/10 text-violet-600 border-violet-200" },
  Labor: { icon: Wrench, class: "bg-amber-500/10 text-amber-600 border-amber-200" },
};

export default function CategoryBadge({ category }) {
  const config = categoryConfig[category] || categoryConfig.Hardware;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", config.class)}>
      <Icon className="w-3 h-3" />
      {category}
    </Badge>
  );
}