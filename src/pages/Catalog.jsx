import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, Package, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ItemTypeBadge from "@/components/catalog/ItemTypeBadge";
import SourcingBadge from "@/components/catalog/SourcingBadge";
import EmptyState from "@/components/shared/EmptyState";
import CatalogFormDialog from "@/components/catalog/CatalogFormDialog";
import CatalogFilters from "@/components/catalog/CatalogFilters";
import CatalogItemDetailSheet from "@/components/catalog/CatalogItemDetailSheet";

export default function Catalog() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ categories: [], vendors: [] });
  const qc = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey: ["catalogItems"],
    queryFn: () => base44.entities.CatalogItem.list("-created_date"),
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.CatalogItem.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["catalogItems"] }); setDialogOpen(false); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CatalogItem.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["catalogItems"] });
      setDialogOpen(false);
      setEditingItem(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.CatalogItem.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogItems"] }),
  });

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const q = search.toLowerCase();
      const matchSearch = !search ||
        i.item_name?.toLowerCase().includes(q) ||
        i.sku?.toLowerCase().includes(q) ||
        i.mpn?.toLowerCase().includes(q);
      const matchCat = filters.categories.length === 0 || filters.categories.includes(i.category);
      const matchVendor = filters.vendors.length === 0 || filters.vendors.includes(i.vendor);
      return matchSearch && matchCat && matchVendor;
    });
  }, [items, search, filters]);

  const handleSave = (data) => {
    if (editingItem) {
      updateMut.mutate({ id: editingItem.id, data });
    } else {
      createMut.mutate(data);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catalog</h1>
          <p className="text-sm text-muted-foreground mt-1">{items.length} items — hardware, software, and labor</p>
        </div>
        <Button className="gap-2" onClick={() => { setEditingItem(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4" /> Add Item
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, SKU, or MPN..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-6 items-start">
        <CatalogFilters items={items} filters={filters} onChange={setFilters} />

        <div className="flex-1 min-w-0 bg-card rounded-xl border border-border overflow-hidden">
          {filtered.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No items found"
              description={search ? "Try adjusting your search or filters." : "Add your first catalog item to get started."}
              actionLabel={!search ? "Add Item" : undefined}
              onAction={() => { setEditingItem(null); setDialogOpen(true); }}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>UOM</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Sell</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item) => {
                    const margin = (item.retail_price || 0) - (item.wholesale_cost || 0);
                    const marginPct = item.retail_price > 0 ? ((margin / item.retail_price) * 100).toFixed(0) : 0;
                    return (
                      <TableRow
                        key={item.id}
                        className="hover:bg-muted/30 cursor-pointer"
                        onClick={() => setDetailItem(item)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {item.image_url ? (
                              <img src={item.image_url} alt="" className="w-8 h-8 rounded-md object-contain bg-muted border border-border shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded-md bg-muted border border-border flex items-center justify-center shrink-0">
                                <Package className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-sm">{item.item_name}</p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {item.sku}{item.mpn ? ` · ${item.mpn}` : ""}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col gap-1">
                              <ItemTypeBadge category={item.category} />
                              {item.sourcing_model && item.sourcing_model !== "Incbrain-Direct" && (
                                <SourcingBadge model={item.sourcing_model} />
                              )}
                            </div>
                          </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{item.vendor || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{item.unit_of_measure || "Each"}</TableCell>
                        <TableCell className="text-right text-sm">${(item.wholesale_cost || 0).toFixed(2)}</TableCell>
                        <TableCell className="text-right text-sm font-medium">${(item.retail_price || 0).toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <span className="text-emerald-600 font-semibold text-sm">{marginPct}%</span>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-1 justify-end">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingItem(item); setDialogOpen(true); }}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteMut.mutate(item.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      <CatalogFormDialog open={dialogOpen} onOpenChange={setDialogOpen} item={editingItem} onSave={handleSave} />
      <CatalogItemDetailSheet item={detailItem} open={!!detailItem} onClose={() => setDetailItem(null)} />
    </div>
  );
}