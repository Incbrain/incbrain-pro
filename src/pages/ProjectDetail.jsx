import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Pencil, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CategoryBadge from "@/components/shared/CategoryBadge";
import EmptyState from "@/components/shared/EmptyState";
import AddLineItemDialog from "@/components/projects/AddLineItemDialog";
import ProjectFormDialog from "@/components/projects/ProjectFormDialog";
import ProjectSummary from "@/components/projects/ProjectSummary";

const statusStyles = {
  Lead: "bg-muted text-muted-foreground",
  Quoted: "bg-primary/10 text-primary",
  Won: "bg-emerald-500/10 text-emerald-600",
  Ordered: "bg-violet-500/10 text-violet-600",
};

export default function ProjectDetail() {
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get("id");
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const list = await base44.entities.ProjectEstimate.filter({ id: projectId });
      return list[0];
    },
    enabled: !!projectId,
  });

  const { data: lineItems = [] } = useQuery({
    queryKey: ["projectLineItems", projectId],
    queryFn: () => base44.entities.EstimateLineItem.filter({ project_id: projectId }),
    enabled: !!projectId,
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

  const addLineItemMut = useMutation({
    mutationFn: (data) => base44.entities.EstimateLineItem.create({ ...data, project_id: projectId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["projectLineItems", projectId] }); setAddOpen(false); },
  });

  const deleteLineItemMut = useMutation({
    mutationFn: (id) => base44.entities.EstimateLineItem.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projectLineItems", projectId] }),
  });

  const updateProjectMut = useMutation({
    mutationFn: (data) => base44.entities.ProjectEstimate.update(projectId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["project", projectId] }); qc.invalidateQueries({ queryKey: ["projects"] }); setEditOpen(false); },
  });

  if (!project) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  const markup = project.markup_percentage || 0;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/Projects")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight truncate">{project.client_name}</h1>
            <Badge className={statusStyles[project.project_status] || statusStyles.Lead}>
              {project.project_status || "Lead"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">Markup: {markup}%</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => setEditOpen(true)}>
          <Pencil className="w-4 h-4" /> Edit
        </Button>
        <Button className="gap-2" onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4" /> Add Item
        </Button>
      </div>

      <ProjectSummary lineItems={lineItems} catalogMap={catalogMap} markup={markup} />

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-sm">Line Items</h2>
        </div>
        {lineItems.length === 0 ? (
          <EmptyState icon={FileText} title="No line items" description="Add catalog items to this estimate." actionLabel="Add Item" onAction={() => setAddOpen(true)} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Wholesale</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">w/ Markup</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.map((li) => {
                  const cat = catalogMap[li.catalog_item_id];
                  if (!cat) return null;
                  const price = li.override_price != null ? li.override_price : cat.retail_price;
                  const markedUpPrice = price * (1 + markup / 100);
                  const subtotal = markedUpPrice * li.quantity;
                  const cost = cat.wholesale_cost * li.quantity;
                  const margin = subtotal - cost;
                  return (
                    <TableRow key={li.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{cat.item_name}</p>
                          {li.override_price != null && (
                            <p className="text-xs text-amber-600">Override price applied</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell><CategoryBadge category={cat.category} /></TableCell>
                      <TableCell className="text-right text-muted-foreground">${cat.wholesale_cost?.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${price.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">${markedUpPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{li.quantity}</TableCell>
                      <TableCell className="text-right font-semibold">${subtotal.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-emerald-600 font-medium">${margin.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteLineItemMut.mutate(li.id)}>
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

      <AddLineItemDialog open={addOpen} onOpenChange={setAddOpen} catalogItems={catalogItems} onSave={(data) => addLineItemMut.mutate(data)} />
      <ProjectFormDialog open={editOpen} onOpenChange={setEditOpen} project={project} onSave={(data) => updateProjectMut.mutate(data)} />
    </div>
  );
}