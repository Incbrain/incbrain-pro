import React from "react";
import { Link } from "react-router-dom";
import { Layers, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TemplateCard({ template, itemCount, totalCost }) {
  return (
    <Link
      to={`/TemplateDetail?id=${template.id}`}
      className="group bg-card rounded-xl border border-border p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex flex-col"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
          <Layers className="w-5 h-5 text-primary" />
        </div>
        <Badge variant="outline" className="text-xs">{itemCount} items</Badge>
      </div>
      <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">{template.template_name}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{template.description || "No description"}</p>
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
        <div>
          <p className="text-xs text-muted-foreground">Template Cost</p>
          <p className="text-lg font-bold">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}