import { describe, expect, it } from 'vitest';
import { buildGoogleAuthUrl, parseGoogleRedirect, safeReturnTo, type PendingRedirect } from './googleRedirectAuth';

const b64url = (obj: unknown) =>
  btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fakeJwt = (payload: unknown) => `${b64url({ alg: 'RS256' })}.${b64url(payload)}.sig`;

const pending: PendingRedirect = { state: 's1', nonce: 'n1', returnTo: '/courses/junior-qa-ready' };

describe('parseGoogleRedirect', () => {
  it('ignores fragments that are not an OAuth reply', () => {
    expect(parseGoogleRedirect('', pending)).toBeNull();
    expect(parseGoogleRedirect('#section-2', pending)).toBeNull();
  });

  it('returns the credential when state and nonce match', () => {
    const jwt = fakeJwt({ nonce: 'n1', email: 'a@b.c' });
    expect(parseGoogleRedirect(`#state=s1&id_token=${jwt}`, pending)).toEqual({
      kind: 'success', credential: jwt, returnTo: '/courses/junior-qa-ready',
    });
  });

  it('rejects a state mismatch or missing pending entry', () => {
    const jwt = fakeJwt({ nonce: 'n1' });
    expect(parseGoogleRedirect(`#state=other&id_token=${jwt}`, pending)?.kind).toBe('error');
    expect(parseGoogleRedirect(`#state=s1&id_token=${jwt}`, null)?.kind).toBe('error');
  });

  it('rejects a nonce mismatch or malformed token', () => {
    expect(parseGoogleRedirect(`#state=s1&id_token=${fakeJwt({ nonce: 'x' })}`, pending)?.kind).toBe('error');
    expect(parseGoogleRedirect('#state=s1&id_token=garbage', pending)?.kind).toBe('error');
  });

  it('maps a cancelled consent to a friendly message', () => {
    expect(parseGoogleRedirect('#error=access_denied&state=s1', pending)).toEqual({
      kind: 'error', message: 'Login dibatalkan.', returnTo: '/courses/junior-qa-ready',
    });
  });
});

describe('safeReturnTo', () => {
  it('keeps same-site paths and rejects others', () => {
    expect(safeReturnTo('/qa-simulator/x?phase=2')).toBe('/qa-simulator/x?phase=2');
    expect(safeReturnTo('https://evil.com')).toBe('/dashboard');
    expect(safeReturnTo('//evil.com')).toBe('/dashboard');
    expect(safeReturnTo(null)).toBe('/dashboard');
  });
});

describe('buildGoogleAuthUrl', () => {
  it('asks for an id_token with nonce and state', () => {
    const url = new URL(buildGoogleAuthUrl({
      clientId: 'cid', redirectUri: 'https://www.mentorqa.com/login', state: 's1', nonce: 'n1',
    }));
    expect(url.origin + url.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth');
    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      client_id: 'cid',
      redirect_uri: 'https://www.mentorqa.com/login',
      response_type: 'id_token',
      scope: 'openid email profile',
      state: 's1',
      nonce: 'n1',
    });
  });
});
