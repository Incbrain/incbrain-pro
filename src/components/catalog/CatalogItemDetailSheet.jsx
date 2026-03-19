import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, FileText, FolderOpen, Globe, Clock, Package } from "lucide-react";
import ItemTypeBadge from "./ItemTypeBadge";

const Row = ({ label, value }) =>
  value ? (
    <div className="flex justify-between items-start gap-4 py-2.5 border-b border-border last:border-0">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide shrink-0 w-36">{label}</span>
      <span className="text-sm text-right">{value}</span>
    </div>
  ) : null;

export default function CatalogItemDetailSheet({ item, open, onClose }) {
  if (!item) return null;

  const margin = (item.retail_price || 0) - (item.wholesale_cost || 0);
  const marginPct = item.retail_price > 0 ? ((margin / item.retail_price) * 100).toFixed(1) : 0;
  const msrpDiscount = item.msrp && item.retail_price ? (((item.msrp - item.retail_price) / item.msrp) * 100).toFixed(1) : null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start gap-4">
            {item.image_url ? (
              <img src={item.image_url} alt={item.item_name} className="w-16 h-16 rounded-lg object-contain bg-muted border border-border" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-muted border border-border flex items-center justify-center">
                <Package className="w-7 h-7 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg leading-tight">{item.item_name}</SheetTitle>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <ItemTypeBadge category={item.category} />
                {item.unit_of_measure && (
                  <Badge variant="outline" className="text-xs">{item.unit_of_measure}</Badge>
                )}
                {item.lead_time && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <Clock className="w-3 h-3" />{item.lead_time}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Price summary bar */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Cost</p>
            <p className="text-base font-bold">${(item.wholesale_cost || 0).toFixed(2)}</p>
          </div>
          <div className="bg-primary/5 rounded-lg p-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Sell Price</p>
            <p className="text-base font-bold text-primary">${(item.retail_price || 0).toFixed(2)}</p>
            {msrpDiscount && <p className="text-[10px] text-muted-foreground">{msrpDiscount}% off MSRP</p>}
          </div>
          <div className="bg-emerald-500/5 rounded-lg p-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Margin</p>
            <p className="text-base font-bold text-emerald-600">${margin.toFixed(2)}</p>
            <p className="text-[10px] text-emerald-600">{marginPct}%</p>
          </div>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
            <TabsTrigger value="technical" className="flex-1">Technical</TabsTrigger>
            <TabsTrigger value="resources" className="flex-1">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div>
              <Row label="SKU" value={item.sku} />
              <Row label="Vendor" value={item.vendor} />
              <Row label="Category" value={item.category} />
              <Row label="Markup Category" value={item.markup_category} />
              <Row label="MSRP" value={item.msrp ? `$${item.msrp.toFixed(2)}` : null} />
            </div>
            {item.description && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Description</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="technical" className="space-y-4">
            <div>
              <Row label="MPN" value={item.mpn} />
              <Row label="Lead Time" value={item.lead_time} />
            </div>
            {item.vendor_portal_url && (
              <Button variant="outline" className="w-full gap-2" asChild>
                <a href={item.vendor_portal_url} target="_blank" rel="noopener noreferrer">
                  <Globe className="w-4 h-4" /> Open Vendor Portal
                  <ExternalLink className="w-3.5 h-3.5 ml-auto" />
                </a>
              </Button>
            )}
            {item.technical_description && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Technical Specs</p>
                <pre className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-sans bg-muted/40 rounded-lg p-4">{item.technical_description}</pre>
              </div>
            )}
          </TabsContent>

          <TabsContent value="resources" className="space-y-3">
            <p className="text-xs text-muted-foreground mb-4">Quick access to product collateral and vendor materials.</p>
            <a
              href={item.spec_sheet_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={!item.spec_sheet_url ? "pointer-events-none opacity-40" : ""}
            >
              <div className="border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 rounded-xl p-6 flex items-center gap-4 transition-all cursor-pointer group">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm group-hover:text-primary transition-colors">Download Spec Sheet</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.spec_sheet_url ? "PDF datasheet from vendor" : "No spec sheet linked"}
                  </p>
                </div>
                {item.spec_sheet_url && <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />}
              </div>
            </a>
            <a
              href={item.marketing_folder_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={!item.marketing_folder_url ? "pointer-events-none opacity-40" : ""}
            >
              <div className="border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 rounded-xl p-6 flex items-center gap-4 transition-all cursor-pointer group">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <FolderOpen className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm group-hover:text-primary transition-colors">View Marketing Materials</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.marketing_folder_url ? "Google Drive / Dropbox folder" : "No marketing folder linked"}
                  </p>
                </div>
                {item.marketing_folder_url && <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />}
              </div>
            </a>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}