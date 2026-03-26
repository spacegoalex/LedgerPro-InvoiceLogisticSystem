/**
 * Menambah user baru untuk login LedgerPro.
 * Hanya developer yang menjalankan script ini (tidak ada sign up di app).
 *
 * Cara pakai:
 *   npm run add-user -- username password
 *   (tanpa < > — ganti username dan password dengan nilai asli)
 *
 * Contoh:
 *   npm run add-user -- siemen rahasia123
 *
 * Butuh DATABASE_URL (dari .env atau .env.local). Script ini baca .env.local otomatis jika ada.
 */
const path = require("path");
const fs = require("fs");
const envLocal = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envLocal)) {
  const lines = fs.readFileSync(envLocal, "utf8").split("\n");
  for (const line of lines) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  if (!prisma.user) {
    console.error("Prisma client belum punya model User. Jalankan: npx prisma generate");
    process.exit(1);
  }

  const username = process.argv[2];
  const password = process.argv[3];

  if (!username || !password) {
    console.error("Pemakaian: node scripts/add-user.js <username> <password>");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    console.error("User dengan username tersebut sudah ada. Pakai change-password.js untuk mengganti password.");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { username, passwordHash: hash },
  });
  console.log("User berhasil ditambah:", username);
}

main()
  .catch((e) => {
    if (e.code === "P2021") {
      console.error("Tabel User belum ada di database.");
      console.error("Jalankan dulu: npx prisma db push");
      console.error("(Pastikan DATABASE_URL ada di .env atau .env.local)");
    } else {
      console.error(e);
    }
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
