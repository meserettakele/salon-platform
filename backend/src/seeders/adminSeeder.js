const { User } = require("../models");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const seedAdmin = async () => {
  try {
    const phone = process.env.SEED_ADMIN_PHONE;
    const password = process.env.SEED_ADMIN_PASSWORD;
    const email = process.env.SEED_ADMIN_EMAIL;

    if (!phone || !password) {
      console.error(
        "❌ Error: Administrative bootstrap credentials missing in environment variable matrix.",
      );
      process.exit(1);
    }

    const existingAdmin = await User.findOne({ where: { phone } });
    if (existingAdmin) {
      console.log("✔ Master Admin account already provisioned.");
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      fullName: "System Administrator",
      email: email,
      phone: phone,
      password: hashedPassword,
      role: "ADMIN",
      isActive: true,
    });

    console.log(
      "🚀 Master Admin account successfully seeded from secure environment configurations.",
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Error executing Admin Seeder payload:", error);
    process.exit(1);
  }
};

seedAdmin();
