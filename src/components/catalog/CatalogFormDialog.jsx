import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const empty = {
  item_name: "", sku: "", mpn: "", category: "Hardware", markup_category: "Hardware",
  unit_of_measure: "Each", vendor: "", vendor_portal_url: "",
  sourcing_model: "Incbrain-Direct", master_agency: "None/Direct",
  commission_structure: "Wholesale-Markup", contract_renewal_date: "",
  nxtsys_rpm_url: "",
  wholesale_cost: "", msrp: "", retail_price: "",
  lead_time: "", description: "", technical_description: "",
  spec_sheet_url: "", marketing_folder_url: "", image_url: "",
};

const F = ({ label, children }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium">{label}</Label>
    {children}
  </div>
);

const Sel = ({ value, onChange, options }) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger><SelectValue /></SelectTrigger>
    <SelectContent>
      {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
    </SelectContent>
  </Select>
);

export default function CatalogFormDialog({ open, onOpenChange, item, onSave }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    setForm(item ? {
      item_name: item.item_name || "", sku: item.sku || "", mpn: item.mpn || "",
      category: item.category || "Hardware", markup_category: item.markup_category || "Hardware",
      unit_of_measure: item.unit_of_measure || "Each", vendor: item.vendor || "",
      vendor_portal_url: item.vendor_portal_url || "",
      sourcing_model: item.sourcing_model || "Incbrain-Direct",
      master_agency: item.master_agency || "None/Direct",
      commission_structure: item.commission_structure || "Wholesale-Markup",
      contract_renewal_date: item.contract_renewal_date || "",
      nxtsys_rpm_url: item.nxtsys_rpm_url || "",
      wholesale_cost: item.wholesale_cost ?? "", msrp: item.msrp ?? "", retail_price: item.retail_price ?? "",
      lead_time: item.lead_time || "", description: item.description || "",
      technical_description: item.technical_description || "",
      spec_sheet_url: item.spec_sheet_url || "", marketing_folder_url: item.marketing_folder_url || "",
      image_url: item.image_url || "",
    } : empty);
  }, [item, open]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    onSave({
      ...form,
      wholesale_cost: parseFloat(form.wholesale_cost) || 0,
      msrp: form.msrp !== "" ? parseFloat(form.msrp) : undefined,
      retail_price: parseFloat(form.retail_price) || 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Catalog Item" : "Add Catalog Item"}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
            <TabsTrigger value="technical" className="flex-1">Technical Specs</TabsTrigger>
            <TabsTrigger value="sourcing" className="flex-1">Partnership / Sourcing</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[440px] mt-4 pr-2">
            {/* ── GENERAL ── */}
            <TabsContent value="general" className="space-y-4 mt-0 px-1">
              <div className="grid grid-cols-2 gap-4">
                <F label="Item Name *"><Input value={form.item_name} onChange={(e) => set("item_name", e.target.value)} placeholder="e.g. Cisco Catalyst 9200" /></F>
                <F label="SKU *"><Input value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="e.g. HW-CSW-9200" /></F>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <F label="Category *"><Sel value={form.category} onChange={(v) => set("category", v)} options={["Hardware", "Software", "Labor"]} /></F>
                <F label="Markup Category"><Sel value={form.markup_category} onChange={(v) => set("markup_category", v)} options={["Hardware", "SaaS", "Labor"]} /></F>
                <F label="Unit of Measure"><Sel value={form.unit_of_measure} onChange={(v) => set("unit_of_measure", v)} options={["Each","License","Hour","Month","Year","Drop","Port","User","Device"]} /></F>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <F label="Wholesale Cost ($) *"><Input type="number" value={form.wholesale_cost} onChange={(e) => set("wholesale_cost", e.target.value)} placeholder="0.00" /></F>
                <F label="MSRP ($)"><Input type="number" value={form.msrp} onChange={(e) => set("msrp", e.target.value)} placeholder="0.00" /></F>
                <F label="Selling Price ($) *"><Input type="number" value={form.retail_price} onChange={(e) => set("retail_price", e.target.value)} placeholder="0.00" /></F>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <F label="Primary Provider / Vendor"><Input value={form.vendor} onChange={(e) => set("vendor", e.target.value)} placeholder="e.g. AT&T, RingCentral" /></F>
                <F label="Image URL"><Input value={form.image_url} onChange={(e) => set("image_url", e.target.value)} placeholder="https://..." /></F>
              </div>
              <F label="Marketing Description"><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Short summary for quotes..." rows={3} /></F>
            </TabsContent>

            {/* ── TECHNICAL SPECS ── */}
            <TabsContent value="technical" className="space-y-4 mt-0 px-1">
              <div className="grid grid-cols-2 gap-4">
                <F label="Manufacturer Part Number (MPN)"><Input value={form.mpn} onChange={(e) => set("mpn", e.target.value)} placeholder="e.g. C9200-48T-A" /></F>
                <F label="Lead Time"><Input value={form.lead_time} onChange={(e) => set("lead_time", e.target.value)} placeholder="e.g. 2-3 weeks, In Stock" /></F>
              </div>
              <F label="Vendor Portal Link"><Input value={form.vendor_portal_url} onChange={(e) => set("vendor_portal_url", e.target.value)} placeholder="https://vendor.com/product/..." /></F>
              <F label="Spec Sheet URL (PDF)"><Input value={form.spec_sheet_url} onChange={(e) => set("spec_sheet_url", e.target.value)} placeholder="https://..." /></F>
              <F label="Marketing Folder URL (Google Drive / Dropbox)"><Input value={form.marketing_folder_url} onChange={(e) => set("marketing_folder_url", e.target.value)} placeholder="https://drive.google.com/..." /></F>
              <F label="Technical Specifications"><Textarea value={form.technical_description} onChange={(e) => set("technical_description", e.target.value)} placeholder="Detailed technical specs, features, requirements..." rows={8} /></F>
            </TabsContent>

            {/* ── PARTNERSHIP / SOURCING ── */}
            <TabsContent value="sourcing" className="space-y-4 mt-0 px-1">
              <div className="bg-orange-500/5 border border-orange-200 rounded-lg p-3 text-xs text-orange-700">
                Track how this item is sourced and when agency contracts can be migrated to Incbrain-Direct.
              </div>
              <div className="grid grid-cols-2 gap-4">
                <F label="Sourcing Model"><Sel value={form.sourcing_model} onChange={(v) => set("sourcing_model", v)} options={["Agency-Brokered", "Incbrain-Direct", "Hybrid"]} /></F>
                <F label="Master Agency"><Sel value={form.master_agency} onChange={(v) => set("master_agency", v)} options={["NXTSYS", "AppDirect", "None/Direct"]} /></F>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <F label="Commission Structure"><Sel value={form.commission_structure} onChange={(v) => set("commission_structure", v)} options={["Monthly Residual", "One-Time Spiff", "Wholesale-Markup"]} /></F>
                <F label="Contract Renewal Date"><Input type="date" value={form.contract_renewal_date} onChange={(e) => set("contract_renewal_date", e.target.value)} /></F>
              </div>
              <F label="NXTSYS RPM Portal Link">
                <Input value={form.nxtsys_rpm_url} onChange={(e) => set("nxtsys_rpm_url", e.target.value)} placeholder="https://rpm.nxtsys.com/..." />
              </F>

              {/* Potential Direct Profit calc */}
              {form.wholesale_cost !== "" && form.retail_price !== "" && (
                <div className="bg-emerald-500/5 border border-emerald-200 rounded-lg p-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Potential Direct Profit</p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Current Margin</p>
                      <p className="text-sm font-bold text-emerald-600">
                        ${(parseFloat(form.retail_price) - parseFloat(form.wholesale_cost)).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">MSRP Upside</p>
                      <p className="text-sm font-bold text-primary">
                        {form.msrp ? `$${(parseFloat(form.msrp) - parseFloat(form.wholesale_cost)).toFixed(2)}` : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Margin %</p>
                      <p className="text-sm font-bold">
                        {parseFloat(form.retail_price) > 0
                          ? `${(((parseFloat(form.retail_price) - parseFloat(form.wholesale_cost)) / parseFloat(form.retail_price)) * 100).toFixed(1)}%`
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.item_name || !form.sku}>Save Item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}