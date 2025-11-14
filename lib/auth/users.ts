export type StoredUser = {
  email: string;
  hash: string;
};

import users from "../../data/users.json";

const normalizedUsers = users.map((user) => ({
  email: user.email.toLowerCase(),
  hash: user.hash,
}));

export const findUserByEmail = (email: string): StoredUser | null => {
  const normalizedEmail = email.toLowerCase();
  const match = normalizedUsers.find((user) => user.email === normalizedEmail);
  return match
    ? {
        email: match.email,
        hash: match.hash,
      }
    : null;
};
