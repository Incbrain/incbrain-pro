import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, FileText, FolderOpen, Globe, Clock, Package, Zap } from "lucide-react";
import ItemTypeBadge from "./ItemTypeBadge";
import SourcingBadge from "./SourcingBadge";
import { differenceInDays, parseISO, format } from "date-fns";

const Row = ({ label, value }) =>
  value ? (
    <div className="flex justify-between items-start gap-4 py-2.5 border-b border-border last:border-0">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide shrink-0 w-36">{label}</span>
      <span className="text-sm text-right">{value}</span>
    </div>
  ) : null;

const ResourceButton = ({ href, icon: Icon, iconClass, title, subtitle }) => (
  <a
    href={href || "#"}
    target="_blank"
    rel="noopener noreferrer"
    className={!href ? "pointer-events-none opacity-40" : ""}
  >
    <div className="border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 rounded-xl p-5 flex items-center gap-4 transition-all cursor-pointer group">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm group-hover:text-primary transition-colors">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle || (href ? "Click to open" : "Not linked")}</p>
      </div>
      {href && <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />}
    </div>
  </a>
);

export default function CatalogItemDetailSheet({ item, open, onClose }) {
  if (!item) return null;

  const margin = (item.retail_price || 0) - (item.wholesale_cost || 0);
  const marginPct = item.retail_price > 0 ? ((margin / item.retail_price) * 100).toFixed(1) : 0;
  const msrpDiscount = item.msrp && item.retail_price ? (((item.msrp - item.retail_price) / item.msrp) * 100).toFixed(1) : null;
  const directUpside = item.msrp ? (item.msrp - item.wholesale_cost) : null;

  const renewalDays = item.contract_renewal_date
    ? differenceInDays(parseISO(item.contract_renewal_date), new Date())
    : null;
  const renewalUrgent = renewalDays !== null && renewalDays <= 60;

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
                {item.sourcing_model && <SourcingBadge model={item.sourcing_model} />}
                {item.unit_of_measure && <Badge variant="outline" className="text-xs">{item.unit_of_measure}</Badge>}
                {item.lead_time && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <Clock className="w-3 h-3" />{item.lead_time}
                  </Badge>
                )}
              </div>
              {renewalUrgent && (
                <div className="mt-2 text-xs text-orange-700 bg-orange-500/10 border border-orange-200 rounded-md px-2 py-1">
                  ⚠ Contract renewal in {renewalDays < 0 ? "overdue" : `${renewalDays} days`} — {format(parseISO(item.contract_renewal_date), "MMM d, yyyy")}
                </div>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Price bar */}
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
            <TabsTrigger value="sourcing" className="flex-1">Sourcing</TabsTrigger>
            <TabsTrigger value="resources" className="flex-1">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div>
              <Row label="SKU" value={item.sku} />
              <Row label="MPN" value={item.mpn} />
              <Row label="Primary Provider" value={item.vendor} />
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

          <TabsContent value="sourcing" className="space-y-4">
            <div>
              <Row label="Sourcing Model" value={item.sourcing_model} />
              <Row label="Master Agency" value={item.master_agency} />
              <Row label="Commission" value={item.commission_structure} />
              <Row label="Renewal Date" value={item.contract_renewal_date ? format(parseISO(item.contract_renewal_date), "MMM d, yyyy") : null} />
            </div>
            {directUpside !== null && (
              <div className="bg-emerald-500/5 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Potential Direct Profit</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Current Margin</p>
                    <p className="text-lg font-bold text-emerald-600">${margin.toFixed(2)}</p>
                    <p className="text-[10px] text-emerald-600">{marginPct}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Direct vs. MSRP Upside</p>
                    <p className="text-lg font-bold text-primary">${directUpside.toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground">at MSRP pricing</p>
                  </div>
                </div>
              </div>
            )}
            {item.nxtsys_rpm_url && (
              <Button variant="outline" className="w-full gap-2 border-orange-200 text-orange-700 hover:bg-orange-50" asChild>
                <a href={item.nxtsys_rpm_url} target="_blank" rel="noopener noreferrer">
                  <span className="font-black text-sm">N</span> Open NXTSYS RPM Portal
                  <ExternalLink className="w-3.5 h-3.5 ml-auto" />
                </a>
              </Button>
            )}
          </TabsContent>

          <TabsContent value="resources" className="space-y-3">
            <p className="text-xs text-muted-foreground">Quick access to product collateral and vendor materials.</p>
            <ResourceButton href={item.spec_sheet_url} icon={FileText} iconClass="bg-red-500/10 text-red-600" title="Download Spec Sheet" subtitle="PDF datasheet from vendor" />
            <ResourceButton href={item.marketing_folder_url} icon={FolderOpen} iconClass="bg-amber-500/10 text-amber-600" title="View Marketing Materials" subtitle="Google Drive / Dropbox folder" />
            <ResourceButton href={item.nxtsys_rpm_url} icon={() => <span className="font-black text-orange-700">N</span>} iconClass="bg-orange-500/10" title="NXTSYS RPM Portal" subtitle="Order / manage via NXTSYS" />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}