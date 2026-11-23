import { ProductPhoto } from "@/components/product-photo";
import { photographedProducts } from "@/lib/products";

/** The six products in the demo, shown like a menu. */
export function ProductStrip() {
  return (
    <div>
      <ul className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {photographedProducts.map((product, i) => (
          <li key={product} className="rounded-2xl border border-border bg-card shadow-card p-1.5 shadow-card sm:p-2">
            <ProductPhoto
              product={product}
              sizes="(min-width: 1024px) 160px, 30vw"
              priority={i < 3}
              className="rounded-lg"
            />
            <p className="px-1 pb-1 pt-2 text-xs font-medium leading-tight sm:text-sm">{product}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">Product photos are for illustration.</p>
    </div>
  );
}
