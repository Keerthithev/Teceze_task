import mongoose from 'mongoose';

export async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set. Define it in backend/.env');
  }

  mongoose.set('strictQuery', false);
  await mongoose.connect(mongoUri, {
    dbName: 'tecezetask',
  });
  console.log('Connected to MongoDB');
}


