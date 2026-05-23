// ═══════════════════════════════════════════════════════════════
// MongoDB Atlas Connection
// ═══════════════════════════════════════════════════════════════

const mongoose = require('mongoose');
const dns = require('dns');

// Use Google Public DNS only in development
// (some local DNS servers can't resolve SRV records)
// In production (Render, etc.), the default DNS works fine
if (process.env.NODE_ENV !== 'production') {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
}

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000
  });

  // Global transform: convert _id → id in all JSON responses
  // This means the frontend gets .id (same as IndexedDB) — zero migration needed
  mongoose.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret.__v;
      return ret;
    }
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected. Attempting reconnection...');
  });
}

module.exports = connectDB;
