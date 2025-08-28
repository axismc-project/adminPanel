const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDatabase() {
  try {
    console.log('🔄 Initialisation de la base de données...');

    // Créer l'admin de base si activé dans l'env
    if (process.env.BASE_ADMIN_ENABLED === 'true') {
      const username = process.env.BASE_ADMIN_USERNAME;
      const email = process.env.BASE_ADMIN_EMAIL;
      const password = process.env.BASE_ADMIN_PASSWORD;

      if (!username || !email || !password) {
        console.log('⚠️  Variables d\'environnement manquantes pour l\'admin de base');
        return;
      }

      // Vérifier si l'admin existe déjà
      const existingAdmin = await pool.query(
        'SELECT id FROM admins WHERE username = $1 OR email = $2',
        [username, email]
      );

      if (existingAdmin.rows.length > 0) {
        console.log('✅ Admin de base déjà existant');
        return;
      }

      // Créer l'admin de base
      const passwordHash = await bcrypt.hash(password, 12);
      
      await pool.query(
        `INSERT INTO admins (username, email, password_hash, is_base_admin, is_active)
         VALUES ($1, $2, $3, true, true)`,
        [username, email, passwordHash]
      );

      console.log('✅ Admin de base créé avec succès');
      console.log(`   Nom d'utilisateur: ${username}`);
      console.log(`   Email: ${email}`);
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
  } finally {
    await pool.end();
  }
}

initDatabase();