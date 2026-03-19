import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CategoryBadge from "@/components/shared/CategoryBadge";
import EmptyState from "@/components/shared/EmptyState";
import CatalogFormDialog from "@/components/catalog/CatalogFormDialog";

export default function Catalog() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const qc = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["catalogItems"],
    queryFn: () => base44.entities.CatalogItem.list("-created_date"),
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.CatalogItem.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["catalogItems"] }); setDialogOpen(false); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CatalogItem.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["catalogItems"] }); setDialogOpen(false); setEditingItem(null); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.CatalogItem.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogItems"] }),
  });

  const filtered = items.filter((i) => {
    const matchesSearch = !search || i.item_name?.toLowerCase().includes(search.toLowerCase()) || i.sku?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCat === "all" || i.category === filterCat;
    return matchesSearch && matchesCat;
  });

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
          <p className="text-sm text-muted-foreground mt-1">Manage hardware, software, and labor items</p>
        </div>
        <Button className="gap-2" onClick={() => { setEditingItem(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4" /> Add Item
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or SKU..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Hardware">Hardware</SelectItem>
            <SelectItem value="Software">Software</SelectItem>
            <SelectItem value="Labor">Labor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={Package} title="No items found" description={search ? "Try adjusting your search." : "Add your first catalog item to get started."} actionLabel={!search ? "Add Item" : undefined} onAction={() => { setEditingItem(null); setDialogOpen(true); }} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Item</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">Wholesale</TableHead>
                  <TableHead className="text-right">Retail</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => {
                  const margin = (item.retail_price || 0) - (item.wholesale_cost || 0);
                  return (
                    <TableRow key={item.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{item.item_name}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">{item.sku}</TableCell>
                      <TableCell><CategoryBadge category={item.category} /></TableCell>
                      <TableCell className="text-muted-foreground">{item.vendor}</TableCell>
                      <TableCell className="text-right">${(item.wholesale_cost || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">${(item.retail_price || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-right text-emerald-600 font-medium">${margin.toFixed(2)}</TableCell>
                      <TableCell>
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

      <CatalogFormDialog open={dialogOpen} onOpenChange={setDialogOpen} item={editingItem} onSave={handleSave} />
    </div>
  );
}