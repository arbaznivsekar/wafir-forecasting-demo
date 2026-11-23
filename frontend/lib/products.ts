import type { StaticImageData } from "next/image";
import butterBiscuits from "@/public/products/butter-biscuits.png";
import cheesePastry from "@/public/products/cheese-pastry.png";
import chocolateCake from "@/public/products/chocolate-cake.png";
import dateCookies from "@/public/products/date-cookies.png";
import miniMuffins from "@/public/products/mini-muffins.png";
import vanillaCake from "@/public/products/vanilla-cake.png";

export type ProductPhoto = { image: StaticImageData; alt: string };

// Keys are the product names used in data.json. A product with no photo falls back to a neutral tile.
const photos: Record<string, ProductPhoto> = {
  "Chocolate Cake": { image: chocolateCake, alt: "Slice of layered chocolate cake with a chocolate swirl on top" },
  "Vanilla Cake": { image: vanillaCake, alt: "Slice of layered vanilla cake with white frosting" },
  "Cheese Pastry": { image: cheesePastry, alt: "Golden puff pastry square filled with soft cheese" },
  "Date Cookies": { image: dateCookies, alt: "Plate of powdered date cookies, some cut open to show the filling" },
  "Butter Biscuits": { image: butterBiscuits, alt: "Stack of round butter biscuits dusted with sugar" },
  "Mini Muffins": { image: miniMuffins, alt: "Mini chocolate chip muffins on a plate" },
};

export const productPhoto = (product: string): ProductPhoto | undefined => photos[product];

/** Product names that have a photo, in display order. */
export const photographedProducts = Object.keys(photos);
