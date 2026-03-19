import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AddLineItemDialog({ open, onOpenChange, catalogItems, onSave }) {
  const [selectedId, setSelectedId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [overridePrice, setOverridePrice] = useState("");

  const handleSave = () => {
    const data = {
      catalog_item_id: selectedId,
      quantity: parseInt(quantity) || 1,
    };
    if (overridePrice !== "") {
      data.override_price = parseFloat(overridePrice);
    }
    onSave(data);
    setSelectedId("");
    setQuantity(1);
    setOverridePrice("");
  };

  const selected = catalogItems.find((c) => c.id === selectedId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Line Item</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-1.5">
            <Label>Catalog Item</Label>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger><SelectValue placeholder="Select an item..." /></SelectTrigger>
              <SelectContent>
                {catalogItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.item_name} — ${item.retail_price?.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Quantity</Label>
            <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Override Price (optional)</Label>
            <Input type="number" value={overridePrice} onChange={(e) => setOverridePrice(e.target.value)} placeholder={selected ? `Default: $${selected.retail_price?.toFixed(2)}` : "Leave blank for catalog price"} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!selectedId}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}