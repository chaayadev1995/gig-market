import { CircleDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ENV_PATH = path.resolve('./.env');

// Helper to update a variable in .env
function updateEnvVariable(key, value) {
  if (!fs.existsSync(ENV_PATH)) {
    console.error('.env file not found.');
    return;
  }
  let content = fs.readFileSync(ENV_PATH, 'utf8');
  const regex = new RegExp(`^${key}=.*$`, 'm');
  
  if (regex.test(content)) {
    content = content.replace(regex, `${key}="${value}"`);
  } else {
    content += `\n${key}="${value}"`;
  }
  fs.writeFileSync(ENV_PATH, content, 'utf8');
  console.log(`Updated ${key} in .env`);
}

async function main() {
  console.log('--- GigMarket Setup Automation Tool ---');

  // 1. Generate GITHUB_WEBHOOK_SECRET automatically if missing or set to placeholder
  let webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!webhookSecret || webhookSecret === 'your_webhook_secret_here' || webhookSecret.trim() === '') {
    const generatedSecret = crypto.randomBytes(20).toString('hex');
    updateEnvVariable('GITHUB_WEBHOOK_SECRET', generatedSecret);
    webhookSecret = generatedSecret;
    console.log(`Generated a secure GITHUB_WEBHOOK_SECRET: ${generatedSecret}`);
  } else {
    console.log(`Using existing GITHUB_WEBHOOK_SECRET: ${webhookSecret}`);
  }

  // 2. Wallet ID generation using Circle API
  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

  const isDummyApiKey = !apiKey || apiKey === 'TEST_API_KEY_xxxx' || apiKey.trim() === '';
  const isDummyEntitySecret = !entitySecret || entitySecret === '0000000000000000000000000000000000000000000000000000000000000000' || entitySecret.trim() === '';

  if (isDummyApiKey || isDummyEntitySecret) {
    console.log('\n[WARNING] CIRCLE_API_KEY hoặc CIRCLE_ENTITY_SECRET chưa được cấu hình hợp lệ trong file .env.');
    console.log('👉 Vui lòng mở file .env và điền API Key thực tế của bạn trước khi chạy công cụ này.');
    console.log('👉 Địa chỉ lấy API Key: https://console.circle.com/settings/api-keys');
    return;
  }

  console.log('\nKết nối đến Circle Developer Platform...');
  try {
    const client = new CircleDeveloperControlledWalletsClient({
      apiKey,
      entitySecret,
    });

    const idempotencyKey1 = crypto.randomUUID();
    console.log('Đang tạo Wallet Set mới cho dự án GigMarket...');
    const walletSetResponse = await client.createWalletSet({
      name: 'GigMarket Wallet Set',
      idempotencyKey: idempotencyKey1,
    });

    const walletSetId = walletSetResponse.data?.walletSet?.id;
    if (!walletSetId) {
      throw new Error('Không thể nhận Wallet Set ID từ Circle API response.');
    }
    console.log(`Đã tạo Wallet Set thành công. ID: ${walletSetId}`);

    const idempotencyKey2 = crypto.randomUUID();
    console.log('Đang tạo Developer-Controlled Wallet trên mạng ARC-TESTNET...');
    const walletResponse = await client.createWallets({
      walletSetId,
      blockchains: ['ARC-TESTNET'],
      count: 1,
      idempotencyKey: idempotencyKey2,
    });

    const wallet = walletResponse.data?.wallets?.[0];
    if (!wallet) {
      throw new Error('Không thể khởi tạo ví. Vui lòng kiểm tra lại cấu hình.');
    }

    console.log('\n=== TẠO VÍ THÀNH CÔNG ===');
    console.log(`Wallet ID: ${wallet.id}`);
    console.log(`Địa chỉ ví: ${wallet.address}`);
    console.log('==========================\n');

    // Cập nhật ví vào file .env
    updateEnvVariable('CIRCLE_WALLET_ID', wallet.id);
    console.log('🎉 Đã tự động cập nhật CIRCLE_WALLET_ID vào file .env!');

  } catch (error) {
    console.error('\n[LỖI] Tạo ví thất bại:', error.message || error);
    if (error.response?.data) {
      console.error('Chi tiết lỗi từ Circle API:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

main();
