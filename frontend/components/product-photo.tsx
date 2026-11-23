import Image from "next/image";
import { productPhoto } from "@/lib/products";
import { cn } from "@/lib/utils";

type Props = { product: string; sizes: string; priority?: boolean; className?: string };

/** Square product photo with a blurred placeholder. Shows a neutral tile if a product has no photo. */
export function ProductPhoto({ product, sizes, priority, className }: Props) {
  const photo = productPhoto(product);
  return (
    <div className={cn("relative aspect-square overflow-hidden rounded-xl bg-muted", className)}>
      {photo ? (
        <Image
          src={photo.image}
          alt={photo.alt}
          fill
          sizes={sizes}
          priority={priority}
          placeholder="blur"
          className="object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="grid h-full place-items-center text-2xl font-semibold text-muted-foreground"
        >
          {product.charAt(0)}
        </span>
      )}
    </div>
  );
}
