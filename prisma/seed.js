/**
 * Seed: creates a default user for login.
 * Run: npx prisma db seed
 * Username and password are only managed here or by editing the database directly (no sign up / forgot password in the app).
 *
 * Menambah user baru:  npm run add-user -- <username> <password>
 * Ganti password:      npm run change-password -- <username> <password-baru>
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const defaultUsername = "admin";
  const defaultPassword = "admin"; // Change after first login by editing DB or re-running seed with different env

  const existing = await prisma.user.findUnique({ where: { username: defaultUsername } });
  if (existing) {
    console.log("User 'admin' already exists. Skip seed. To change password, edit the database.");
    return;
  }
  const hash = await bcrypt.hash(defaultPassword, 10);
  await prisma.user.create({
    data: { username: defaultUsername, passwordHash: hash },
  });
  console.log("Created user: username=admin, password=admin — change password via database or re-seed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
