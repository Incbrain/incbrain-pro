import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const CATEGORIES = ["Hardware", "Software", "Labor"];

export default function CatalogFilters({ items, filters, onChange }) {
  const vendors = [...new Set(items.map((i) => i.vendor).filter(Boolean))].sort();

  const toggleCategory = (cat) => {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    onChange({ ...filters, categories: next });
  };

  const toggleVendor = (vendor) => {
    const next = filters.vendors.includes(vendor)
      ? filters.vendors.filter((v) => v !== vendor)
      : [...filters.vendors, vendor];
    onChange({ ...filters, vendors: next });
  };

  const hasFilters = filters.categories.length > 0 || filters.vendors.length > 0;

  return (
    <aside className="w-56 shrink-0 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Filters</h3>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs text-muted-foreground gap-1 px-2"
            onClick={() => onChange({ categories: [], vendors: [] })}
          >
            <X className="w-3 h-3" /> Clear
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</Label>
        {CATEGORIES.map((cat) => (
          <div key={cat} className="flex items-center gap-2">
            <Checkbox
              id={`cat-${cat}`}
              checked={filters.categories.includes(cat)}
              onCheckedChange={() => toggleCategory(cat)}
            />
            <label htmlFor={`cat-${cat}`} className="text-sm cursor-pointer">{cat}</label>
          </div>
        ))}
      </div>

      {vendors.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vendor</Label>
            {vendors.map((vendor) => (
              <div key={vendor} className="flex items-center gap-2">
                <Checkbox
                  id={`vendor-${vendor}`}
                  checked={filters.vendors.includes(vendor)}
                  onCheckedChange={() => toggleVendor(vendor)}
                />
                <label htmlFor={`vendor-${vendor}`} className="text-sm cursor-pointer truncate">{vendor}</label>
              </div>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}