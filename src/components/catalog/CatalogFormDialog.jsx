import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const empty = { item_name: "", sku: "", category: "Hardware", vendor: "", wholesale_cost: "", retail_price: "", description: "" };

export default function CatalogFormDialog({ open, onOpenChange, item, onSave }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (item) {
      setForm({
        item_name: item.item_name || "",
        sku: item.sku || "",
        category: item.category || "Hardware",
        vendor: item.vendor || "",
        wholesale_cost: item.wholesale_cost ?? "",
        retail_price: item.retail_price ?? "",
        description: item.description || "",
      });
    } else {
      setForm(empty);
    }
  }, [item, open]);

  const handleSave = () => {
    onSave({
      ...form,
      wholesale_cost: parseFloat(form.wholesale_cost) || 0,
      retail_price: parseFloat(form.retail_price) || 0,
    });
  };

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Catalog Item" : "Add Catalog Item"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Item Name</Label>
              <Input value={form.item_name} onChange={(e) => set("item_name", e.target.value)} placeholder="e.g. Cisco Switch" />
            </div>
            <div className="space-y-1.5">
              <Label>SKU</Label>
              <Input value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="e.g. HW-CSW-001" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hardware">Hardware</SelectItem>
                  <SelectItem value="Software">Software</SelectItem>
                  <SelectItem value="Labor">Labor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Vendor</Label>
              <Input value={form.vendor} onChange={(e) => set("vendor", e.target.value)} placeholder="e.g. Microsoft" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Wholesale Cost ($)</Label>
              <Input type="number" value={form.wholesale_cost} onChange={(e) => set("wholesale_cost", e.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-1.5">
              <Label>Retail Price ($)</Label>
              <Input type="number" value={form.retail_price} onChange={(e) => set("retail_price", e.target.value)} placeholder="0.00" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe the item..." rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.item_name || !form.sku}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}