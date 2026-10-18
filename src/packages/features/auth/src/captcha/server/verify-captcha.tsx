import 'server-only';

const verifyEndpoint =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const CAPTCHA_SECRET_TOKEN = process.env.CAPTCHA_SECRET_TOKEN;

/**
 * @name verifyCaptchaToken
 * @description Verify the CAPTCHA token with the CAPTCHA service
 * @param token - The CAPTCHA token to verify
 */
export async function verifyCaptchaToken(token: string) {
  const secretKey =
    process.env.CAPTCHA_SECRET_TOKEN ?? process.env.TURNSTILE_SECRET;

  if (!secretKey) {
    throw new Error('CAPTCHA_SECRET_TOKEN (or TURNSTILE_SECRET) is not set');
  }

  if (typeof token !== 'string' || token.length === 0 || token.length > 2048) {
    throw new Error('Invalid CAPTCHA token format');
  }

  const formData = new FormData();

  formData.append('secret', secretKey);
  formData.append('response', token);

  const res = await fetch(verifyEndpoint, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    console.error(`Captcha failed:`, res.statusText);

    throw new Error('Failed to verify CAPTCHA token');
  }

  const data = (await res.json()) as { success: boolean };

  if (!data.success) {
    throw new Error('Invalid CAPTCHA token');
  }
}
