const path = require('path');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const BUCKET = process.env.S3_BUCKET_NAME;
const REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;

if (!BUCKET) {
  console.warn('S3_BUCKET_NAME not defined - S3 uploads will fail until configured');
}

const s3Client = new S3Client({
  region: REGION,
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  } : undefined
});

function makeKey(originalName, folder) {
  const ext = path.extname(originalName) || '';
  const random = Date.now() + '-' + Math.random().toString(36).slice(2, 9);
  const key = `${folder}/${random}${ext}`;
  return key;
}

async function uploadFile(buffer, originalName, folder = 'uploads', mimeType = 'application/octet-stream') {
  if (!BUCKET) throw new Error('S3_BUCKET_NAME not configured');
  const Key = makeKey(originalName, folder);
  const params = {
    Bucket: BUCKET,
    Key,
    Body: buffer,
    ContentType: mimeType,
    ACL: 'public-read'
  };
  await s3Client.send(new PutObjectCommand(params));
  const url = REGION ? `https://${BUCKET}.s3.${REGION}.amazonaws.com/${Key}` : `https://${BUCKET}.s3.amazonaws.com/${Key}`;
  return { key: Key, url };
}

async function deleteFile(key) {
  if (!BUCKET) throw new Error('S3_BUCKET_NAME not configured');
  if (!key) return;
  const params = { Bucket: BUCKET, Key: key };
  await s3Client.send(new DeleteObjectCommand(params));
}

function getKeyFromUrl(url) {
  const path = require('path');
  const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

  const BUCKET = process.env.S3_BUCKET_NAME;
  const REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;

  if (!BUCKET) {
    console.warn('S3_BUCKET_NAME not defined - S3 uploads will fail until configured');
  }

  const s3Client = new S3Client({
    region: REGION,
    credentials: process.env.AWS_ACCESS_KEY_ID ? {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    } : undefined
  });

  function makeKey(originalName, folder) {
    const ext = path.extname(originalName) || '';
    const random = Date.now() + '-' + Math.random().toString(36).slice(2, 9);
    const key = `${folder}/${random}${ext}`;
    return key;
  }

  async function uploadFile(buffer, originalName, folder = 'uploads', mimeType = 'application/octet-stream') {
    if (!BUCKET) throw new Error('S3_BUCKET_NAME not configured');
    const Key = makeKey(originalName, folder);
    const params = {
      Bucket: BUCKET,
      Key,
      Body: buffer,
      ContentType: mimeType,
      ACL: 'public-read'
    };
    await s3Client.send(new PutObjectCommand(params));
    const url = REGION ? `https://${BUCKET}.s3.${REGION}.amazonaws.com/${Key}` : `https://${BUCKET}.s3.amazonaws.com/${Key}`;
    return { key: Key, url };
  }

  async function deleteFile(key) {
    if (!BUCKET) throw new Error('S3_BUCKET_NAME not configured');
    if (!key) return;
    const params = { Bucket: BUCKET, Key: key };
    await s3Client.send(new DeleteObjectCommand(params));
  }

  function getKeyFromUrl(url) {
    if (!url) return null;
    try {
      const u = new URL(url);
      const pathname = u.pathname.startsWith('/') ? u.pathname.slice(1) : u.pathname;
      return pathname;
    } catch (e) {
      return null;
    }
  }

  module.exports = { uploadFile, deleteFile, getKeyFromUrl };
