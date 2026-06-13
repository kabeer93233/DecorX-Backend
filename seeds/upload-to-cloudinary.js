/**
 * Downloads each product image from pngimg.com and re-uploads to Cloudinary,
 * then updates the DB record with the new Cloudinary URL.
 *
 * Run once:  node seeds/upload-to-cloudinary.js
 */

const { Client } = require('pg');
const https = require('https');
const http  = require('http');

// Load .env from project root
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const DATABASE_URL       = process.env.DATABASE_URL;
const CLOUDINARY_CLOUD   = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_SECRET  = process.env.CLOUDINARY_API_SECRET;

if (!DATABASE_URL || !CLOUDINARY_CLOUD || !CLOUDINARY_API_KEY || !CLOUDINARY_SECRET) {
  console.error('Missing required env vars. Check .env has DATABASE_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
  process.exit(1);
}

// ── helpers ────────────────────────────────────────────────────────────────

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end',  () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function sha1(str) {
  const crypto = require('crypto');
  return crypto.createHash('sha1').update(str).digest('hex');
}

async function uploadToCloudinary(imageBuffer, publicId) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder    = 'decorx-products';
  const signature = sha1(
    `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_SECRET}`
  );

  // Build multipart/form-data manually (no external deps)
  const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);
  const CRLF = '\r\n';

  function field(name, value) {
    return (
      `--${boundary}${CRLF}` +
      `Content-Disposition: form-data; name="${name}"${CRLF}${CRLF}` +
      `${value}${CRLF}`
    );
  }

  const filePart =
    `--${boundary}${CRLF}` +
    `Content-Disposition: form-data; name="file"; filename="image.png"${CRLF}` +
    `Content-Type: image/png${CRLF}${CRLF}`;

  const closing = `${CRLF}--${boundary}--${CRLF}`;

  const bodyParts = [
    Buffer.from(field('timestamp',  timestamp)),
    Buffer.from(field('api_key',    CLOUDINARY_API_KEY)),
    Buffer.from(field('signature',  signature)),
    Buffer.from(field('folder',     folder)),
    Buffer.from(field('public_id',  publicId)),
    Buffer.from(filePart),
    imageBuffer,
    Buffer.from(closing),
  ];
  const body = Buffer.concat(bodyParts);

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudinary.com',
      path:     `/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
      method:   'POST',
      headers: {
        'Content-Type':   `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
    };
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end',  () => {
        const json = JSON.parse(Buffer.concat(chunks).toString());
        if (json.secure_url) resolve(json.secure_url);
        else reject(new Error(json.error?.message || JSON.stringify(json)));
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ── main ───────────────────────────────────────────────────────────────────

async function main() {
  const db = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await db.connect();
  console.log('Connected ✓\n');

  const { rows: products } = await db.query(
    `SELECT id, "productName", image FROM product WHERE image LIKE '%pngimg.com%' ORDER BY id`
  );

  console.log(`Found ${products.length} products to migrate.\n`);

  let ok = 0, fail = 0;

  for (let i = 0; i < products.length; i++) {
    const { id, productName, image } = products[i];
    const publicId = `product-${id}-${slugify(productName)}`.slice(0, 100);
    process.stdout.write(`[${i + 1}/${products.length}] ${productName} … `);

    try {
      const buf         = await fetchBuffer(image);
      const cloudUrl    = await uploadToCloudinary(buf, publicId);
      await db.query(`UPDATE product SET image = $1 WHERE id = $2`, [cloudUrl, id]);
      console.log(`✓`);
      ok++;
    } catch (err) {
      console.log(`✗  ${err.message}`);
      fail++;
    }

    // Small delay to avoid hammering pngimg.com
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n✓ Done — Uploaded: ${ok} | Failed: ${fail}`);
  await db.end();
}

main().catch((err) => { console.error(err); process.exit(1); });
