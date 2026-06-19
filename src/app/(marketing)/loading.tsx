import { Container } from "@/components/shared/container";
import { LoadingRegion } from "@/components/shared/skeleton";

export default function MarketingLoading() {
  return (
    <Container className="py-16">
      <LoadingRegion label="Loading page" />
    </Container>
  );
}
