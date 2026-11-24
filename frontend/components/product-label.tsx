/** A product name with how many units one box holds, for tables whose numbers are units. */
export function ProductLabel({ product, boxSize }: { product: string; boxSize: number }) {
  return (
    <>
      {product}
      <span className="block text-xs font-normal text-muted-foreground">{boxSize} per box</span>
    </>
  );
}
