import express from 'express';
import { Message, Plan, Signup } from './models.js';
import { validateMessage, validateSignup } from './validate.js';

export const app = express();
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/plans', async (req, res) => {
  res.json(await Plan.find({}, '-_id -__v').sort('order').lean());
});

app.post('/api/signups', async (req, res) => {
  const { email, plan } = req.body ?? {};
  const error = validateSignup({ email, plan });
  if (error) return res.status(400).json({ error });
  if (!(await Plan.exists({ slug: plan }))) return res.status(400).json({ error: 'Choose a plan.' });
  try {
    await Signup.create({ email: email.trim().toLowerCase(), plan });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'This email already has a trial. Use another address.' });
    throw err;
  }
  res.status(201).json({ ok: true });
});

app.post('/api/messages', async (req, res) => {
  const { name, email, topic, message } = req.body ?? {};
  const error = validateMessage({ name, email, topic, message });
  if (error) return res.status(400).json({ error });
  await Message.create({ name: name.trim(), email: email.trim().toLowerCase(), topic, message: message.trim() });
  res.status(201).json({ ok: true });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something failed on our side. Try again in a minute.' });
});
