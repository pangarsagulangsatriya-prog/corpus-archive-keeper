import { createFileRoute, Link } from "@tanstack/react-router";
import { findRow } from "@/lib/corpus-data";
import { DetailView } from "@/components/DetailView";

export const Route = createFileRoute("/ksk/$id")({
  component: () => {
    const { id } = Route.useParams();
    const row = findRow("KSK", id);
    if (!row)
      return (
        <div className="flex min-h-screen items-center justify-center">
          <Link to="/" className="text-primary underline">Row not found — back</Link>
        </div>
      );
    return <DetailView row={row} backTo="Korpus KSK" />;
  },
});
