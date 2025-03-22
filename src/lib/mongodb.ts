import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGO_URI environment variable inside .env');
}

interface MongooseCache {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

// Use a type assertion to extend global
interface CustomGlobal {
  mongooseCache?: MongooseCache;
}

declare const global: CustomGlobal & typeof globalThis;

function getMongooseCache(): MongooseCache {
  if (!global.mongooseCache) {
    global.mongooseCache = { conn: null, promise: null };
  }
  return global.mongooseCache;
}

async function connectMongoDB() {
  const cached = getMongooseCache();

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then(mongooseInstance => {
        console.log('MongoDB connected successfully');
        cached.conn = mongooseInstance.connection;
        return cached.conn;
      })
      .catch(error => {
        console.error('MongoDB connection error:', error);
        cached.promise = null;
        throw error;
      });
  }

  try {
    return await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

export default connectMongoDB;

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});
