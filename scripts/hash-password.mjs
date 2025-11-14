#!/usr/bin/env node

import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error("Usage: npm run hash-password <password>");
  process.exit(1);
}

const saltRounds = 10;

try {
  const hash = bcrypt.hashSync(password, saltRounds);
  console.log(hash);
} catch (error) {
  console.error("Failed to hash password:", error);
  process.exit(1);
}
