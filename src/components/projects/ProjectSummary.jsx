import React from "react";
import { Separator } from "@/components/ui/separator";

export default function ProjectSummary({ lineItems, catalogMap, markup }) {
  const categories = { Hardware: { cost: 0, revenue: 0 }, Software: { cost: 0, revenue: 0 }, Labor: { cost: 0, revenue: 0 } };
  let totalCost = 0;
  let totalRevenue = 0;

  lineItems.forEach((li) => {
    const cat = catalogMap[li.catalog_item_id];
    if (!cat) return;
    const price = li.override_price != null ? li.override_price : cat.retail_price;
    const markedUpPrice = price * (1 + (markup || 0) / 100);
    const cost = cat.wholesale_cost * li.quantity;
    const revenue = markedUpPrice * li.quantity;

    totalCost += cost;
    totalRevenue += revenue;

    if (categories[cat.category]) {
      categories[cat.category].cost += cost;
      categories[cat.category].revenue += revenue;
    }
  });

  const totalMargin = totalRevenue - totalCost;
  const marginPct = totalRevenue > 0 ? ((totalMargin / totalRevenue) * 100).toFixed(1) : 0;

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-5">
      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Profitability Summary</h3>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Internal Cost</p>
          <p className="text-xl font-bold">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-primary/5 rounded-lg p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Quote Value</p>
          <p className="text-xl font-bold text-primary">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-emerald-500/5 rounded-lg p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Gross Margin</p>
          <p className="text-xl font-bold text-emerald-600">${totalMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-emerald-600 mt-0.5">{marginPct}%</p>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">By Category</h4>
        {Object.entries(categories).map(([name, data]) => {
          const catMargin = data.revenue - data.cost;
          const catPct = data.revenue > 0 ? ((catMargin / data.revenue) * 100).toFixed(1) : 0;
          if (data.revenue === 0 && data.cost === 0) return null;
          return (
            <div key={name} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: name === "Hardware" ? "#3b82f6" : name === "Software" ? "#8b5cf6" : "#f59e0b" }} />
                <span className="text-sm font-medium">{name}</span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <span className="text-muted-foreground">Cost: ${data.cost.toFixed(2)}</span>
                <span>Revenue: ${data.revenue.toFixed(2)}</span>
                <span className="font-semibold text-emerald-600">${catMargin.toFixed(2)} ({catPct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}