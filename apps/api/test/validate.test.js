import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateSignup } from '../src/validate.js';

test('accepts a normal signup', () => {
  assert.equal(validateSignup({ email: 'marta@fornmad.es', plan: 'pro' }), null);
});

test('rejects bad emails and missing plans', () => {
  assert.match(validateSignup({ email: 'marta@', plan: 'pro' }), /email/);
  assert.match(validateSignup({ email: 'marta@fornmad.es' }), /plan/);
});

test('rejects Mongo operator objects', () => {
  assert.ok(validateSignup({ email: { $ne: null }, plan: 'pro' }));
  assert.ok(validateSignup({ email: 'a@b.es', plan: { $ne: null } }));
});

import { validateMessage } from '../src/validate.js';

test('contact messages need name, email, known topic and real text', () => {
  const ok = { name: 'Pau', email: 'pau@estudipla.es', topic: 'sales', message: 'We host six client shops.' };
  assert.equal(validateMessage(ok), null);
  assert.match(validateMessage({ ...ok, name: ' ' }), /name/);
  assert.match(validateMessage({ ...ok, topic: 'spam' }), /topic/);
  assert.match(validateMessage({ ...ok, message: 'hi' }), /10/);
  assert.ok(validateMessage({ ...ok, message: { $gt: '' } }));
});
