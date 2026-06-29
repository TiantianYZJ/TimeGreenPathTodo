const fs = require('fs');
const path = require('path');
const { query } = require('./config/database');
const logger = require('./utils/logger');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function ensureMigrationsTable() {
  await query(
    `CREATE TABLE IF NOT EXISTS _migrations (
      id INT PRIMARY KEY AUTO_INCREMENT,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
  );
}

async function getAppliedFilenames() {
  const rows = await query('SELECT filename FROM _migrations ORDER BY id');
  return new Set(rows.map(r => r.filename));
}

async function run() {
  logger.systemInfo('MIGRATE', '检查待执行迁移...');

  await ensureMigrationsTable();
  const applied = await getAppliedFilenames();

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  const pending = files.filter(f => !applied.has(f));

  if (pending.length === 0) {
    logger.systemInfo('MIGRATE', '所有迁移已执行，无需操作');
    return;
  }

  logger.systemInfo('MIGRATE', `发现 ${pending.length} 个待执行迁移`, { files: pending });

  for (const file of pending) {
    const filePath = path.join(MIGRATIONS_DIR, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    try {
      // Strip comment lines, split by semicolons, run each statement
      const statements = sql
        .replace(/^\s*--.*$/gm, '')
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const stmt of statements) {
        await query(stmt);
      }

      await query('INSERT INTO _migrations (filename) VALUES (?)', [file]);
      logger.systemInfo('MIGRATE', `迁移执行成功: ${file}`);
    } catch (err) {
      logger.systemError('MIGRATE', `迁移执行失败: ${file}`, { error: err.message });
      throw err;
    }
  }

  logger.systemInfo('MIGRATE', '所有迁移执行完毕');
}

module.exports = { run };
