// A product's cart/order id is derived from its category + name, not a
// stored field. This means admin can add/remove/edit accessories freely
// from the dashboard without ever having to fill in a hidden "id" — the
// same derivation runs on the client (cart) and server (price lookup at
// checkout), so they always agree.
export function getProductId(categoryKey, name) {
  return `${categoryKey}::${name}`;
}

export function parsePriceValue(priceFrom) {
  if (!priceFrom) return 0;
  const digits = String(priceFrom).replace(/[^\d]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

// Flat list of every product across all categories, each with a derived id,
// numeric price, and stock flag — the single source of truth used by the
// shop grid, search, cart, and the server-side checkout price map.
export function flattenProducts(productCategories) {
  const flat = [];
  (productCategories || []).forEach((cat) => {
    (cat.items || []).forEach((item) => {
      flat.push({
        ...item,
        id: getProductId(cat.key, item.name),
        price: parsePriceValue(item.priceFrom),
        inStock: item.inStock !== false,
        categoryKey: cat.key,
        categoryLabel: cat.label,
      });
    });
  });
  return flat;
}
