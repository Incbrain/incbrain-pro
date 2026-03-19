import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FileText, DollarSign, TrendingUp, Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/dashboard/StatCard";
import ProjectRow from "@/components/dashboard/ProjectRow";
import EmptyState from "@/components/shared/EmptyState";

export default function Dashboard() {
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
    catalogItems.forEach((item) => (map[item.id] = item));
    return map;
  }, [catalogItems]);

  const projectFinancials = useMemo(() => {
    const map = {};
    projects.forEach((p) => {
      map[p.id] = { quoteValue: 0, internalCost: 0 };
    });
    lineItems.forEach((li) => {
      const catalog = catalogMap[li.catalog_item_id];
      if (!catalog || !map[li.project_id]) return;
      const project = projects.find((p) => p.id === li.project_id);
      const markup = project?.markup_percentage || 0;
      const price = li.override_price != null ? li.override_price : catalog.retail_price;
      const markedUpPrice = price * (1 + markup / 100);
      map[li.project_id].quoteValue += markedUpPrice * li.quantity;
      map[li.project_id].internalCost += catalog.wholesale_cost * li.quantity;
    });
    return map;
  }, [projects, lineItems, catalogMap]);

  const activeProjects = projects.filter((p) => p.project_status !== "Ordered");
  const totalQuoted = Object.values(projectFinancials).reduce((s, f) => s + f.quoteValue, 0);
  const totalMargin = totalQuoted - Object.values(projectFinancials).reduce((s, f) => s + f.internalCost, 0);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of your quoting pipeline</p>
        </div>
        <Link to="/Projects">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Projects" value={activeProjects.length} icon={FileText} />
        <StatCard
          title="Total Quoted"
          value={`$${totalQuoted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          icon={DollarSign}
          accentClass="bg-primary"
        />
        <StatCard
          title="Total Margin"
          value={`$${totalMargin.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          icon={TrendingUp}
          accentClass="bg-emerald-500"
        />
        <StatCard title="Catalog Items" value={catalogItems.length} icon={Package} />
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-sm">Active Projects</h2>
          <Link to="/Projects" className="text-xs text-primary font-medium hover:underline">View all</Link>
        </div>
        {activeProjects.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No active projects"
            description="Create a project to start building estimates."
          />
        ) : (
          activeProjects.slice(0, 8).map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              quoteValue={projectFinancials[project.id]?.quoteValue || 0}
              internalCost={projectFinancials[project.id]?.internalCost || 0}
            />
          ))
        )}
      </div>
    </div>
  );
}