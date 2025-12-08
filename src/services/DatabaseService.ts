import * as SQLite from 'expo-sqlite';
import { ProductFormData, PromotionFormData } from '../../types';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('comecon.db');
      await this.createTables();
      await this.seedInitialData();
      console.log('✅ Base de datos SQLite inicializada.');
    } catch (error) {
      console.error('❌ Error inicializando DB:', error);
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) return;
    try {
      //  Usuarios
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT,
          role TEXT NOT NULL,
          phone TEXT
        );
      `);
      
      //  Productos
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          subtitle TEXT,
          price REAL NOT NULL,
          description TEXT,
          image TEXT,
          category TEXT,
          visible INTEGER DEFAULT 1
        );
      `);

      //  Promociones
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS promotions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          productId INTEGER NOT NULL,
          promotionalPrice REAL NOT NULL,
          startDate TEXT,
          endDate TEXT,
          visible INTEGER DEFAULT 1,
          FOREIGN KEY (productId) REFERENCES products (id) ON DELETE CASCADE
        );
      `);

      //  Órdenes
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          total REAL NOT NULL,
          status TEXT NOT NULL,
          date TEXT NOT NULL,
          deliveryTime TEXT,
          historyNotes TEXT,
          FOREIGN KEY (userId) REFERENCES users (id)
        );
      `);
      
      // Items de Orden
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          orderId INTEGER NOT NULL,
          productId INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          priceAtMoment REAL NOT NULL,
          FOREIGN KEY (orderId) REFERENCES orders (id),
          FOREIGN KEY (productId) REFERENCES products (id)
        );
      `);
    } catch (error) {
      console.error('Error creando tablas:', error);
    }
  }

  private async seedInitialData(): Promise<void> {
    if (!this.db) return;
    const userCheck = await this.db.getFirstAsync('SELECT * FROM users LIMIT 1');
    if (!userCheck) {
      console.log('🌱 Sembrando datos iniciales...');
      await this.db.runAsync('INSERT INTO users (email, password, name, role, phone) VALUES (?, ?, ?, ?, ?)', ['admin1@comecon.com', '12345678a', 'Admin Principal', 'administrador', '3510000000']);
      await this.db.runAsync('INSERT INTO users (email, password, name, role, phone) VALUES (?, ?, ?, ?, ?)', ['cliente1@comecon.com', '12345678a', 'Juan Pérez', 'cliente', '3512345678']);
      
      const products = [
        ['Bowl con Frutas', 'Fresa, kiwi, avena', 120.99, 'Bowl fresco con frutas de temporada y granola.', 'bowlFrutas', 1],
        ['Tostada', 'Aguacate', 150.80, 'Tostada integral con aguacate fresco y huevo.', 'tostadaAguacate', 1],
        ['Panqueques', 'Avena y Frutas', 115.99, 'Torre de panqueques saludables con miel.', 'Panques', 1],
        ['Cafe Panda', 'Latte', 110.00, 'Café latte artesanal con diseño de panda.', 'cafePanda', 1]
      ];
      for (const p of products) {
        await this.db.runAsync('INSERT INTO products (title, subtitle, price, description, image, visible) VALUES (?, ?, ?, ?, ?, ?)', p);
      }
    }
  }

  // --- MÉTODOS PÚBLICOS ---

  async loginUser(email: string, password: string): Promise<any> {
    if (!this.db) return null;
    return await this.db.getFirstAsync('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
  }

  async registerUser(userData: { name: string, email: string, phone: string, password: string }): Promise<boolean> {
    if (!this.db) return false;
    try {
      const existing = await this.db.getFirstAsync('SELECT id FROM users WHERE email = ?', [userData.email]);
      if (existing) return false;
      await this.db.runAsync('INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)', [userData.name, userData.email, userData.phone, userData.password, 'cliente']);
      return true;
    } catch { return false; }
  }

  async checkUserExists(emailOrPhone: string): Promise<boolean> {
    if (!this.db) return false;
    const user = await this.db.getFirstAsync('SELECT id FROM users WHERE email = ? OR phone = ?', [emailOrPhone, emailOrPhone]);
    return !!user;
  }

  async updatePassword(emailOrPhone: string, newPassword: string): Promise<boolean> {
    if (!this.db) return false;
    const res = await this.db.runAsync('UPDATE users SET password = ? WHERE email = ? OR phone = ?', [newPassword, emailOrPhone, emailOrPhone]);
    return res.changes > 0;
  }

  // PRODUCTOS

  async getProducts(): Promise<any[]> {
    if (!this.db) return [];
    try {
      const query = `
        SELECT p.*, pr.promotionalPrice, pr.visible as promoVisible
        FROM products p
        LEFT JOIN promotions pr ON p.id = pr.productId AND pr.visible = 1
        ORDER BY p.id DESC
      `;
      const products = await this.db.getAllAsync(query);

      return products.map((p: any) => {
        return { 
          ...p, 
          visible: p.visible === 1,
          price: p.price.toString(), // Siempre el precio base
          promotionalPrice: p.promotionalPrice != null ? p.promotionalPrice.toString() : undefined
        };
      });
    } catch (error) {
      console.error("Error obteniendo productos:", error);
      return [];
    }
  }

  async addProduct(product: any): Promise<void> {
    if (!this.db) return;
    try {
      const image = product.image || 'logoApp';
      const visible = product.visible !== false ? 1 : 0; 
      await this.db.runAsync(
        'INSERT INTO products (title, subtitle, price, description, image, visible) VALUES (?, ?, ?, ?, ?, ?)',
        [product.title, product.subtitle, parseFloat(product.price), product.description, image, visible]
      );
    } catch (error) { throw error; }
  }

  async updateProduct(id: number, product: Partial<ProductFormData>): Promise<void> {
    if (!this.db) return;
    try {
      const title = product.title || '';
      const subtitle = product.subtitle || '';
      const description = product.description || '';
      const price = product.price ? parseFloat(product.price) : 0;
      const visible = product.visible ? 1 : 0;

      await this.db.runAsync(
        'UPDATE products SET title = ?, subtitle = ?, price = ?, description = ?, visible = ? WHERE id = ?',
        [title, subtitle, price, description, visible, id]
      );
    } catch (error) { throw error; }
  }

  async deleteProduct(id: number): Promise<void> {
    if (!this.db) return;
    await this.db.runAsync('DELETE FROM products WHERE id = ?', [id]);
  }

  //  PROMOCIONES

  async createPromotion(productId: number, promoData: PromotionFormData): Promise<void> {
    if (!this.db) return;
    try {
      const existing = await this.db.getFirstAsync('SELECT id FROM promotions WHERE productId = ?', [productId]);
      const visible = promoData.visible !== false ? 1 : 0;
      const price = parseFloat(promoData.promotionalPrice);

      if (existing) {
        await this.db.runAsync(
          'UPDATE promotions SET promotionalPrice = ?, startDate = ?, endDate = ?, visible = ? WHERE productId = ?',
          [price, promoData.startDate, promoData.endDate, visible, productId]
        );
      } else {
        await this.db.runAsync(
          'INSERT INTO promotions (productId, promotionalPrice, startDate, endDate, visible) VALUES (?, ?, ?, ?, ?)',
          [productId, price, promoData.startDate, promoData.endDate, visible]
        );
      }
      console.log('✅ Promoción guardada.');
    } catch (error) {
      console.error('Error guardando promoción:', error);
      throw error;
    }
  }

  async deletePromotion(productId: number): Promise<void> {
    if (!this.db) return;
    try {
      await this.db.runAsync('DELETE FROM promotions WHERE productId = ?', [productId]);
      console.log('✅ Promoción eliminada permanentemente.');
    } catch (error) {
      console.error('Error eliminando promoción:', error);
      throw error;
    }
  }

  async getPromotionByProductId(productId: number): Promise<any | null> {
    if (!this.db) return null;
    try {
      return await this.db.getFirstAsync('SELECT * FROM promotions WHERE productId = ?', [productId]);
    } catch (error) {
      return null;
    }
  }

  async debugCheckDB(): Promise<void> {
    if (!this.db) return;
    const products = await this.db.getAllAsync('SELECT * FROM products');
    console.log(`📦 Productos: ${products.length}`);
  }
}

export default new DatabaseService();