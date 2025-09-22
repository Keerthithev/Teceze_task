import mongoose from 'mongoose';

export async function connectToDatabase() {
  const envUri = process.env.MONGODB_URI;
  const fallbackUri = 'mongodb+srv://KeerthiDev:9AkQP1TaAYasb09H@keerthidev.stiw0.mongodb.net/tecezetask?retryWrites=true&w=majority';
  const mongoUri = envUri && envUri.trim().length > 0 ? envUri : fallbackUri;

  mongoose.set('strictQuery', false);
  await mongoose.connect(mongoUri, {
    dbName: 'tecezetask',
  });
  console.log('Connected to MongoDB');
}


