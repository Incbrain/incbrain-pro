import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const empty = { client_name: "", project_status: "Lead", markup_percentage: 0 };

export default function ProjectFormDialog({ open, onOpenChange, project, onSave }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (project) {
      setForm({
        client_name: project.client_name || "",
        project_status: project.project_status || "Lead",
        markup_percentage: project.markup_percentage ?? 0,
      });
    } else {
      setForm(empty);
    }
  }, [project, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{project ? "Edit Project" : "New Project Estimate"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-1.5">
            <Label>Client Name</Label>
            <Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} placeholder="e.g. Acme Corp" />
          </div>
          <div className="space-y-1.5">
            <Label>Project Status</Label>
            <Select value={form.project_status} onValueChange={(v) => setForm({ ...form, project_status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Lead">Lead</SelectItem>
                <SelectItem value="Quoted">Quoted</SelectItem>
                <SelectItem value="Won">Won</SelectItem>
                <SelectItem value="Ordered">Ordered</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Markup Percentage (%)</Label>
            <Input type="number" value={form.markup_percentage} onChange={(e) => setForm({ ...form, markup_percentage: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onSave({ ...form, markup_percentage: parseFloat(form.markup_percentage) || 0 })} disabled={!form.client_name}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}