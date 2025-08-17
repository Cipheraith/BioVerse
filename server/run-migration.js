const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { logger } = require('./src/services/logger');

class MigrationRunner {
  constructor() {
    this.dbPath = path.join(__dirname, 'database', 'bioverse.db');
    this.migrationsDir = path.join(__dirname, 'migrations');
    this.db = null;
  }

  async initialize() {
    try {
      // Ensure database directory exists
      const dbDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
        logger.info('Created database directory', { path: dbDir });
      }

      // Connect to database
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          logger.error('Failed to connect to database', { error: err.message });
          throw err;
        }
        logger.info('Connected to SQLite database', { path: this.dbPath });
      });

      // Enable foreign keys
      await this.runQuery('PRAGMA foreign_keys = ON');

      return this.db;
    } catch (error) {
      logger.error('Database initialization failed', { error: error.message });
      throw error;
    }
  }

  async runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  async queryAll(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async createMigrationLogTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS migration_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        migration_name TEXT NOT NULL UNIQUE,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        version TEXT,
        description TEXT
      )
    `;

    await this.runQuery(sql);
    logger.info('Migration log table created/verified');
  }

  async getAppliedMigrations() {
    try {
      const migrations = await this.queryAll('SELECT migration_name FROM migration_log ORDER BY applied_at');
      return migrations.map(row => row.migration_name);
    } catch (error) {
      if (error.message.includes('no such table: migration_log')) {
        return [];
      }
      throw error;
    }
  }

  async getMigrationFiles() {
    try {
      const files = fs.readdirSync(this.migrationsDir);
      return files
        .filter(file => file.endsWith('.sql'))
        .sort(); // Ensure migrations run in order
    } catch (error) {
      if (error.code === 'ENOENT') {
        logger.warn('Migrations directory not found', { path: this.migrationsDir });
        return [];
      }
      throw error;
    }
  }

  async runMigration(migrationFile) {
    const migrationPath = path.join(this.migrationsDir, migrationFile);
    const sql = fs.readFileSync(migrationPath, 'utf8');

    logger.info('Running migration', { file: migrationFile });

    try {
      // Clean up SQL and split into statements
      const cleanSql = sql
        .replace(/--.*$/gm, '') // Remove comments
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
        .trim();

      // Split on semicolons but handle multi-line statements
      const statements = cleanSql
        .split(/;\s*\n/)
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && stmt !== 'PRAGMA foreign_keys = ON' && stmt !== 'ANALYZE');

      // Execute each statement
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim();
        if (statement) {
          // Add semicolon back if not present
          const finalStatement = statement.endsWith(';') ? statement : statement + ';';

          try {
            await this.runQuery(finalStatement);
            logger.info(`Executed statement ${i + 1}/${statements.length}`, {
              preview: finalStatement.substring(0, 100) + '...'
            });
          } catch (stmtError) {
            // Skip certain expected errors
            if (stmtError.message.includes('already exists') ||
                stmtError.message.includes('duplicate column') ||
                stmtError.message.includes('UNIQUE constraint failed')) {
              logger.warn('Ignoring expected error', { error: stmtError.message });
              continue;
            }
            throw stmtError;
          }
        }
      }

      // Don't record migration here as it's handled in the SQL itself
      logger.info('Migration completed successfully', { file: migrationFile });

    } catch (error) {
      logger.error('Migration failed', { file: migrationFile, error: error.message });
      throw new Error(`Migration ${migrationFile} failed: ${error.message}`);
    }
  }

  async runAllMigrations() {
    try {
      await this.createMigrationLogTable();

      const appliedMigrations = await this.getAppliedMigrations();
      const migrationFiles = await this.getMigrationFiles();

      logger.info('Migration status', {
        totalMigrations: migrationFiles.length,
        appliedMigrations: appliedMigrations.length,
        pendingMigrations: migrationFiles.length - appliedMigrations.length
      });

      let migrationsRun = 0;

      for (const migrationFile of migrationFiles) {
        if (!appliedMigrations.includes(migrationFile)) {
          await this.runMigration(migrationFile);
          migrationsRun++;
        } else {
          logger.info('Migration already applied', { file: migrationFile });
        }
      }

      if (migrationsRun === 0) {
        logger.info('No new migrations to run');
      } else {
        logger.info('All migrations completed', { migrationsRun });
      }

      return migrationsRun;

    } catch (error) {
      logger.error('Migration process failed', { error: error.message });
      throw error;
    }
  }

  async checkDatabaseHealth() {
    try {
      // Check if key tables exist
      const tables = await this.queryAll(`
        SELECT name FROM sqlite_master
        WHERE type='table' AND name IN (
          'voice_analyses',
          'cv_analyses',
          'health_recommendations',
          'user_health_profiles'
        )
        ORDER BY name
      `);

      const tableNames = tables.map(table => table.name);

      logger.info('Database health check', {
        tablesFound: tableNames.length,
        tables: tableNames
      });

      const expectedTables = ['voice_analyses', 'cv_analyses', 'health_recommendations', 'user_health_profiles'];
      const missingTables = expectedTables.filter(table => !tableNames.includes(table));

      if (missingTables.length > 0) {
        logger.warn('Missing tables detected', { missingTables });
        return { healthy: false, missingTables };
      }

      // Check table schemas
      for (const tableName of tableNames) {
        const columns = await this.queryAll(`PRAGMA table_info(${tableName})`);
        logger.info(`Table schema: ${tableName}`, {
          columns: columns.length,
          columnNames: columns.map(col => col.name)
        });
      }

      return { healthy: true, tables: tableNames };

    } catch (error) {
      logger.error('Database health check failed', { error: error.message });
      return { healthy: false, error: error.message };
    }
  }

  async seedTestData() {
    try {
      logger.info('Seeding test data');

      // Insert test voice analysis data
      const voiceTestData = [
        {
          user_id: 'demo-user',
          overall_score: 0.75,
          depression_risk: 0.3,
          anxiety_level: 0.4,
          stress_level: 5.0,
          energy_level: 0.7,
          voice_stability: 0.8,
          speech_clarity: 0.75,
          analysis_result: JSON.stringify({
            analysisType: 'mental_health',
            confidence: 0.85,
            biomarkers: { fundamentalFreq: 150, jitter: 0.02 }
          })
        }
      ];

      for (const data of voiceTestData) {
        await this.runQuery(`
          INSERT OR IGNORE INTO voice_analyses (
            user_id, overall_score, depression_risk, anxiety_level,
            stress_level, energy_level, voice_stability, speech_clarity,
            analysis_result, timestamp
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          data.user_id, data.overall_score, data.depression_risk, data.anxiety_level,
          data.stress_level, data.energy_level, data.voice_stability, data.speech_clarity,
          data.analysis_result, new Date().toISOString()
        ]);
      }

      // Insert test CV analysis data
      const cvTestData = [
        {
          user_id: 'demo-user',
          analysis_type: 'dermatology',
          confidence: 0.92,
          risk_score: 0.2,
          primary_finding: 'benign_nevus',
          analysis_result: JSON.stringify({
            analysisType: 'dermatology',
            confidence: 0.92,
            malignancyRisk: 0.2,
            recommendations: ['routine_monitoring']
          })
        }
      ];

      for (const data of cvTestData) {
        await this.runQuery(`
          INSERT OR IGNORE INTO cv_analyses (
            user_id, analysis_type, confidence, risk_score,
            primary_finding, analysis_result, timestamp
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          data.user_id, data.analysis_type, data.confidence, data.risk_score,
          data.primary_finding, data.analysis_result, new Date().toISOString()
        ]);
      }

      logger.info('Test data seeding completed');

    } catch (error) {
      logger.error('Test data seeding failed', { error: error.message });
      throw error;
    }
  }

  async close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            logger.error('Error closing database', { error: err.message });
          } else {
            logger.info('Database connection closed');
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

// Main execution function
async function main() {
  const migrationRunner = new MigrationRunner();

  try {
    logger.info('🚀 Starting BioVerse Database Migration');

    await migrationRunner.initialize();

    const migrationsRun = await migrationRunner.runAllMigrations();

    const healthCheck = await migrationRunner.checkDatabaseHealth();

    if (healthCheck.healthy) {
      logger.info('✅ Database is healthy and ready');

      // Optionally seed test data in development
      if (process.env.NODE_ENV === 'development' || process.env.SEED_TEST_DATA === 'true') {
        await migrationRunner.seedTestData();
      }

    } else {
      logger.error('❌ Database health check failed', { details: healthCheck });
      process.exit(1);
    }

    logger.info('🎉 Migration process completed successfully');

  } catch (error) {
    logger.error('💥 Migration process failed', { error: error.message, stack: error.stack });
    process.exit(1);
  } finally {
    await migrationRunner.close();
  }
}

// Export for programmatic use
module.exports = { MigrationRunner };

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Unhandled migration error:', error);
    process.exit(1);
  });
}
