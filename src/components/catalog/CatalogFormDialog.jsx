import React, { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const empty = {
  item_name: "", sku: "", mpn: "", category: "Hardware", markup_category: "Hardware",
  unit_of_measure: "Each", vendor: "", vendor_portal_url: "",
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

export default function CatalogFormDialog({ open, onOpenChange, item, onSave }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (item) {
      setForm({
        item_name: item.item_name || "",
        sku: item.sku || "",
        mpn: item.mpn || "",
        category: item.category || "Hardware",
        markup_category: item.markup_category || "Hardware",
        unit_of_measure: item.unit_of_measure || "Each",
        vendor: item.vendor || "",
        vendor_portal_url: item.vendor_portal_url || "",
        wholesale_cost: item.wholesale_cost ?? "",
        msrp: item.msrp ?? "",
        retail_price: item.retail_price ?? "",
        lead_time: item.lead_time || "",
        description: item.description || "",
        technical_description: item.technical_description || "",
        spec_sheet_url: item.spec_sheet_url || "",
        marketing_folder_url: item.marketing_folder_url || "",
        image_url: item.image_url || "",
      });
    } else {
      setForm(empty);
    }
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
            <TabsTrigger value="technical" className="flex-1">Technical</TabsTrigger>
            <TabsTrigger value="resources" className="flex-1">Resources</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[440px] mt-4 pr-2">
            <TabsContent value="general" className="space-y-4 mt-0 px-1">
              <div className="grid grid-cols-2 gap-4">
                <F label="Item Name *">
                  <Input value={form.item_name} onChange={(e) => set("item_name", e.target.value)} placeholder="e.g. Cisco Catalyst 9200" />
                </F>
                <F label="SKU *">
                  <Input value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="e.g. HW-CSW-9200" />
                </F>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <F label="Category *">
                  <Select value={form.category} onValueChange={(v) => set("category", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hardware">Hardware</SelectItem>
                      <SelectItem value="Software">Software</SelectItem>
                      <SelectItem value="Labor">Labor</SelectItem>
                    </SelectContent>
                  </Select>
                </F>
                <F label="Markup Category">
                  <Select value={form.markup_category} onValueChange={(v) => set("markup_category", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hardware">Hardware</SelectItem>
                      <SelectItem value="SaaS">SaaS</SelectItem>
                      <SelectItem value="Labor">Labor</SelectItem>
                    </SelectContent>
                  </Select>
                </F>
                <F label="Unit of Measure">
                  <Select value={form.unit_of_measure} onValueChange={(v) => set("unit_of_measure", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Each", "License", "Hour", "Month", "Year", "Drop", "Port", "User", "Device"].map((u) => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </F>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <F label="Wholesale Cost ($) *">
                  <Input type="number" value={form.wholesale_cost} onChange={(e) => set("wholesale_cost", e.target.value)} placeholder="0.00" />
                </F>
                <F label="MSRP ($)">
                  <Input type="number" value={form.msrp} onChange={(e) => set("msrp", e.target.value)} placeholder="0.00" />
                </F>
                <F label="Selling Price ($) *">
                  <Input type="number" value={form.retail_price} onChange={(e) => set("retail_price", e.target.value)} placeholder="0.00" />
                </F>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <F label="Vendor">
                  <Input value={form.vendor} onChange={(e) => set("vendor", e.target.value)} placeholder="e.g. Cisco" />
                </F>
                <F label="Image URL">
                  <Input value={form.image_url} onChange={(e) => set("image_url", e.target.value)} placeholder="https://..." />
                </F>
              </div>
              <F label="Marketing Description">
                <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Short summary for quotes and proposals..." rows={3} />
              </F>
            </TabsContent>

            <TabsContent value="technical" className="space-y-4 mt-0 px-1">
              <div className="grid grid-cols-2 gap-4">
                <F label="Manufacturer Part Number (MPN)">
                  <Input value={form.mpn} onChange={(e) => set("mpn", e.target.value)} placeholder="e.g. C9200-48T-A" />
                </F>
                <F label="Lead Time">
                  <Input value={form.lead_time} onChange={(e) => set("lead_time", e.target.value)} placeholder="e.g. 2-3 weeks, In Stock" />
                </F>
              </div>
              <F label="Vendor Portal Link">
                <Input value={form.vendor_portal_url} onChange={(e) => set("vendor_portal_url", e.target.value)} placeholder="https://vendor.com/product/..." />
              </F>
              <F label="Technical Specifications">
                <Textarea value={form.technical_description} onChange={(e) => set("technical_description", e.target.value)} placeholder="Detailed technical specs, features, requirements..." rows={10} />
              </F>
            </TabsContent>

            <TabsContent value="resources" className="space-y-4 mt-0 px-1">
              <F label="Spec Sheet URL (PDF)">
                <Input value={form.spec_sheet_url} onChange={(e) => set("spec_sheet_url", e.target.value)} placeholder="https://vendor.com/specsheet.pdf" />
              </F>
              <F label="Marketing Folder URL (Google Drive / Dropbox)">
                <Input value={form.marketing_folder_url} onChange={(e) => set("marketing_folder_url", e.target.value)} placeholder="https://drive.google.com/drive/folders/..." />
              </F>
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