import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import TemplateCard from "@/components/templates/TemplateCard";
import TemplateFormDialog from "@/components/templates/TemplateFormDialog";
import EmptyState from "@/components/shared/EmptyState";

export default function Templates() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const qc = useQueryClient();

  const { data: templates = [] } = useQuery({
    queryKey: ["buildTemplates"],
    queryFn: () => base44.entities.BuildTemplate.list("-created_date"),
  });

  const { data: templateItems = [] } = useQuery({
    queryKey: ["templateItems"],
    queryFn: () => base44.entities.TemplateItem.list(),
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

  const templateStats = useMemo(() => {
    const stats = {};
    templates.forEach((t) => (stats[t.id] = { count: 0, cost: 0 }));
    templateItems.forEach((ti) => {
      if (!stats[ti.template_id]) return;
      const cat = catalogMap[ti.catalog_item_id];
      stats[ti.template_id].count += 1;
      stats[ti.template_id].cost += (cat?.retail_price || 0) * (ti.default_quantity || 1);
    });
    return stats;
  }, [templates, templateItems, catalogMap]);

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.BuildTemplate.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["buildTemplates"] }); setDialogOpen(false); },
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Build Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">Pre-configured solutions you can clone into projects</p>
        </div>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4" /> New Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="bg-card rounded-xl border border-border">
          <EmptyState icon={Layers} title="No templates yet" description="Create build templates to speed up your quoting process." actionLabel="New Template" onAction={() => setDialogOpen(true)} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((t) => (
            <TemplateCard key={t.id} template={t} itemCount={templateStats[t.id]?.count || 0} totalCost={templateStats[t.id]?.cost || 0} />
          ))}
        </div>
      )}

      <TemplateFormDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={(data) => createMut.mutate(data)} />
    </div>
  );
}