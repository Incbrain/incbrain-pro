import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function CloneToProjectDialog({ open, onOpenChange, templateItems, catalogMap }) {
  const [clientName, setClientName] = useState("");
  const [markup, setMarkup] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const handleClone = async () => {
    setLoading(true);
    const project = await base44.entities.ProjectEstimate.create({
      client_name: clientName,
      project_status: "Lead",
      markup_percentage: parseFloat(markup) || 0,
    });

    const lineItems = templateItems.map((ti) => ({
      project_id: project.id,
      catalog_item_id: ti.catalog_item_id,
      quantity: ti.default_quantity || 1,
    }));

    if (lineItems.length > 0) {
      await base44.entities.EstimateLineItem.bulkCreate(lineItems);
    }

    qc.invalidateQueries({ queryKey: ["projects"] });
    qc.invalidateQueries({ queryKey: ["estimateLineItems"] });
    setLoading(false);
    onOpenChange(false);
    setClientName("");
    setMarkup(0);
    navigate(`/ProjectDetail?id=${project.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Clone Template to Project</DialogTitle>
          <DialogDescription>This will create a new project estimate with all template items.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-1.5">
            <Label>Client Name</Label>
            <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="e.g. Acme Corp" />
          </div>
          <div className="space-y-1.5">
            <Label>Markup Percentage (%)</Label>
            <Input type="number" value={markup} onChange={(e) => setMarkup(e.target.value)} placeholder="0" />
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">{templateItems.length} items will be added to the new estimate.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleClone} disabled={!clientName || loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}