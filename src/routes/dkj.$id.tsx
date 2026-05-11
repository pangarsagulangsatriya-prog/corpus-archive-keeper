import { createFileRoute, Link } from "@tanstack/react-router";
import { fetchRow } from "@/lib/corpus-data";
import { DetailView } from "@/components/DetailView";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/dkj/$id")({
  component: () => {
    const { id } = Route.useParams();
    const { data: row, isLoading } = useQuery({
      queryKey: ['row', 'DKJ', id],
      queryFn: () => fetchRow("DKJ", id)
    });

    if (isLoading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
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
