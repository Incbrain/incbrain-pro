import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProjectFormDialog from "@/components/projects/ProjectFormDialog";
import EmptyState from "@/components/shared/EmptyState";

const statusStyles = {
  Lead: "bg-muted text-muted-foreground",
  Quoted: "bg-primary/10 text-primary",
  Won: "bg-emerald-500/10 text-emerald-600",
  Ordered: "bg-violet-500/10 text-violet-600",
};

export default function Projects() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const qc = useQueryClient();

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.ProjectEstimate.list("-created_date"),
  });

  const { data: lineItems = [] } = useQuery({
    queryKey: ["estimateLineItems"],
    queryFn: () => base44.entities.EstimateLineItem.list(),
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

  const projectFinancials = useMemo(() => {
    const map = {};
    projects.forEach((p) => (map[p.id] = { quoteValue: 0, internalCost: 0 }));
    lineItems.forEach((li) => {
      const cat = catalogMap[li.catalog_item_id];
      if (!cat || !map[li.project_id]) return;
      const project = projects.find((p) => p.id === li.project_id);
      const markup = project?.markup_percentage || 0;
      const price = li.override_price != null ? li.override_price : cat.retail_price;
      const markedUpPrice = price * (1 + markup / 100);
      map[li.project_id].quoteValue += markedUpPrice * li.quantity;
      map[li.project_id].internalCost += cat.wholesale_cost * li.quantity;
    });
    return map;
  }, [projects, lineItems, catalogMap]);

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.ProjectEstimate.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["projects"] }); setDialogOpen(false); },
  });

  const filtered = statusFilter === "all" ? projects : projects.filter((p) => p.project_status === statusFilter);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Project Estimates</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage quotes and project estimates</p>
        </div>
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Lead">Lead</SelectItem>
              <SelectItem value="Quoted">Quoted</SelectItem>
              <SelectItem value="Won">Won</SelectItem>
              <SelectItem value="Ordered">Ordered</SelectItem>
            </SelectContent>
          </Select>
          <Button className="gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={FileText} title="No projects found" description="Create a project estimate to start quoting." actionLabel="New Project" onAction={() => setDialogOpen(true)} />
        ) : (
          filtered.map((project) => {
            const fin = projectFinancials[project.id] || { quoteValue: 0, internalCost: 0 };
            const margin = fin.quoteValue - fin.internalCost;
            const marginPct = fin.quoteValue > 0 ? ((margin / fin.quoteValue) * 100).toFixed(1) : 0;
            return (
              <Link
                key={project.id}
                to={`/ProjectDetail?id=${project.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors border-b border-border last:border-0 group"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{project.client_name}</p>
                  <p className="text-xs text-muted-foreground">Markup: {project.markup_percentage || 0}%</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold">${fin.quoteValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-xs text-emerald-600">{marginPct}% margin</p>
                  </div>
                  <Badge className={statusStyles[project.project_status] || statusStyles.Lead}>
                    {project.project_status || "Lead"}
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </Link>
            );
          })
        )}
      </div>

      <ProjectFormDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={(data) => createMut.mutate(data)} />
    </div>
  );
}