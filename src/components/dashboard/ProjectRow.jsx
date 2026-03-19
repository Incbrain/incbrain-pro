import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

const statusStyles = {
  Lead: "bg-muted text-muted-foreground",
  Quoted: "bg-primary/10 text-primary",
  Won: "bg-emerald-500/10 text-emerald-600",
  Ordered: "bg-violet-500/10 text-violet-600",
};

export default function ProjectRow({ project, quoteValue, internalCost }) {
  const margin = quoteValue - internalCost;
  const marginPct = quoteValue > 0 ? ((margin / quoteValue) * 100).toFixed(1) : 0;

  return (
    <Link
      to={`/ProjectDetail?id=${project.id}`}
      className="flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors border-b border-border last:border-0 group"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{project.client_name}</p>
          <p className="text-xs text-muted-foreground">Markup: {project.markup_percentage || 0}%</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold">${quoteValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-emerald-600">{marginPct}% margin</p>
        </div>
        <Badge className={statusStyles[project.project_status] || statusStyles.Lead}>
          {project.project_status || "Lead"}
        </Badge>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
    </Link>
  );
}