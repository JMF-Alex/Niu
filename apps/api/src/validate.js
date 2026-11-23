const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSignup({ email, plan } = {}) {
  if (typeof email !== 'string' || email.length > 254 || !EMAIL.test(email.trim())) {
    return 'Enter a valid email address, like name@example.com.';
  }
  if (typeof plan !== 'string' || !/^[a-z]+$/.test(plan)) return 'Choose a plan.';
  return null;
}

export const TOPICS = ['sales', 'support', 'education'];

export function validateMessage({ name, email, topic, message } = {}) {
  if (typeof name !== 'string' || !name.trim() || name.length > 100) return 'Enter your name.';
  const emailError = validateSignup({ email, plan: 'x' });
  if (emailError) return emailError;
  if (!TOPICS.includes(topic)) return 'Choose a topic.';
  if (typeof message !== 'string' || message.trim().length < 10 || message.length > 2000) {
    return 'Write a message between 10 and 2000 characters.';
  }
  return null;
}
