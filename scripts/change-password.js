/**
 * Mengganti password user yang sudah ada.
 * Hanya developer yang menjalankan script ini (tidak ada "forgot password" di app).
 *
 * Cara pakai:
 *   npm run change-password -- username password-baru
 *   (tanpa < > — ganti dengan nilai asli)
 *
 * Contoh:
 *   npm run change-password -- admin passwordbaru123
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
  const newPassword = process.argv[3];

  if (!username || !newPassword) {
    console.error("Pemakaian: node scripts/change-password.js <username> <password-baru>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    console.error("User tidak ditemukan:", username);
    process.exit(1);
  }

  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { username },
    data: { passwordHash: hash },
  });
  console.log("Password berhasil diganti untuk user:", username);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
