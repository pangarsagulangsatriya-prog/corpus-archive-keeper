import { createFileRoute, Link } from "@tanstack/react-router";
import { fetchRow } from "@/lib/corpus-data";
import { DetailView } from "@/components/DetailView";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/tempo/$id")({
  component: () => {
    const { id } = Route.useParams();
    const { data: row, isLoading } = useQuery({
      queryKey: ['row', 'Tempo', id],
      queryFn: () => fetchRow("Tempo", id)
    });

    if (isLoading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
    if (!row)
      return (
        <div className="flex min-h-screen items-center justify-center">
          <Link to="/" className="text-primary underline">Row not found — back</Link>
        </div>
      );
    return <DetailView row={row} backTo="Korpus Tempo" />;
  },
});
