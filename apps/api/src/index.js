import mongoose from 'mongoose';
import { app } from './app.js';
import { seedPlans } from './models.js';

const uri = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/niu';
const port = process.env.PORT ?? 4000;

await mongoose.connect(uri);
await seedPlans();
app.listen(port, () => console.log(`Niu API listening on http://localhost:${port}`));
