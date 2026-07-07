/**
 * Dumps the MongoDB database with `mongodump`, compresses it, and uploads
 * the archive to an S3 bucket. Intended to run on the EC2 instance via a
 * cron job (see README.md for the crontab entry).
 *
 * Requires `mongodump` (part of the mongodb-database-tools package) to be
 * installed on the host, and AWS credentials available via env vars or
 * an EC2 instance role.
 */
require('dotenv').config();
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const BUCKET = process.env.S3_BACKUP_BUCKET;
const REGION = process.env.AWS_REGION || 'us-east-1';

if (!BUCKET) {
  console.error('S3_BACKUP_BUCKET is not set in the environment. Aborting backup.');
  process.exit(1);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const dumpDir = path.join(os.tmpdir(), `mern-backup-${timestamp}`);
const archivePath = path.join(os.tmpdir(), `mern-backup-${timestamp}.tar.gz`);

async function run() {
  try {
    console.log('Running mongodump...');
    execSync(`mongodump --uri="${process.env.MONGO_URI}" --out="${dumpDir}"`, { stdio: 'inherit' });

    console.log('Compressing dump...');
    execSync(`tar -czf "${archivePath}" -C "${path.dirname(dumpDir)}" "${path.basename(dumpDir)}"`, {
      stdio: 'inherit',
    });

    console.log(`Uploading ${archivePath} to s3://${BUCKET}/backups/...`);
    const s3 = new S3Client({ region: REGION });
    const fileStream = fs.createReadStream(archivePath);
    const key = `backups/mern-backup-${timestamp}.tar.gz`;

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: fileStream,
      })
    );

    console.log(`Backup uploaded successfully: s3://${BUCKET}/${key}`);

    // Clean up local files
    fs.rmSync(dumpDir, { recursive: true, force: true });
    fs.rmSync(archivePath, { force: true });
    console.log('Local temp files cleaned up.');
  } catch (error) {
    console.error('Backup failed:', error.message);
    process.exit(1);
  }
}

run();
