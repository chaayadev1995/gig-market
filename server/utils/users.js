import fs from 'fs';
import path from 'path';

const USERS_DB_PATH = path.resolve('./db/users.json');

export function readUsers() {
  if (!fs.existsSync(USERS_DB_PATH)) {
    return [];
  }
  try {
    const data = fs.readFileSync(USERS_DB_PATH, 'utf8');
    return JSON.parse(data || '[]');
  } catch (e) {
    console.error('Error reading users db:', e);
    return [];
  }
}

export function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify(users, null, 2));
    return true;
  } catch (e) {
    console.error('Error writing users db:', e);
    return false;
  }
}

export function getUserProfile(walletAddress) {
  if (!walletAddress) return null;
  const addressLower = walletAddress.toLowerCase();
  const users = readUsers();
  let user = users.find(u => u.walletAddress.toLowerCase() === addressLower);
  if (!user) {
    user = {
      walletAddress: walletAddress,
      gatewayBalance: 0.0, // in USDC
      accumulatedMicropayments: 0.0, // in USDC
    };
    users.push(user);
    writeUsers(users);
  }
  return user;
}

export function updateUserProfile(walletAddress, updates) {
  if (!walletAddress) return null;
  const addressLower = walletAddress.toLowerCase();
  const users = readUsers();
  const index = users.findIndex(u => u.walletAddress.toLowerCase() === addressLower);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    writeUsers(users);
    return users[index];
  } else {
    const newUser = {
      walletAddress: walletAddress,
      gatewayBalance: 0.0,
      accumulatedMicropayments: 0.0,
      ...updates
    };
    users.push(newUser);
    writeUsers(users);
    return newUser;
  }
}
