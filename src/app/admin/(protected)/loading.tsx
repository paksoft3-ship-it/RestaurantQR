import { LoadingRegion } from "@/components/shared/skeleton";

export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-6">
      <LoadingRegion label="Loading admin workspace" />
    </div>
  );
}
