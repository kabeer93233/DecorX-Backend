const { Client } = require('pg');

const DATABASE_URL =
  'postgresql://postgres.jcxfyzzojcmbbkxzfkkw:KaBeEr.123$5@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres';

const U = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;

// All images selected to show a SINGLE isolated item on a clean/plain background.
// Lifestyle / multi-item / room-scene photos intentionally excluded.
const products = [

  // ── SOFAS (single sofa against plain wall or white bg) ────────────────────────
  { productName: 'Modern Grey Sofa',           description: '3-seater sofa in neutral grey. Clean Scandinavian lines.',                    category: 'Sofa',       price: 899,  width: 220, height: 85,  image: U('1555041469-a586c61ea9bc') },
  { productName: 'Contemporary Fabric Sofa',   description: 'Contemporary fabric sofa. Firm cushioning and solid wooden legs.',           category: 'Sofa',       price: 850,  width: 210, height: 84,  image: U('1691480152351-4b3f2c89ccff') },
  { productName: 'Upholstered 2-Seat Sofa',    description: 'Compact 2-seat sofa in warm upholstery. Ideal for small apartments.',       category: 'Sofa',       price: 620,  width: 155, height: 82,  image: U('1684165610413-2401399e0e59') },
  { productName: 'Soft Cushion Sofa',          description: 'Plush sofa with deep cushions. Perfect for relaxed living rooms.',           category: 'Sofa',       price: 780,  width: 200, height: 86,  image: U('1624351231514-aa7a3189d9cf') },

  // ── CHAIRS (single armchair / accent chair on plain background) ───────────────
  { productName: 'White Studio Armchair',      description: 'Clean white wooden armchair. Ideal for Scandinavian and minimalist rooms.',  category: 'Chair',      price: 290,  width: 75,  height: 90,  image: U('1505843490538-5133c6c7d0e1') },
  { productName: 'Modern Accent Chair',        description: 'Upholstered accent chair. Solid beech frame with padded seat.',             category: 'Chair',      price: 350,  width: 80,  height: 94,  image: U('1537258420529-0c5451503199') },
  { productName: 'Minimalist Side Chair',      description: 'Slim profile side chair in natural finish. Versatile and lightweight.',     category: 'Chair',      price: 240,  width: 70,  height: 88,  image: U('1679928751343-a613a7fd3a83') },
  { productName: 'Classic Padded Armchair',    description: 'Well-padded armchair with wooden legs. Timeless design.',                   category: 'Chair',      price: 420,  width: 82,  height: 96,  image: U('1561677978-583a8c7a4b43') },
  { productName: 'Scandinavian Lounge Chair',  description: 'Grey upholstered lounge chair with slim oak legs.',                        category: 'Chair',      price: 380,  width: 78,  height: 92,  image: U('1506898667547-42e22a46e125') },
  { productName: 'Black Leather Armchair',     description: 'Classic black leather armchair with cushioned seat and padded arms.',      category: 'Chair',      price: 520,  width: 82,  height: 98,  image: U('1617364852223-75f57e78dc96') },

  // ── TABLES (single table on plain background) ─────────────────────────────────
  { productName: 'Round Wooden Dining Table',  description: 'Round solid wood dining table. 120 cm diameter. Seats 4.',                 category: 'Table',      price: 480,  width: 120, height: 75,  image: U('1611486212355-d276af4581c0') },
  { productName: 'Modern Coffee Table',        description: 'Contemporary coffee table with clean geometric lines.',                     category: 'Table',      price: 340,  width: 100, height: 40,  image: U('1738253729030-36051a328db9') },
  { productName: 'Walnut Side Table',          description: 'Solid walnut side table. Compact and versatile.',                          category: 'Table',      price: 220,  width: 55,  height: 60,  image: U('1510877073473-6d4545e9c2af') },
  { productName: 'Glass Coffee Table',         description: 'Tempered glass coffee table with brushed chrome base.',                    category: 'Table',      price: 420,  width: 100, height: 42,  image: U('1718049719673-70ee6f6dfa28') },

  // ── LAMPS (single lamp, plain background) ─────────────────────────────────────
  { productName: 'Modern Floor Lamp',          description: 'Matte black arc floor lamp with linen shade. 165 cm tall.',                category: 'Lamp',       price: 180,  width: 35,  height: 165, image: U('1756474215958-f0c2a31eddc1') },
  { productName: 'Designer Table Lamp',        description: 'Designer table lamp with warm-toned shade. Ideal for bedside use.',        category: 'Lamp',       price: 110,  width: 25,  height: 48,  image: U('1622127922040-13cab637ee78') },
  { productName: 'White Table Lamp',           description: 'Classic white table lamp casting diffused warm light.',                    category: 'Lamp',       price: 95,   width: 22,  height: 44,  image: U('1554343151-a28654388518') },
  { productName: 'Warm Glow Bedside Lamp',     description: 'Brown and white table lamp. Perfect for reading nooks.',                   category: 'Lamp',       price: 85,   width: 20,  height: 42,  image: U('1517991104123-1d56a6e81ed9') },
  { productName: 'Slim Floor Standing Lamp',   description: 'Slim modern floor lamp for warm ambient corner lighting.',                 category: 'Lamp',       price: 220,  width: 30,  height: 170, image: U('1560448076-957f79776e95') },

  // ── CABINETS / SHELVES (single unit, plain background) ────────────────────────
  { productName: 'Wooden Chest of Drawers',    description: 'Solid wood chest of drawers with 5 spacious drawers.',                    category: 'Cabinet',    price: 580,  width: 100, height: 110, image: U('1586336049238-c3f97b6af323') },
  { productName: 'Modern Dresser',             description: 'Contemporary dresser with clean handleless drawer fronts.',               category: 'Cabinet',    price: 650,  width: 120, height: 80,  image: U('1591129841117-3adfd313e34f') },
  { productName: 'Storage Cabinet',            description: 'Versatile storage cabinet with adjustable shelves and doors.',            category: 'Cabinet',    price: 490,  width: 90,  height: 140, image: U('1684846416931-dddf8cbfc2ad') },
  { productName: 'Classic Bookshelf',          description: 'Open bookshelf with 5 shelves. Rich warm wood finish.',                   category: 'Cabinet',    price: 380,  width: 80,  height: 180, image: U('1542713504-03db5fb21c66') },
  { productName: 'Floating Wall Shelf',        description: 'White wall-mounted floating shelf. Minimalist storage.',                  category: 'Cabinet',    price: 160,  width: 90,  height: 20,  image: U('1614620026694-f5f38182ab9f') },
  { productName: 'Wooden Nightstand',          description: 'Brown wooden nightstand with one drawer. Bedside essential.',             category: 'Cabinet',    price: 160,  width: 45,  height: 58,  image: U('1544691560-fc2053d97726') },

  // ── BEDS (single bed, plain background or minimal room context) ───────────────
  { productName: 'Modern Upholstered Bed',     description: 'Upholstered platform bed with cushioned headboard. Queen size.',          category: 'Bed',        price: 920,  width: 160, height: 110, image: U('1635594202056-9ea3b497e5c0') },
  { productName: 'Linen Platform Bed',         description: 'White linen platform bed. Clean and contemporary aesthetic.',             category: 'Bed',        price: 850,  width: 160, height: 108, image: U('1663811397216-8073705919cd') },
  { productName: 'Queen Bed Frame',            description: 'Queen bed frame with slatted headboard and solid wood base.',            category: 'Bed',        price: 780,  width: 160, height: 100, image: U('1505693416388-ac5ce068fe85') },

  // ── STOOLS / OTTOMANS (single stool, plain background) ────────────────────────
  { productName: 'Minimal Wooden Stool',       description: 'Solid wood accent stool. Use as seating or side table.',                  category: 'Stool',      price: 120,  width: 40,  height: 45,  image: U('1737422775708-5c36da8274b2') },
  { productName: 'Natural Beech Bar Stool',    description: 'Beech wood bar stool with comfortable round seat.',                      category: 'Stool',      price: 180,  width: 38,  height: 65,  image: U('1503602642458-232111445657') },
  { productName: 'Round Accent Stool',         description: 'Curved accent stool in natural finish. Doubles as a side table.',        category: 'Stool',      price: 140,  width: 38,  height: 46,  image: U('1779278547541-370129cc09f7') },
  { productName: 'Grey Upholstered Stool',     description: 'Padded grey stool with low wooden base. Versatile piece.',               category: 'Stool',      price: 160,  width: 40,  height: 42,  image: U('1634798245965-03669c757183') },

  // ── DECORATION / PLANTS / VASES (single item, plain bg) ─────────────────────
  { productName: 'Minimalist Vase',            description: 'Artisan vase in matte earth tone. Ceramic, handmade.',                    category: 'Decoration', price: 45,   width: 15,  height: 30,  image: U('1487700160041-babef9c3cb55') },
  { productName: 'Sculptural Ceramic Vase',    description: 'Tall sculptural ceramic vase. Statement piece for any surface.',         category: 'Decoration', price: 65,   width: 18,  height: 40,  image: U('1610247673420-52d9683002eb') },
  { productName: 'Potted Plant',               description: 'Lush green indoor plant in a ceramic pot. Air purifying.',               category: 'Decoration', price: 75,   width: 30,  height: 60,  image: U('1692522034022-046f5523f968') },
  { productName: 'Decorative Stem in Vase',    description: 'Dried decorative stems in a neutral vase. Natural and calming.',         category: 'Decoration', price: 55,   width: 20,  height: 45,  image: U('1712585958506-a322855930d9') },
  { productName: 'Tabletop Plant',             description: 'Small tabletop plant in a white ceramic pot. Perfect shelf accent.',     category: 'Decoration', price: 40,   width: 18,  height: 25,  image: U('1585664428450-1665a336eb19') },
];

async function seed() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('Connected ✓');

    // Delete all previously seeded products (keep IDs 1, 2, 9, 10 — original hand-added ones)
    await client.query('DELETE FROM product WHERE id NOT IN (1, 2, 9, 10)');
    console.log('Cleared old seeded products.');

    const { rows: before } = await client.query('SELECT COUNT(*) FROM product');
    console.log(`Products remaining: ${before[0].count}`);

    let inserted = 0, skipped = 0;
    for (const p of products) {
      const { rows } = await client.query('SELECT id FROM product WHERE "productName" = $1', [p.productName]);
      if (rows.length > 0) { skipped++; continue; }
      await client.query(
        `INSERT INTO product ("productName", description, category, price, width, height, image) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [p.productName, p.description, p.category, p.price, p.width, p.height, p.image],
      );
      inserted++;
      process.stdout.write(`\r  ${inserted} inserted…`);
    }

    const { rows: after } = await client.query('SELECT COUNT(*) FROM product');
    console.log(`\nDone! Inserted: ${inserted} | Skipped: ${skipped} | Total: ${after[0].count}`);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}
seed();
