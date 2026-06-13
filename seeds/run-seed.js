const { Client } = require('pg');

const DATABASE_URL =
  'postgresql://postgres.jcxfyzzojcmbbkxzfkkw:KaBeEr.123$5@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres';

// pngimg.com — verified transparent background PNGs (CC BY-NC 4.0)
const PNG = (path) => `https://pngimg.com/uploads/${path}`;
const DRESSER = (n) => PNG(`dresser/dresser_PNG${n}.png`);
const CLOSET  = (n) => PNG(`cupboard_closet/cupboard_closet_PNG${n}.png`);
const SHELF   = (n) => PNG(`bookshelf/bookshelf_PNG${n}.png`);
const BENCH   = (n) => PNG(`bench/bench_PNG${n}.png`);
const SOFA    = (n) => PNG(`sofa/sofa_PNG${n}.png`);
const CHAIR   = (n) => PNG(`chair/chair_PNG${n}.png`);
const ARM     = (n) => PNG(`armchair/armchair_PNG${n}.png`);
const TABLE   = (n) => PNG(`table/table_PNG${n}.png`);
const LAMP    = (n) => PNG(`lamp/lamp_PNG${n}.png`);
const BED     = (n) => PNG(`bed/bed_PNG${n}.png`);

// 110 verified transparent-background products from pngimg.com
const products = [

  // ── SOFAS (18) ────────────────────────────────────────────────────────────
  { productName: 'Classic Beige Three-Seater Sofa',    category: 'Sofa',    price: 89000,  width: 210, height: 85,  description: 'A classic beige three-seater sofa with clean lines and solid wooden legs.',           image: SOFA(6968) },
  { productName: 'Modern Grey Upholstered Sofa',       category: 'Sofa',    price: 95000,  width: 205, height: 82,  description: 'A modern grey sofa with plush cushions and minimalist silhouette.',                   image: SOFA(6967) },
  { productName: 'Compact Fabric Two-Seater Sofa',     category: 'Sofa',    price: 72000,  width: 170, height: 80,  description: 'A compact two-seater sofa in neutral fabric, great for smaller living spaces.',         image: SOFA(6966) },
  { productName: 'Contemporary Brown Sofa',            category: 'Sofa',    price: 88000,  width: 200, height: 84,  description: 'A contemporary brown sofa with deep cushions and sturdy frame.',                      image: SOFA(6965) },
  { productName: 'Minimalist Cream Sofa',              category: 'Sofa',    price: 78000,  width: 190, height: 81,  description: 'A minimalist cream-toned sofa with tapered legs and clean upholstery.',                image: SOFA(6964) },
  { productName: 'Low-Profile Modern Sofa',            category: 'Sofa',    price: 82000,  width: 195, height: 76,  description: 'A sleek low-profile sofa with wide seating and slim cushions.',                       image: SOFA(6963) },
  { productName: 'Padded Armrest Couch',               category: 'Sofa',    price: 91000,  width: 210, height: 86,  description: 'A generously padded couch with rounded armrests for maximum comfort.',                 image: SOFA(6962) },
  { productName: 'Straight-Back Formal Sofa',          category: 'Sofa',    price: 76000,  width: 185, height: 83,  description: 'A straight-back formal sofa in woven fabric with decorative legs.',                   image: SOFA(6961) },
  { productName: 'Rolled-Arm Classic Sofa',            category: 'Sofa',    price: 84000,  width: 200, height: 88,  description: 'A traditional rolled-arm sofa with button-tufted backrest and natural fabric.',        image: SOFA(6960) },
  { productName: 'Leather Chesterfield Sofa',          category: 'Sofa',    price: 130000, width: 215, height: 90,  description: 'A luxurious Chesterfield-style sofa in genuine leather with deep button tufting.',     image: SOFA(6932) },
  { productName: 'Sectional Corner Sofa',              category: 'Sofa',    price: 145000, width: 265, height: 85,  description: 'An L-shaped sectional sofa offering generous seating for large living rooms.',         image: SOFA(6931) },
  { productName: 'Velvet Accent Sofa',                 category: 'Sofa',    price: 98000,  width: 190, height: 83,  description: 'A statement velvet sofa with gold-finish legs and rich color.',                        image: SOFA(6930) },
  { productName: 'Compact Loveseat Sofa',              category: 'Sofa',    price: 65000,  width: 155, height: 80,  description: 'A snug loveseat-style two-seater sofa perfect for studios and small rooms.',           image: SOFA(6942) },
  { productName: 'Scandinavian Style Sofa',            category: 'Sofa',    price: 87000,  width: 200, height: 79,  description: 'A Scandinavian-inspired sofa with light wooden legs and textured linen fabric.',       image: SOFA(6941) },
  { productName: 'Deep Seat Comfort Sofa',             category: 'Sofa',    price: 105000, width: 220, height: 90,  description: 'A deep-seat sofa designed for ultimate relaxation with extra-wide cushions.',          image: SOFA(6940) },
  { productName: 'Mid-Century Modern Sofa',            category: 'Sofa',    price: 93000,  width: 198, height: 82,  description: 'A mid-century modern sofa with angled wood legs and structured backrest.',             image: SOFA(6952) },
  { productName: 'Tufted Cushion Three-Seater',        category: 'Sofa',    price: 99000,  width: 205, height: 85,  description: 'A classic three-seater with tufted back cushions and flared arms.',                   image: SOFA(6951) },
  { productName: 'Slim Arm Contemporary Sofa',         category: 'Sofa',    price: 86000,  width: 195, height: 80,  description: 'A contemporary sofa with slim arms and track-style back for a streamlined look.',      image: SOFA(6950) },

  // ── CHAIRS (15) ───────────────────────────────────────────────────────────
  { productName: 'Classic Wooden Dining Chair',        category: 'Chair',   price: 18000,  width: 46,  height: 88,  description: 'A classic wooden dining chair with a curved backrest and sturdy legs.',                image: CHAIR(6910) },
  { productName: 'Modern Office Task Chair',           category: 'Chair',   price: 32000,  width: 62,  height: 115, description: 'An ergonomic office task chair with adjustable height and lumbar support.',             image: CHAIR(6901) },
  { productName: 'Upholstered Dining Chair',           category: 'Chair',   price: 22000,  width: 48,  height: 90,  description: 'A padded dining chair with fabric upholstery and solid wood frame.',                  image: CHAIR(6900) },
  { productName: 'Ergonomic Mesh Chair',               category: 'Chair',   price: 28000,  width: 60,  height: 110, description: 'A breathable mesh-back chair with adjustable arms and seat height.',                   image: CHAIR(6898) },
  { productName: 'Rocking Chair Natural Wood',         category: 'Chair',   price: 35000,  width: 60,  height: 108, description: 'A timeless wooden rocking chair with smooth spindle back and curved runners.',         image: CHAIR(6897) },
  { productName: 'Antique Carved Wooden Chair',        category: 'Chair',   price: 42000,  width: 55,  height: 95,  description: 'An intricately carved wooden accent chair with a handcrafted floral pattern.',         image: CHAIR(6896) },
  { productName: 'Wingback Accent Armchair',           category: 'Chair',   price: 55000,  width: 72,  height: 98,  description: 'A classic wingback armchair upholstered in premium fabric with wooden legs.',          image: ARM(7075) },
  { productName: 'Eames-Style Lounge Armchair',        category: 'Chair',   price: 68000,  width: 80,  height: 95,  description: 'A mid-century lounge armchair with molded shell and leather cushion pads.',           image: ARM(7074) },
  { productName: 'Scandinavian Tub Armchair',          category: 'Chair',   price: 48000,  width: 70,  height: 82,  description: 'A cozy tub-style armchair with tapered wood legs and soft woven fabric.',             image: ARM(7073) },
  { productName: 'Tufted Velvet Armchair',             category: 'Chair',   price: 58000,  width: 74,  height: 88,  description: 'A sumptuous velvet armchair with button tufting and gold-painted legs.',              image: ARM(7072) },
  { productName: 'Mid-Century Accent Armchair',        category: 'Chair',   price: 52000,  width: 68,  height: 84,  description: 'A mid-century inspired accent chair with flared back and solid walnut legs.',          image: ARM(7071) },
  { productName: 'Barcelona-Style Lounge Chair',       category: 'Chair',   price: 62000,  width: 75,  height: 80,  description: 'A Barcelona-inspired lounge chair with leather cushions and chrome frame.',           image: ARM(7070) },
  { productName: 'Slipper Accent Chair',               category: 'Chair',   price: 38000,  width: 65,  height: 82,  description: 'A low-profile slipper chair in textured fabric, ideal for bedroom corners.',          image: ARM(7069) },
  { productName: 'Papasan Bowl Chair',                 category: 'Chair',   price: 32000,  width: 90,  height: 88,  description: 'A large rounded papasan chair with a cushioned bowl seat on a rattan base.',         image: ARM(7068) },
  { productName: 'Club Leather Armchair',              category: 'Chair',   price: 72000,  width: 78,  height: 88,  description: 'A luxurious club-style armchair in full-grain leather with studded trim.',             image: ARM(7067) },

  // ── TABLES (25) ───────────────────────────────────────────────────────────
  { productName: 'Rustic Farmhouse Dining Table',      category: 'Table',   price: 75000,  width: 180, height: 76,  description: 'A solid wood farmhouse dining table with a distressed finish and turned legs.',       image: TABLE(7008) },
  { productName: 'Modern Glass Coffee Table',          category: 'Table',   price: 48000,  width: 120, height: 45,  description: 'A sleek coffee table with tempered glass top and polished metal frame.',              image: TABLE(7007) },
  { productName: 'Marble Top Side Table',              category: 'Table',   price: 35000,  width: 50,  height: 60,  description: 'An elegant side table with marble-effect top and tapered black legs.',                image: TABLE(7006) },
  { productName: 'Industrial Metal Dining Table',      category: 'Table',   price: 88000,  width: 160, height: 76,  description: 'A robust dining table with reclaimed wood top and black powder-coated iron legs.',    image: TABLE(7005) },
  { productName: 'Round Pedestal Dining Table',        category: 'Table',   price: 62000,  width: 120, height: 76,  description: 'A round pedestal dining table with a tulip-style base and laminate top.',            image: TABLE(7004) },
  { productName: 'Oval Wooden Dining Table',           category: 'Table',   price: 70000,  width: 160, height: 76,  description: 'An oval dining table with a natural oak veneer top and solid wood legs.',             image: TABLE(7003) },
  { productName: 'Nesting Side Tables Set',            category: 'Table',   price: 28000,  width: 55,  height: 58,  description: 'A set of two nesting side tables in different sizes, ideal for flexible use.',         image: TABLE(7002) },
  { productName: 'Extendable Dining Table',            category: 'Table',   price: 92000,  width: 180, height: 76,  description: 'An extendable dining table with butterfly-leaf mechanism and clean finish.',          image: TABLE(7001) },
  { productName: 'Acacia Wood Coffee Table',           category: 'Table',   price: 42000,  width: 110, height: 45,  description: 'A solid acacia wood coffee table with live-edge detailing and iron legs.',            image: TABLE(7000) },
  { productName: 'Mid-Century Tapered Leg Dining Table', category: 'Table', price: 68000,  width: 150, height: 75,  description: 'A mid-century dining table with tapered solid wood legs and walnut-finish top.',      image: TABLE(6999) },
  { productName: 'Scandinavian Bedside Table',         category: 'Table',   price: 22000,  width: 45,  height: 55,  description: 'A minimalist Scandinavian bedside table with a small drawer and round legs.',         image: TABLE(6998) },
  { productName: 'Slim Console Entry Table',           category: 'Table',   price: 38000,  width: 120, height: 80,  description: 'A narrow console table ideal for hallways and entryways with a shelf below.',         image: TABLE(6997) },
  { productName: 'Tempered Glass End Table',           category: 'Table',   price: 25000,  width: 50,  height: 58,  description: 'A transparent tempered glass end table with chrome leg frame.',                      image: TABLE(6996) },
  { productName: 'Walnut Slab Dining Table',           category: 'Table',   price: 95000,  width: 180, height: 76,  description: 'A premium walnut slab dining table with book-matched grain and steel hairpin legs.',  image: TABLE(6995) },
  { productName: 'White Round Coffee Table',           category: 'Table',   price: 32000,  width: 80,  height: 45,  description: 'A clean white round coffee table with a smooth lacquered surface.',                   image: TABLE(6994) },
  { productName: 'Modern Writing Desk',                category: 'Table',   price: 45000,  width: 120, height: 76,  description: 'A clean-lined writing desk with a smooth surface and cable management slot.',         image: TABLE(6993) },
  { productName: 'Executive Office Desk',              category: 'Table',   price: 78000,  width: 160, height: 76,  description: 'A wide executive desk with a large work surface and built-in drawers.',               image: TABLE(6992) },
  { productName: 'L-Shaped Corner Desk',               category: 'Table',   price: 65000,  width: 180, height: 76,  description: 'An L-shaped corner desk maximizing workspace with ample storage shelves.',           image: TABLE(6991) },
  { productName: 'Compact Study Desk',                 category: 'Table',   price: 28000,  width: 100, height: 76,  description: 'A compact single-pedestal study desk for students and home offices.',                 image: TABLE(6990) },
  { productName: 'Floating Wall-Mount Desk',           category: 'Table',   price: 22000,  width: 100, height: 45,  description: 'A space-saving wall-mounted floating desk with a narrow shelf.',                     image: TABLE(6989) },
  { productName: 'Height-Adjustable Standing Desk',    category: 'Table',   price: 85000,  width: 140, height: 120, description: 'An electric height-adjustable standing desk for ergonomic home office setups.',      image: TABLE(6988) },
  { productName: 'Vintage Roll-Top Desk',              category: 'Table',   price: 72000,  width: 120, height: 115, description: 'A vintage-style roll-top desk with pigeonhole compartments and a tambour lid.',      image: TABLE(6987) },
  { productName: 'Minimalist Solid Wood Desk',         category: 'Table',   price: 42000,  width: 120, height: 76,  description: 'A minimalist solid pine desk with two drawers and a clean natural finish.',           image: TABLE(6986) },
  { productName: 'Industrial Pipe Desk',               category: 'Table',   price: 50000,  width: 130, height: 76,  description: 'An industrial-style desk with a reclaimed wood top and black iron pipe legs.',        image: TABLE(6985) },
  { productName: 'Glass-Top Office Desk',              category: 'Table',   price: 55000,  width: 140, height: 76,  description: 'A professional glass-top office desk with chrome frame and side return.',             image: TABLE(6984) },

  // ── LAMPS (11) ────────────────────────────────────────────────────────────
  { productName: 'Arc Floor Lamp',                     category: 'Lamp',    price: 22000,  width: 40,  height: 175, description: 'A dramatic arc floor lamp with a wide drum shade and weighted marble base.',            image: LAMP(108739) },
  { productName: 'Industrial Tripod Floor Lamp',       category: 'Lamp',    price: 18000,  width: 55,  height: 165, description: 'A retro-industrial tripod floor lamp with Edison bulb and dark metal finish.',        image: LAMP(108738) },
  { productName: 'Classic Ceramic Table Lamp',         category: 'Lamp',    price: 12000,  width: 25,  height: 58,  description: 'A classic ceramic-base table lamp with a linen drum shade.',                         image: LAMP(108737) },
  { productName: 'Modern Pendant Lamp',                category: 'Lamp',    price: 16000,  width: 35,  height: 35,  description: 'A geometric pendant lamp with a matte black metal cage and LED bulb.',               image: LAMP(108736) },
  { productName: 'Marble Base Desk Lamp',              category: 'Lamp',    price: 15000,  width: 22,  height: 50,  description: 'A sophisticated desk lamp with a polished marble base and slim brass arm.',           image: LAMP(108735) },
  { productName: 'Adjustable Swing-Arm Reading Lamp',  category: 'Lamp',    price: 14000,  width: 30,  height: 55,  description: 'A swing-arm reading lamp with an adjustable head and on/off switch on the cord.',    image: LAMP(108734) },
  { productName: 'Vintage Edison Table Lamp',          category: 'Lamp',    price: 18000,  width: 22,  height: 52,  description: 'A vintage-inspired table lamp with an exposed Edison filament bulb and pipe base.',  image: LAMP(108733) },
  { productName: 'Scandinavian Floor Lamp',            category: 'Lamp',    price: 24000,  width: 35,  height: 168, description: 'A slender Scandinavian floor lamp with a cloth shade and natural wood mid-section.',   image: LAMP(108732) },
  { productName: 'Crystal Chandelier Lamp',            category: 'Lamp',    price: 38000,  width: 50,  height: 60,  description: 'An ornate crystal chandelier with multi-tiered droplets and golden frame.',           image: LAMP(108731) },
  { productName: 'Minimalist Cone Shade Lamp',         category: 'Lamp',    price: 10000,  width: 28,  height: 48,  description: 'A minimalist cone-shade table lamp in matte white with a slim metal base.',           image: LAMP(108730) },
  { productName: 'Geometric Metal Table Lamp',         category: 'Lamp',    price: 13000,  width: 24,  height: 50,  description: 'A contemporary lamp with angular geometric metal shade and black finish.',            image: LAMP(108729) },

  // ── BEDS (15) ─────────────────────────────────────────────────────────────
  { productName: 'King-Size Platform Bed',             category: 'Bed',     price: 135000, width: 195, height: 45,  description: 'A low king-size platform bed with upholstered headboard and slatted base.',          image: BED(17424) },
  { productName: 'Upholstered Queen Bed Frame',        category: 'Bed',     price: 98000,  width: 165, height: 50,  description: 'A queen bed frame fully upholstered in premium linen with button-tufted headboard.', image: BED(17423) },
  { productName: 'Wooden Sleigh Bed',                  category: 'Bed',     price: 88000,  width: 160, height: 90,  description: 'A classic wooden sleigh bed with curved headboard and footboard in dark walnut.',     image: BED(17422) },
  { productName: 'Modern Storage Platform Bed',        category: 'Bed',     price: 115000, width: 175, height: 48,  description: 'A platform bed with built-in hydraulic storage lift and leatherette headboard.',     image: BED(17421) },
  { productName: 'Linen Upholstered Bed',              category: 'Bed',     price: 82000,  width: 160, height: 52,  description: 'A softly upholstered bed in natural linen with a padded wingback headboard.',         image: BED(17420) },
  { productName: 'Storage Bed with Drawers',           category: 'Bed',     price: 105000, width: 175, height: 48,  description: 'A storage bed with four deep drawers on the sides and a fabric headboard.',           image: BED(17419) },
  { productName: 'Canopy Four-Poster Bed',             category: 'Bed',     price: 145000, width: 175, height: 200, description: 'A dramatic four-poster canopy bed in solid mango wood with a draped linen canopy.',   image: BED(17418) },
  { productName: 'Mid-Century Low-Profile Bed',        category: 'Bed',     price: 75000,  width: 155, height: 38,  description: 'A low-profile mid-century bed with angled solid wood legs and clean-lined frame.',    image: BED(17417) },
  { productName: 'Rustic Barn Wood Bed',               category: 'Bed',     price: 92000,  width: 165, height: 120, description: 'A rustic bed frame crafted from reclaimed barn wood with a shiplap headboard.',       image: BED(17416) },
  { productName: 'Metal Twin Bed Frame',               category: 'Bed',     price: 52000,  width: 105, height: 90,  description: 'A sturdy metal twin bed frame with decorative headboard and powder-coat finish.',     image: BED(17415) },
  { productName: 'Leather Panel Headboard Bed',        category: 'Bed',     price: 110000, width: 165, height: 60,  description: 'A luxurious bed with a tall leather panel headboard and chrome nail-head trim.',     image: BED(17414) },
  { productName: 'Classic Daybed Frame',               category: 'Bed',     price: 72000,  width: 105, height: 85,  description: 'A versatile daybed frame with a trundle that doubles as a sofa during the day.',      image: BED(17413) },
  { productName: 'Bamboo Platform Bed',                category: 'Bed',     price: 85000,  width: 160, height: 50,  description: 'An eco-friendly bamboo platform bed with natural grain and minimal design.',          image: BED(17412) },
  { productName: 'Nordic Solid Wood Bed',              category: 'Bed',     price: 78000,  width: 160, height: 85,  description: 'A Nordic-style solid pine bed with a slatted headboard and natural wax finish.',      image: BED(17411) },
  { productName: 'Metal Bunk Bed Frame',               category: 'Bed',     price: 88000,  width: 100, height: 170, description: 'A sturdy metal bunk bed frame with safety rails and a ladder for the top bunk.',      image: BED(17410) },

  // ── CABINETS & WARDROBES (9) ───────────────────────────────────────────────
  { productName: 'Tall Double-Door Wardrobe',          category: 'Cabinet', price: 95000,  width: 100, height: 210, description: 'A tall double-door wardrobe with hanging rail, shelves, and mirror on inside door.',   image: CLOSET(16772) },
  { productName: 'Hinged-Door Wooden Wardrobe',        category: 'Cabinet', price: 88000,  width: 120, height: 205, description: 'A classic hinged-door wardrobe in light oak with drawer unit at the base.',           image: CLOSET(16771) },
  { productName: 'Sliding Door Closet',                category: 'Cabinet', price: 78000,  width: 150, height: 210, description: 'A space-saving sliding-door closet with a mirrored front panel.',                    image: CLOSET(16770) },
  { productName: 'Open Shelving Storage Cabinet',      category: 'Cabinet', price: 48000,  width: 90,  height: 180, description: 'A versatile open-shelving storage unit with five adjustable shelves.',                image: CLOSET(16769) },
  { productName: 'TV Media Cabinet',                   category: 'Cabinet', price: 55000,  width: 150, height: 55,  description: 'A wide media cabinet with cable cutouts, two doors, and a centre shelf.',             image: CLOSET(16768) },
  { productName: 'Antique Carved Armoire',             category: 'Cabinet', price: 120000, width: 110, height: 210, description: 'An heirloom-quality carved armoire with decorative moulding and brass handles.',      image: CLOSET(16766) },
  { productName: 'Chest of Six Drawers',               category: 'Cabinet', price: 62000,  width: 80,  height: 125, description: 'A tall chest of six drawers in white gloss with sleek bar handles.',                  image: DRESSER(183) },
  { productName: 'Mid-Century Sideboard Dresser',      category: 'Cabinet', price: 72000,  width: 140, height: 72,  description: 'A mid-century sideboard with tapered legs, three drawers, and two cabinet doors.',    image: DRESSER(182) },
  { productName: 'Modern 5-Drawer Highboy Dresser',    category: 'Cabinet', price: 58000,  width: 75,  height: 130, description: 'A modern highboy dresser with clean lines, five deep drawers, and brushed handles.',  image: DRESSER(181) },

  // ── BOOKSHELVES (9) ───────────────────────────────────────────────────────
  { productName: '5-Tier Open Bookcase',               category: 'Cabinet', price: 38000,  width: 80,  height: 180, description: 'A tall five-tier open bookcase with adjustable shelves and a MDF back panel.',         image: SHELF(107150) },
  { productName: 'Floating Wall Shelves Set',          category: 'Cabinet', price: 22000,  width: 80,  height: 100, description: 'A set of three floating wall shelves in varying lengths for decorative storage.',       image: SHELF(107149) },
  { productName: 'Industrial Style Bookcase',          category: 'Cabinet', price: 52000,  width: 100, height: 185, description: 'A sturdy industrial bookcase with metal frame and reclaimed wood shelves.',            image: SHELF(107148) },
  { productName: 'Mid-Century Open Bookshelf',         category: 'Cabinet', price: 42000,  width: 90,  height: 170, description: 'A mid-century open bookshelf with alternating compartments and tapered legs.',        image: SHELF(107147) },
  { productName: 'Corner Bookcase Unit',               category: 'Cabinet', price: 35000,  width: 80,  height: 160, description: 'A triangular corner bookcase that fits flush into room corners with five shelves.',   image: SHELF(107146) },
  { productName: 'Leaning Ladder Bookshelf',           category: 'Cabinet', price: 28000,  width: 60,  height: 175, description: 'A lean-against-the-wall ladder bookshelf with five progressively wider shelves.',     image: SHELF(107145) },
  { productName: 'Built-In Style Library Bookcase',    category: 'Cabinet', price: 58000,  width: 120, height: 200, description: 'A floor-to-ceiling style bookcase that mimics built-in library shelving.',            image: SHELF(107144) },
  { productName: 'Cube Modular Shelf Unit',            category: 'Cabinet', price: 25000,  width: 75,  height: 150, description: 'A stackable cube modular shelf unit with mix-and-match open and closed cubes.',       image: SHELF(107143) },
  { productName: 'Solid Oak Library Shelf',            category: 'Cabinet', price: 65000,  width: 100, height: 185, description: 'A premium solid oak library shelf with dovetail joints and adjustable shelving.',     image: SHELF(107142) },

  // ── STOOLS & OTTOMANS (8) ─────────────────────────────────────────────────
  { productName: 'Rustic Wooden Bar Stool',            category: 'Stool',   price: 18000,  width: 38,  height: 75,  description: 'A solid wood bar stool with a round seat and footrest rung, unfinished natural look.', image: BENCH(43) },
  { productName: 'Industrial Metal Bar Stool',         category: 'Stool',   price: 22000,  width: 40,  height: 78,  description: 'A black powder-coated metal bar stool with woven wire back and adjustable glides.',   image: BENCH(42) },
  { productName: 'Round Upholstered Ottoman',          category: 'Stool',   price: 28000,  width: 60,  height: 42,  description: 'A round button-tufted upholstered ottoman in grey velvet with chrome legs.',          image: BENCH(41) },
  { productName: 'Tufted Velvet Storage Ottoman',      category: 'Stool',   price: 32000,  width: 75,  height: 40,  description: 'A rectangular velvet storage ottoman with removable lid and diamond tufting.',         image: BENCH(40) },
  { productName: 'Leather Footstool Ottoman',          category: 'Stool',   price: 24000,  width: 55,  height: 38,  description: 'A compact leather footstool ottoman with piped edges and wooden bun feet.',            image: BENCH(39) },
  { productName: 'Rustic Entryway Bench',              category: 'Stool',   price: 20000,  width: 90,  height: 48,  description: 'A rustic wooden entryway bench with slatted seat and shelf below for shoes.',          image: BENCH(38) },
  { productName: 'Scandinavian Pine Stool',            category: 'Stool',   price: 15000,  width: 35,  height: 45,  description: 'A simple Scandinavian pine stool with three angled legs and a smooth round seat.',     image: BENCH(37) },
  { productName: 'Woven Rattan Ottoman',               category: 'Stool',   price: 26000,  width: 55,  height: 38,  description: 'A natural rattan woven ottoman with a removable cushion top and sturdy frame.',        image: BENCH(36) },
];

async function main() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected to database ✓');

  // Clear dependent tables first (FK constraints), then all products
  await client.query(`DELETE FROM cart_item`);
  await client.query(`DELETE FROM order_item`).catch(() => {}); // ignore if table doesn't exist
  await client.query(`DELETE FROM product`);
  console.log('Cleared cart items and all existing products.');

  let inserted = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    await client.query(
      `INSERT INTO product ("productName", description, category, price, width, height, image)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [p.productName, p.description, p.category, p.price, p.width, p.height, p.image],
    );
    process.stdout.write(`\r  Inserted ${++inserted}/${products.length} — ${p.productName}`);
  }

  const { rows } = await client.query('SELECT COUNT(*) FROM product');
  console.log(`\n\n✓ Seed complete — Inserted: ${inserted} | Total in DB: ${rows[0].count}`);
  await client.end();
}

main().catch((err) => { console.error(err); process.exit(1); });
