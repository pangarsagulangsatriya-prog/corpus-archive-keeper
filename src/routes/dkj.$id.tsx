import { createFileRoute, Link } from "@tanstack/react-router";
import { findRow } from "@/lib/corpus-data";
import { DetailView } from "@/components/DetailView";

export const Route = createFileRoute("/dkj/$id")({
  component: () => {
    const { id } = Route.useParams();
    const row = findRow("DKJ", id);
    if (!row) return <NotFound />;
    return <DetailView row={row} backTo="Korpus DKJ" />;
  },
});

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Row not found.</p>
        <Link to="/" className="text-primary underline">Back to corpus</Link>
      </div>
    </div>
  );
}
