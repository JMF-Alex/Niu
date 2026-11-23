import mongoose from 'mongoose';

export const Plan = mongoose.model('Plan', new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  priceCents: { type: Number, required: true },
  blurb: String,
  features: [String],
  order: Number,
}));

export const Signup = mongoose.model('Signup', new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  plan: { type: String, required: true },
}, { timestamps: true }));

const PLANS = [
  { slug: 'hobby', name: 'Hobby', priceCents: 0, order: 1, blurb: 'For side projects and coursework.',
    features: ['1 Node app', '512 MB MongoDB', 'niu.app subdomain', 'Sleeps after 30 min idle'] },
  { slug: 'pro', name: 'Pro', priceCents: 749, order: 2, blurb: 'For sites that need to stay awake.',
    features: ['5 Node apps', '5 GB MongoDB', 'Custom domains with HTTPS', 'Nightly backups kept 14 days'] },
  { slug: 'team', name: 'Team', priceCents: 2390, order: 3, blurb: 'For agencies and small product teams.',
    features: ['20 Node apps', '25 GB MongoDB', '5 team seats', 'Priority support in Catalan, Spanish and English'] },
];

export async function seedPlans() {
  if (await Plan.estimatedDocumentCount() === 0) await Plan.insertMany(PLANS);
}

export const Message = mongoose.model('Message', new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  topic: { type: String, required: true },
  message: { type: String, required: true },
}, { timestamps: true }));
