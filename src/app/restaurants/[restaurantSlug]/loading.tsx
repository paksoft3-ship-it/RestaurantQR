import { Container } from "@/components/shared/container";
import { LoadingRegion } from "@/components/shared/skeleton";

export default function RestaurantLoading() {
  return (
    <Container className="py-8">
      <LoadingRegion label="Loading restaurant" />
    </Container>
  );
}
