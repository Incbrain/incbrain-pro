import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Copy, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CategoryBadge from "@/components/shared/CategoryBadge";
import AddTemplateItemDialog from "@/components/templates/AddTemplateItemDialog";
import EmptyState from "@/components/shared/EmptyState";
import CloneToProjectDialog from "@/components/templates/CloneToProjectDialog";

export default function TemplateDetail() {
  const params = new URLSearchParams(window.location.search);
  const templateId = params.get("id");
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [cloneOpen, setCloneOpen] = useState(false);

  const { data: template } = useQuery({
    queryKey: ["buildTemplate", templateId],
    queryFn: async () => {
      const list = await base44.entities.BuildTemplate.filter({ id: templateId });
      return list[0];
    },
    enabled: !!templateId,
  });

  const { data: templateItems = [] } = useQuery({
    queryKey: ["templateItems", templateId],
    queryFn: async () => base44.entities.TemplateItem.filter({ template_id: templateId }),
    enabled: !!templateId,
  });

  const { data: catalogItems = [] } = useQuery({
    queryKey: ["catalogItems"],
    queryFn: () => base44.entities.CatalogItem.list(),
  });

  const catalogMap = useMemo(() => {
    const map = {};
    catalogItems.forEach((c) => (map[c.id] = c));
    return map;
  }, [catalogItems]);

  const totalCost = useMemo(() => {
    return templateItems.reduce((sum, ti) => {
      const cat = catalogMap[ti.catalog_item_id];
      return sum + (cat?.retail_price || 0) * (ti.default_quantity || 1);
    }, 0);
  }, [templateItems, catalogMap]);

  const addItemMut = useMutation({
    mutationFn: (data) => base44.entities.TemplateItem.create({ ...data, template_id: templateId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["templateItems", templateId] }); setAddOpen(false); },
  });

  const deleteItemMut = useMutation({
    mutationFn: (id) => base44.entities.TemplateItem.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["templateItems", templateId] }),
  });

  if (!template) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/Templates")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight truncate">{template.template_name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{template.description || "No description"}</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => setCloneOpen(true)}>
          <Copy className="w-4 h-4" /> Clone to Project
        </Button>
        <Button className="gap-2" onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4" /> Add Item
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Template Cost</p>
          <p className="text-3xl font-bold mt-1">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="text-sm text-muted-foreground">{templateItems.length} items</div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {templateItems.length === 0 ? (
          <EmptyState icon={Layers} title="No items in template" description="Add catalog items to this build template." actionLabel="Add Item" onAction={() => setAddOpen(true)} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templateItems.map((ti) => {
                  const cat = catalogMap[ti.catalog_item_id];
                  if (!cat) return null;
                  const subtotal = (cat.retail_price || 0) * (ti.default_quantity || 1);
                  return (
                    <TableRow key={ti.id}>
                      <TableCell className="font-medium">{cat.item_name}</TableCell>
                      <TableCell><CategoryBadge category={cat.category} /></TableCell>
                      <TableCell className="text-muted-foreground">{cat.vendor}</TableCell>
                      <TableCell className="text-right">${cat.retail_price?.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{ti.default_quantity}</TableCell>
                      <TableCell className="text-right font-medium">${subtotal.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteItemMut.mutate(ti.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AddTemplateItemDialog open={addOpen} onOpenChange={setAddOpen} catalogItems={catalogItems} onSave={(data) => addItemMut.mutate(data)} />
      <CloneToProjectDialog open={cloneOpen} onOpenChange={setCloneOpen} templateItems={templateItems} catalogMap={catalogMap} />
    </div>
  );
}