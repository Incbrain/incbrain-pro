import React from "react";
import { AlertTriangle, CalendarClock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { differenceInDays, parseISO, format } from "date-fns";

function getRenewalStatus(dateStr) {
  if (!dateStr) return null;
  const days = differenceInDays(parseISO(dateStr), new Date());
  if (days < 0) return { label: "Expired", class: "bg-destructive/10 text-destructive border-destructive/30", urgent: true };
  if (days <= 60) return { label: `${days}d left`, class: "bg-orange-500/10 text-orange-700 border-orange-200", urgent: true };
  if (days <= 180) return { label: `${days}d left`, class: "bg-amber-500/10 text-amber-700 border-amber-200", urgent: false };
  return { label: `${days}d left`, class: "bg-muted text-muted-foreground border-border", urgent: false };
}

export default function MigrationTracker({ lineItems, catalogMap }) {
  const agencyItems = lineItems
    .map((li) => {
      const cat = catalogMap[li.catalog_item_id];
      if (!cat || !cat.sourcing_model || cat.sourcing_model === "Incbrain-Direct") return null;
      return { li, cat };
    })
    .filter(Boolean);

  if (agencyItems.length === 0) return null;

  const urgentCount = agencyItems.filter(({ cat }) => {
    const s = getRenewalStatus(cat.contract_renewal_date);
    return s?.urgent;
  }).length;

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <CalendarClock className="w-4 h-4 text-orange-600" />
        <h2 className="font-semibold text-sm">Agency Migration Tracker</h2>
        {urgentCount > 0 && (
          <Badge className="bg-orange-500/10 text-orange-700 border-orange-200 border ml-auto">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {urgentCount} needs attention
          </Badge>
        )}
      </div>
      <div className="divide-y divide-border">
        {agencyItems.map(({ li, cat }) => {
          const renewal = getRenewalStatus(cat.contract_renewal_date);
          return (
            <div key={li.id} className="px-5 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{cat.item_name}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-muted-foreground">
                    {cat.master_agency || cat.sourcing_model}
                  </span>
                  {cat.commission_structure && (
                    <span className="text-xs text-muted-foreground">· {cat.commission_structure}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {cat.contract_renewal_date && (
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {format(parseISO(cat.contract_renewal_date), "MMM d, yyyy")}
                  </span>
                )}
                {renewal ? (
                  <Badge variant="outline" className={renewal.class}>{renewal.label}</Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">No date set</Badge>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ArrowRight className="w-3 h-3" />
                  <span className="hidden sm:block">Direct</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}