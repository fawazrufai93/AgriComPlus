// Generates supabase-seed.sql from src/data/mockData.ts
// Run: npx tsx scripts/generate-seed.ts > supabase-seed.sql
import { PRODUCTS, FARMS } from '../src/data/mockData';

const q = (v: unknown) => (v === undefined || v === null ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
const arr = (a: string[] = []) => `array[${a.map(q).join(',')}]::text[]`;
const json = (v: unknown) => `${q(JSON.stringify(v ?? []))}::jsonb`;

console.log('-- Seed data generated from mockData.ts (safe to re-run: existing rows are left untouched)\n');

for (const f of Object.values(FARMS)) {
  console.log(
    `insert into public.farms (id,name,cluster,location,region,bio,practices,certifications,photo,farmer_name,farmer_photo,rating,reviews_count,established_year,phone,lat,lng) values (` +
      [q(f.id), q(f.name), q(f.cluster), q(f.location), q(f.region), q(f.bio), arr(f.practices), json(f.certifications), q(f.photo), q(f.farmerName), q(f.farmerPhoto), f.rating, f.reviewsCount, f.establishedYear, q(f.phone), f.coordinates.lat, f.coordinates.lng].join(',') +
      `) on conflict (id) do nothing;`
  );
}
console.log('');
for (const p of PRODUCTS) {
  console.log(
    `insert into public.products (id,name,local_name,category,price,original_price,discount_percent,unit,weight,images,farm_id,description,health_tags,in_stock,stock_count,harvest_date,shelf_life,nutrition_highlights) values (` +
      [q(p.id), q(p.name), q(p.localName), q(p.category), p.price, p.originalPrice, p.discountPercent, q(p.unit), q(p.weight), arr(p.images), q(p.farmId), q(p.description), arr(p.healthTags), p.inStock, p.stockCount, q(p.harvestDate), q(p.shelfLife), arr(p.nutritionHighlights)].join(',') +
      `) on conflict (id) do nothing;`
  );
}
