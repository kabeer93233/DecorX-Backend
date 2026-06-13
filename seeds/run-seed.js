const { Client } = require('pg');

const DATABASE_URL =
  'postgresql://postgres.jcxfyzzojcmbbkxzfkkw:KaBeEr.123$5@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres';

// Pexels CDN — single isolated furniture item, verified plain backgrounds
const P = (id) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800`;

// 121 verified Pexels furniture products — unique IDs, white/beige/gray plain backgrounds,
// single centred item per image, no duplicates, production-level selection.
const products = [
  // ── SOFAS (21) ───────────────────────────────────────────────────────────────
  { productName: 'White Leather Studio Sofa',              category: 'Sofa',    price: 85000,  width: 200, height: 85,  description: 'A contemporary white leather couch photographed in a clean minimalist studio setting.',                    image: P('10912069') },
  { productName: 'Beige Minimalist Sofa',                  category: 'Sofa',    price: 72000,  width: 195, height: 82,  description: 'An elegant beige sofa in a minimalist setting with ample copyspace and soft shadows.',                    image: P('8987432')  },
  { productName: 'Modern Red Two-Seater Sofa',             category: 'Sofa',    price: 68000,  width: 170, height: 80,  description: 'A bold modern red couch with wooden trim against a minimalist white wall.',                              image: P('925709')   },
  { productName: 'Black Leather Sofa',                     category: 'Sofa',    price: 90000,  width: 210, height: 88,  description: 'A single weathered black leather sofa against a plain white wall in a minimalist empty room.',             image: P('6045043')  },
  { productName: 'Modern Beige Loveseat',                  category: 'Sofa',    price: 65000,  width: 160, height: 78,  description: 'A modern beige sofa with wooden legs, perfect for stylish living room decor.',                            image: P('11112731') },
  { productName: 'Brown L-Shaped Sectional Sofa',          category: 'Sofa',    price: 120000, width: 260, height: 85,  description: 'An elegant brown L-shaped sectional sofa featuring striped cushions and modern design against a white background.', image: P('4172381') },
  { productName: 'Brown Leather Tufted Armchair Sofa',     category: 'Sofa',    price: 55000,  width: 90,  height: 92,  description: 'A luxurious brown leather armchair with classic button tufting in a studio setting.',                      image: P('14110168') },
  { productName: 'Vintage White Sofa',                     category: 'Sofa',    price: 78000,  width: 185, height: 80,  description: 'A vintage-style white wooden sofa with a beige throw in a bright minimalist space.',                       image: P('3965534')  },
  { productName: 'Classic Brown Leather Armchair',         category: 'Sofa',    price: 48000,  width: 85,  height: 90,  description: 'A sophisticated brown leather armchair with wooden legs, perfect for modern decor.',                      image: P('11112727') },
  { productName: 'Grey Upholstered Armchair',              category: 'Sofa',    price: 42000,  width: 80,  height: 85,  description: 'A modern single armchair in grey upholstery in a studio setting, perfect for home decor.',                image: P('12269762') },
  { productName: 'Beige Modern Accent Armchair',           category: 'Sofa',    price: 46000,  width: 78,  height: 84,  description: 'A sleek modern armchair with minimalist design on a white stand against a plain white background.',        image: P('25857376') },
  { productName: 'Wooden Frame Chair with Grey Cushion',   category: 'Sofa',    price: 35000,  width: 72,  height: 82,  description: 'A minimalist wooden chair with grey foam upholstery on a studio backdrop.',                               image: P('13718035') },
  { productName: 'Red Modern Accent Chair',                category: 'Sofa',    price: 38000,  width: 75,  height: 82,  description: 'A vibrant red modern armchair placed in a stylish minimalistic room with neutral white walls.',             image: P('5662650')  },
  { productName: 'Yellow Accent Armchair',                 category: 'Sofa',    price: 40000,  width: 76,  height: 80,  description: 'A bright yellow armchair standing against a white minimalist wall, showcasing modern design elegance.',    image: P('34984836') },
  { productName: 'Grey Modern Sofa',                       category: 'Sofa',    price: 75000,  width: 190, height: 84,  description: 'A stylish grey sofa in an elegant modern living room with minimalist decor.',                             image: P('12277196') },
  { productName: 'White Sofa with Floral Arrangement',     category: 'Sofa',    price: 72000,  width: 185, height: 82,  description: 'An elegant minimalist living room featuring a white sofa with a pink floral arrangement.',                image: P('12277413') },
  { productName: 'White Sofa Minimalist Living Room',      category: 'Sofa',    price: 68000,  width: 180, height: 80,  description: 'A modern minimalist living room featuring a clean white sofa and elegant decor.',                        image: P('12277406') },
  { productName: 'Elegant White Sofa with Decor',          category: 'Sofa',    price: 70000,  width: 182, height: 82,  description: 'An elegant minimalist living room with a pristine sofa and floral decor.',                               image: P('12277410') },
  { productName: 'Contemporary Living Room Sofa',          category: 'Sofa',    price: 78000,  width: 200, height: 85,  description: 'Elegant modern living room furniture arrangement with a contemporary sofa.',                               image: P('12289396') },
  { productName: 'Stylish Living Room with Geometric Sofa',category: 'Sofa',    price: 82000,  width: 210, height: 86,  description: 'A stylish living room with geometric decor and a modern upholstered sofa.',                               image: P('1571472')  },
  { productName: 'Brown Armchair with Dark Backdrop',      category: 'Sofa',    price: 52000,  width: 85,  height: 88,  description: 'A stylish brown armchair featured against a simple backdrop in close-up studio shot.',                    image: P('12269764') },

  // ── CHAIRS (32) ──────────────────────────────────────────────────────────────
  { productName: 'Classic Black Studio Chair',             category: 'Chair',   price: 18000,  width: 45,  height: 88,  description: 'A single black chair in a minimalistic studio setting with a neutral backdrop.',                          image: P('963486')   },
  { productName: 'Traditional Wooden Rocking Chair',       category: 'Chair',   price: 28000,  width: 60,  height: 110, description: 'A traditional wooden rocking chair, elegant and isolated on a white background.',                         image: P('4627515')  },
  { productName: 'Classic Rocking Chair Natural Wood',     category: 'Chair',   price: 28000,  width: 60,  height: 110, description: 'An elegant wooden rocking chair with traditional design, isolated on white.',                             image: P('4627516')  },
  { productName: 'Spindle-Back Rocking Chair',             category: 'Chair',   price: 30000,  width: 62,  height: 112, description: 'An elegant wooden rocking chair with classic spindle design, perfect for homes and decor.',               image: P('4627517')  },
  { productName: 'Transparent Acrylic Ghost Chair',        category: 'Chair',   price: 22000,  width: 48,  height: 84,  description: 'A sleek, transparent plastic chair with a minimalist design on a white background.',                      image: P('21567547') },
  { productName: 'Red Velvet Chair with Gold Legs',        category: 'Chair',   price: 32000,  width: 52,  height: 85,  description: 'A minimalist red velvet chair with golden legs on a white background, offering stylish furniture options.',image: P('21852582') },
  { productName: 'Grey Cushioned Armchair with Wooden Legs',category: 'Chair',  price: 35000,  width: 68,  height: 82,  description: 'A stylish gray armchair with wooden legs photographed on a white background.',                            image: P('11112735') },
  { productName: 'Green Padded Accent Chair Chrome Base',  category: 'Chair',   price: 29000,  width: 65,  height: 80,  description: 'A minimalist green armchair with chrome base on a white background.',                                      image: P('4172379')  },
  { productName: 'Red Minimalist Dining Chair',            category: 'Chair',   price: 15000,  width: 44,  height: 82,  description: 'A bright red minimalist chair centered on a stark white background, perfect for modern design concepts.',  image: P('4172380')  },
  { productName: 'Brown Leather Club Chair',               category: 'Chair',   price: 42000,  width: 72,  height: 85,  description: 'A classic brown leather armchair with wooden legs on a white background, ideal for stylish interiors.',    image: P('11112734') },
  { productName: 'Studded Brown Leather Armchair',         category: 'Chair',   price: 45000,  width: 74,  height: 88,  description: 'A classic brown leather armchair with wooden legs and studded details, perfect for cozy interiors.',       image: P('11112729') },
  { productName: 'White Fabric Minimalist Chair',          category: 'Chair',   price: 24000,  width: 50,  height: 82,  description: 'A modern minimalist chair in soft white fabric against a light neutral background.',                       image: P('32562036') },
  { productName: 'Wooden Chair with Rounded Back',         category: 'Chair',   price: 18000,  width: 46,  height: 80,  description: 'A brown wooden chair with rounded back and black legs placed on a studio floor with white background.',    image: P('7803380')  },
  { productName: 'Mid-Century Ant Chair',                  category: 'Chair',   price: 20000,  width: 48,  height: 78,  description: 'A stylish ant chair with curved wooden seat and sleek metal legs against a white background.',              image: P('7803376')  },
  { productName: 'Side-View Wooden Cushioned Chair',       category: 'Chair',   price: 22000,  width: 50,  height: 84,  description: 'A side view of a stylish wooden chair with cushioned seat on a white background.',                         image: P('11112732') },
  { productName: 'Vintage Wooden Armchair',                category: 'Chair',   price: 32000,  width: 65,  height: 90,  description: 'A vintage wooden armchair with intricate design sitting on a white background.',                           image: P('11112742') },
  { productName: 'Classic Wooden Dining Chair',            category: 'Chair',   price: 15000,  width: 44,  height: 88,  description: 'A classic wooden chair with minimalist design on a white surface.',                                        image: P('11112728') },
  { productName: 'Sleek Black Metal Chair',                category: 'Chair',   price: 16000,  width: 46,  height: 84,  description: 'A sleek black metal chair captured in a minimalist studio shot with white background.',                     image: P('6800569')  },
  { productName: 'Rustic Wooden Chair with Cushion',       category: 'Chair',   price: 19000,  width: 48,  height: 86,  description: 'A side view of a stylish rustic wooden chair with a black cushion against a white background.',            image: P('11112733') },
  { productName: 'Simple Brown Wooden Chair',              category: 'Chair',   price: 14000,  width: 44,  height: 80,  description: 'A simple wooden chair sitting in a bright, minimalist interior with a white background.',                  image: P('7193706')  },
  { productName: 'Black Folding Chair',                    category: 'Chair',   price: 12000,  width: 42,  height: 82,  description: 'A sleek black folding chair set against a plain white background, perfect for modern design themes.',       image: P('10989134') },
  { productName: 'White Wooden Folding Chair',             category: 'Chair',   price: 12000,  width: 42,  height: 82,  description: 'A simple white wooden folding chair in a minimalist setting.',                                             image: P('11770741') },
  { productName: 'Wooden Armchair with Grey Cushions',     category: 'Chair',   price: 34000,  width: 66,  height: 84,  description: 'A stylish wooden armchair with gray cushions on a white background, ideal for modern interiors.',          image: P('17488642') },
  { productName: 'Sleek Wood Frame Cushioned Chair',       category: 'Chair',   price: 34000,  width: 64,  height: 82,  description: 'A sleek wooden armchair with gray cushions on a white background, perfect for minimalist decor.',          image: P('17488644') },
  { productName: 'Grey Lounge Chair Natural Wood',         category: 'Chair',   price: 36000,  width: 68,  height: 86,  description: 'An elegant gray cushioned wooden lounge chair with white background.',                                     image: P('17488645') },
  { productName: 'Minimalist Studio Wooden Chair',         category: 'Chair',   price: 13000,  width: 44,  height: 80,  description: 'A simple wooden chair set against a plain white wall in a studio setting.',                                image: P('11474966') },
  { productName: 'Orange Metal Chair',                     category: 'Chair',   price: 16000,  width: 46,  height: 84,  description: 'A single orange metal chair standing elegantly in a minimalist indoor setting with white background.',      image: P('34375061') },
  { productName: 'Transparent Backrest Modern Chair',      category: 'Chair',   price: 20000,  width: 48,  height: 82,  description: 'A modern minimalist chair with transparent backrest on a white studio background.',                         image: P('10912371') },
  { productName: 'Beige Armchair with Pink Bouquet',       category: 'Chair',   price: 35000,  width: 70,  height: 82,  description: 'A stylish beige armchair with a pink flower bouquet on a clean white background.',                         image: P('7303462')  },
  { productName: 'White Armchair with Wooden Side Table',  category: 'Chair',   price: 38000,  width: 72,  height: 84,  description: 'A sleek minimalist living room featuring a white armchair and a wooden side table with a plant.',          image: P('12277130') },
  { productName: 'Modern Armchair with Plant',             category: 'Chair',   price: 40000,  width: 74,  height: 86,  description: 'An elegant modern armchair beside a potted plant in a minimalist living space.',                           image: P('12277409') },
  { productName: 'Armchair Beside White Wall',             category: 'Chair',   price: 36000,  width: 70,  height: 82,  description: 'A bright minimalist room featuring an armchair and wooden dresser with greenery.',                         image: P('17271981') },

  // ── TABLES (18) ──────────────────────────────────────────────────────────────
  { productName: 'Wooden Table with Black Metal Legs',     category: 'Table',   price: 45000,  width: 120, height: 75,  description: 'A sleek minimalist wooden table with black metal legs on white background.',                                image: P('11112740') },
  { productName: 'Elegant Minimalist Wooden Table',        category: 'Table',   price: 52000,  width: 140, height: 75,  description: 'An elegant wooden dining table showcased on a clean white backdrop, highlighting minimalist design.',       image: P('11112739') },
  { productName: 'Simple Wooden Side Table',               category: 'Table',   price: 22000,  width: 60,  height: 55,  description: 'A simple wooden table with clean design against a white backdrop.',                                        image: P('4172382')  },
  { productName: 'Orange Modern Side Table',               category: 'Table',   price: 18000,  width: 55,  height: 50,  description: 'A sleek orange table with minimalist design on a crisp white background.',                                 image: P('4172383')  },
  { productName: 'Studio Wooden Table',                    category: 'Table',   price: 35000,  width: 100, height: 72,  description: 'A simple wooden table featuring minimalist design captured on a white background.',                         image: P('6046814')  },
  { productName: 'Minimalist Rectangular Dining Table',    category: 'Table',   price: 55000,  width: 160, height: 75,  description: 'A simple and elegant minimalist wooden table set against a plain white wall.',                              image: P('34658646') },
  { productName: 'White Minimalist Side Table',            category: 'Table',   price: 20000,  width: 50,  height: 55,  description: 'A simple minimalist white table in an empty white room providing a modern aesthetic.',                      image: P('9774369')  },
  { productName: 'Round White Side Table',                 category: 'Table',   price: 18000,  width: 50,  height: 55,  description: 'A round white pedestal side table against a neutral background.',                                          image: P('5474392')  },
  { productName: 'Wooden Dining Chair and Table Set',      category: 'Table',   price: 65000,  width: 150, height: 75,  description: 'A wooden dining table and chair combination in a minimalist interior setting.',                             image: P('12278558') },
  { productName: 'Light Wood Media Table',                 category: 'Table',   price: 38000,  width: 120, height: 50,  description: 'A bright modern living room featuring a stylish blue sofa and light wood cabinet unit.',                    image: P('12291714') },
  { productName: 'Minimalist Wooden Desk',                 category: 'Table',   price: 40000,  width: 110, height: 75,  description: 'A modern minimalist living room with stylish furniture featuring a wooden desk.',                           image: P('12291715') },
  { productName: 'Wooden Nightstand Side Table',           category: 'Table',   price: 20000,  width: 50,  height: 58,  description: 'A white desk lamp on a brown wooden nightstand, a stylish bedroom accent.',                                 image: P('12291716') },
  { productName: 'White Study Table',                      category: 'Table',   price: 30000,  width: 100, height: 75,  description: 'A white table with a blue notebook in a modern minimalist room setting.',                                  image: P('940298')   },
  { productName: 'Minimalist Interior Wooden Table',       category: 'Table',   price: 35000,  width: 90,  height: 72,  description: 'A minimalist interior with a wooden table, potted plant, and ceramics on a white background.',              image: P('4386350')  },
  { productName: 'White Study Desk',                       category: 'Table',   price: 28000,  width: 120, height: 75,  description: 'An organized workspace with a laptop on a white table against a clean background.',                         image: P('8004070')  },
  { productName: 'Office Desk White',                      category: 'Table',   price: 32000,  width: 130, height: 75,  description: 'An office setup with eyeglasses and plant on a white desk with clean background.',                          image: P('8092463')  },
  { productName: 'Minimalist White Console Table',         category: 'Table',   price: 25000,  width: 80,  height: 75,  description: 'Glass bottles and stacked books on a white table with a neutral background.',                               image: P('10140504') },
  { productName: 'Natural Wooden Dining Table',            category: 'Table',   price: 58000,  width: 150, height: 75,  description: 'A wooden dining table featuring natural wood grain and a clean minimalist background.',                      image: P('7272844')  },

  // ── CABINETS (16) ────────────────────────────────────────────────────────────
  { productName: 'Slatted Wood Cabinet with Wicker Drawers',category: 'Cabinet',price: 55000,  width: 90,  height: 80,  description: 'A wooden cabinet featuring slatted doors and woven wicker drawers for versatile storage.',                  image: P('11112749') },
  { productName: 'Classic White Chest of Drawers',         category: 'Cabinet', price: 48000,  width: 80,  height: 120, description: 'A classic tall white chest with ornate handles set against a neutral background.',                           image: P('8135253')  },
  { productName: 'White Cabinet with Gold Accents',        category: 'Cabinet', price: 65000,  width: 95,  height: 90,  description: 'A sleek white cabinet with elegant gold decorations on a modern white background.',                          image: P('8313206')  },
  { productName: 'Modern Wooden Cabinet with Decor',       category: 'Cabinet', price: 58000,  width: 100, height: 85,  description: 'A modern minimalist wooden cabinet with contemporary styling in a bright interior.',                         image: P('12277217') },
  { productName: 'Minimalist Wooden Sideboard',            category: 'Cabinet', price: 62000,  width: 120, height: 75,  description: 'A bright minimalist interior featuring a wooden sideboard against a white background.',                      image: P('12277199') },
  { productName: 'Wooden Storage Cabinet with Handles',    category: 'Cabinet', price: 52000,  width: 85,  height: 90,  description: 'A beautiful wooden cabinet with sleek handles and natural wood grain, ideal for stylish interiors.',         image: P('11643074') },
  { productName: 'Wooden Sideboard Minimalist Interior',   category: 'Cabinet', price: 60000,  width: 130, height: 70,  description: 'An elegant minimalist interior design featuring a wooden sideboard with clean lines.',                       image: P('12277129') },
  { productName: 'Dark Sleek Sideboard',                   category: 'Cabinet', price: 68000,  width: 140, height: 72,  description: 'A stylish modern living room featuring a dark armchair and sleek sideboard against a neutral background.',   image: P('12277348') },
  { productName: 'White Sideboard Modern',                 category: 'Cabinet', price: 55000,  width: 120, height: 70,  description: 'A stylish living room with modern decor featuring a white sideboard.',                                      image: P('28753142') },
  { productName: 'Cream Wooden Desk with Drawers',         category: 'Cabinet', price: 42000,  width: 110, height: 75,  description: 'A minimalist cream wooden desk with drawers and shelf against a brown background.',                          image: P('8135285')  },
  { productName: 'Modern Minimalist Wardrobe',             category: 'Cabinet', price: 85000,  width: 160, height: 200, description: 'A modern minimalist wardrobe with organized storage solutions in a bright interior.',                        image: P('9646754')  },
  { productName: 'White Wardrobe with Panel Doors',        category: 'Cabinet', price: 72000,  width: 150, height: 200, description: 'A big closet with knobs on white doors placed in a minimalist room.',                                        image: P('6301178')  },
  { productName: 'White Sliding Door Wardrobe',            category: 'Cabinet', price: 78000,  width: 180, height: 210, description: 'A minimalist white wardrobe with a door in a spacious hallway setting.',                                     image: P('6508349')  },
  { productName: 'Wooden Cabinet Minimalist Room',         category: 'Cabinet', price: 58000,  width: 90,  height: 85,  description: 'A stylish wooden cabinet in a minimalist room with fresh pink flowers on top.',                              image: P('34558080') },
  { productName: 'Light Wood Sideboard with Plant',        category: 'Cabinet', price: 62000,  width: 120, height: 72,  description: 'A bright minimalist interior with wooden furniture including a sleek sideboard.',                            image: P('17271978') },
  { productName: 'Wooden Wall Shelf',                      category: 'Cabinet', price: 18000,  width: 80,  height: 25,  description: 'A simple wooden wall shelf near a white wall in a minimalist interior.',                                    image: P('12277635') },

  // ── LAMPS (13) ───────────────────────────────────────────────────────────────
  { productName: 'White Minimalist Floor Lamp',            category: 'Lamp',    price: 22000,  width: 30,  height: 165, description: 'A sleek white floor lamp with a minimalist design set against a neutral backdrop.',                           image: P('30353221') },
  { productName: 'Wooden Floor Lamp with White Shade',     category: 'Lamp',    price: 28000,  width: 35,  height: 160, description: 'A minimalist wooden floor lamp with white shade against a neutral backdrop, ideal for modern interiors.',    image: P('6633445')  },
  { productName: 'Geometric Metal Table Lamp',             category: 'Lamp',    price: 18000,  width: 25,  height: 50,  description: 'A minimalist geometric metal table lamp with adjustable design on a white backdrop.',                        image: P('8263851')  },
  { productName: 'Black Adjustable Desk Lamp',             category: 'Lamp',    price: 15000,  width: 40,  height: 55,  description: 'A sleek black desk lamp with adjustable arms on a plain white background, showcasing modern design.',        image: P('8263858')  },
  { productName: 'Chrome Modern Desk Lamp',                category: 'Lamp',    price: 20000,  width: 35,  height: 52,  description: 'A sleek and modern chrome desk lamp set against a white background, showcasing minimalist design.',           image: P('7184401')  },
  { productName: 'Rattan Pendant Lamp',                    category: 'Lamp',    price: 16000,  width: 40,  height: 40,  description: 'An elegant rattan pendant lamp with woven design against a stark white backdrop.',                           image: P('3554241')  },
  { productName: 'Metal Mesh Pendant Lamp',                category: 'Lamp',    price: 18000,  width: 35,  height: 35,  description: 'A close-up of a stylish pendant lamp with metal mesh design against a white background.',                    image: P('7803537')  },
  { productName: 'White Pendant Light Shade',              category: 'Lamp',    price: 12000,  width: 30,  height: 30,  description: 'A minimalist pendant light fixture with a white shade and exposed bulb, ideal for modern decor.',             image: P('2123426')  },
  { productName: 'Minimalist Black Floor Lamp',            category: 'Lamp',    price: 24000,  width: 28,  height: 170, description: 'A minimalist black floor lamp casting soft light against a white door.',                                      image: P('19934344') },
  { productName: 'Cherub White Table Lamp',                category: 'Lamp',    price: 22000,  width: 22,  height: 55,  description: 'A stylish white table lamp featuring a classic cherub sculpture base for elegant home decor.',               image: P('28859311') },
  { productName: 'Yellow Modern Table Lamp',               category: 'Lamp',    price: 16000,  width: 24,  height: 48,  description: 'A yellow modern table lamp with warm bokeh effect creating a cozy ambiance.',                               image: P('34771394') },
  { productName: 'Black Desk Lamp on Wooden Table',        category: 'Lamp',    price: 14000,  width: 30,  height: 50,  description: 'A modern black desk lamp with a note on a wooden table against a white wall.',                               image: P('4915562')  },
  { productName: 'Intricate Design Table Lamp',            category: 'Lamp',    price: 20000,  width: 28,  height: 58,  description: 'A stylish table lamp with intricate design casting soft light in a modern black and white interior.',         image: P('16004662') },

  // ── STOOLS (10) ──────────────────────────────────────────────────────────────
  { productName: 'Elegant Black Studio Stool',             category: 'Stool',   price: 18000,  width: 35,  height: 65,  description: 'An elegant black stool on a white backdrop showcasing minimalist design in a studio setting.',                image: P('19663734') },
  { productName: 'Black Bar Stool Modern',                 category: 'Stool',   price: 22000,  width: 38,  height: 75,  description: 'A simple black bar stool design on a white background, ideal for modern interiors.',                          image: P('10936095') },
  { productName: 'Black Metal Bar Stool',                  category: 'Stool',   price: 20000,  width: 36,  height: 72,  description: 'A simple black bar stool with metal legs against a neutral backdrop.',                                        image: P('7897069')  },
  { productName: 'Rustic Wooden Stool Painted Legs',       category: 'Stool',   price: 15000,  width: 32,  height: 60,  description: 'A rustic wooden stool with painted legs presented against a plain white background in a minimalist style.',   image: P('11112743') },
  { productName: 'Sleek Black Studio Stool',               category: 'Stool',   price: 18000,  width: 35,  height: 65,  description: 'A sleek black stool in a minimalist style photographed against a clean studio backdrop.',                     image: P('14100419') },
  { productName: 'Black Minimalist Stool Wall',            category: 'Stool',   price: 16000,  width: 33,  height: 62,  description: 'A simple black stool against a white wall, highlighting modern minimalist design.',                           image: P('36344673') },
  { productName: 'Wooden Stool Grey Background',           category: 'Stool',   price: 14000,  width: 30,  height: 58,  description: 'A simple wooden stool in a minimalist style with a light gray backdrop.',                                    image: P('37688559') },
  { productName: 'White Stool Grey Background',            category: 'Stool',   price: 14000,  width: 30,  height: 58,  description: 'A simple white stool in a minimalist studio setting with a neutral grey background.',                         image: P('11086362') },
  { productName: 'Metal Stool Clean Wall',                 category: 'Stool',   price: 12000,  width: 32,  height: 60,  description: 'A simple metal stool placed on a tiled floor with clean white wall background.',                              image: P('14071352') },
  { productName: 'Wooden Stool Dramatic Spotlight',        category: 'Stool',   price: 15000,  width: 30,  height: 55,  description: 'A wooden stool centered in dramatic spotlight with shadows against a white background.',                      image: P('32085882') },

  // ── BEDS (11) ────────────────────────────────────────────────────────────────
  { productName: 'Minimalist Wooden Headboard Bed',        category: 'Bed',     price: 75000,  width: 180, height: 50,  description: 'A minimalist bedroom featuring a wooden headboard, white bedding, and a stylish side table lamp.',             image: P('545012')   },
  { productName: 'Elegant Modern Bedroom Bed',             category: 'Bed',     price: 85000,  width: 200, height: 55,  description: 'An elegant modern bedroom featuring wooden elements, soft lighting, and minimalist design.',                   image: P('2082087')  },
  { productName: 'Hotel-Style Bed Frame',                  category: 'Bed',     price: 90000,  width: 210, height: 55,  description: 'A spacious modern hotel-style bed with cozy neutral-toned decor and natural light.',                           image: P('271624')   },
  { productName: 'White Wooden Bed with Linen',            category: 'Bed',     price: 70000,  width: 180, height: 50,  description: 'An inviting white wooden bed frame with white linen and pillows in an attic bedroom.',                         image: P('7746578')  },
  { productName: 'Serene Modern Bedroom Bed',              category: 'Bed',     price: 78000,  width: 195, height: 52,  description: 'A serene modern bedroom featuring a comfortable bed with natural light and minimalist design.',                 image: P('1150962')  },
  { productName: 'Stylish Modern Bedroom Set',             category: 'Bed',     price: 82000,  width: 200, height: 55,  description: 'A stylish modern bedroom featuring cozy bedding and elegant decor elements.',                                  image: P('31472231') },
  { productName: 'Modern Minimalist Bedroom Bed',          category: 'Bed',     price: 76000,  width: 190, height: 52,  description: 'A bright and cozy modern minimalist bedroom featuring pampas grass and soft textures.',                        image: P('31472230') },
  { productName: 'Single Minimalist Bed',                  category: 'Bed',     price: 55000,  width: 100, height: 50,  description: 'A cozy and minimalist single bedroom with simple decor and elegant design.',                                  image: P('19836795') },
  { productName: 'Single Bed with Warm Decor',             category: 'Bed',     price: 58000,  width: 100, height: 50,  description: 'A single bed with soft textures, warm decor, and modern design in a bright bedroom.',                         image: P('4993065')  },
  { productName: 'Contemporary Bedroom Art Bed',           category: 'Bed',     price: 80000,  width: 200, height: 55,  description: 'A contemporary bedroom design featuring art prints and cozy bedding for a warm ambiance.',                     image: P('1034584')  },
  { productName: 'Upholstered Bed with Bench',             category: 'Bed',     price: 88000,  width: 200, height: 55,  description: 'A comfortable bed with cushions and blanket near an upholstered bench placed at wall.',                        image: P('7535044')  },
];

async function main() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected to database ✓');

  // Remove all previously seeded products (keep only manually created ones with IDs 1, 2, 9, 10)
  await client.query(`DELETE FROM product WHERE id NOT IN (1, 2, 9, 10)`);
  console.log('Cleared old seeded products.');

  const { rows: existing } = await client.query('SELECT COUNT(*) FROM product');
  console.log(`Products before insert: ${existing[0].count}`);

  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const { rows } = await client.query(
      'SELECT id FROM product WHERE "productName" = $1',
      [p.productName],
    );
    if (rows.length > 0) {
      process.stdout.write(`  Skipping duplicate: "${p.productName}"\n`);
      skipped++;
      continue;
    }
    await client.query(
      `INSERT INTO product ("productName", description, category, price, width, height, image)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [p.productName, p.description, p.category, p.price, p.width, p.height, p.image],
    );
    process.stdout.write(`  Inserting… ${i + 1} done`);
    inserted++;
  }

  const { rows: final } = await client.query('SELECT COUNT(*) FROM product');
  console.log(`\n\n✓ Seed complete — Inserted: ${inserted} | Skipped (already exist): ${skipped} | Total in DB: ${final[0].count}`);
  await client.end();
}

main().catch((err) => { console.error(err); process.exit(1); });
