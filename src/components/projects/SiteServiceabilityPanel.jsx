import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, MapPin, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function SiteServiceabilityPanel({ project }) {
  const [notes, setNotes] = useState(project?.serviceability_notes || "");
  const [saved, setSaved] = useState(false);
  const qc = useQueryClient();

  const saveMut = useMutation({
    mutationFn: () => base44.entities.ProjectEstimate.update(project.id, { serviceability_notes: notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project", project.id] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">Site Serviceability</h3>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Run a serviceability check via NXTSYS before quoting connectivity services.
      </p>

      <a
        href="https://www.nxtsys.com/service-locator"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between w-full border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 rounded-xl px-4 py-4 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
            <span className="text-orange-700 font-black text-sm">N</span>
          </div>
          <div>
            <p className="font-semibold text-sm group-hover:text-primary transition-colors">NXTSYS Service Locator</p>
            <p className="text-xs text-muted-foreground">Check carrier availability at this site</p>
          </div>
        </div>
        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
      </a>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" /> Serviceability Results Notes
        </Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste carrier availability results, speed tiers, pricing, or any notes from the NXTSYS check..."
          rows={4}
          className="text-sm"
        />
      </div>

      <Button
        size="sm"
        variant={saved ? "default" : "outline"}
        className="w-full"
        onClick={() => saveMut.mutate()}
        disabled={saveMut.isPending}
      >
        {saved ? "Saved!" : "Save Notes"}
      </Button>
    </div>
  );
}