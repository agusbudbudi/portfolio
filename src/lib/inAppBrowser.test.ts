import { describe, expect, it } from 'vitest';
import { androidIntentUrl, detectInAppBrowser } from './inAppBrowser';

describe('detectInAppBrowser', () => {
  it('detects Threads on iOS and Android', () => {
    expect(detectInAppBrowser(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Barcelona 330.0.0.25.88',
    )).toBe('Threads');
    expect(detectInAppBrowser(
      'Mozilla/5.0 (Linux; Android 14; SM-S911B; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/125.0 Mobile Safari/537.36 Barcelona 330.0.0.37.106 Android',
    )).toBe('Threads');
  });

  it('detects Instagram and Facebook', () => {
    expect(detectInAppBrowser('Mozilla/5.0 (iPhone) Mobile/15E148 Instagram 330.0.2.30.98')).toBe('Instagram');
    expect(detectInAppBrowser('Mozilla/5.0 (iPhone) Mobile/15E148 [FBAN/FBIOS;FBAV/470.0]')).toBe('Facebook');
  });

  it('detects a generic Android WebView', () => {
    expect(detectInAppBrowser(
      'Mozilla/5.0 (Linux; Android 13; Pixel 7 Build/TQ3A; wv) AppleWebKit/537.36 Version/4.0 Chrome/124.0 Mobile Safari/537.36',
    )).toBe('aplikasi ini');
  });

  it('ignores normal browsers', () => {
    expect(detectInAppBrowser(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    )).toBeNull();
    expect(detectInAppBrowser(
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Mobile Safari/537.36',
    )).toBeNull();
    expect(detectInAppBrowser(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
    )).toBeNull();
  });
});

describe('androidIntentUrl', () => {
  it('keeps path and query and adds a fallback', () => {
    const url = 'https://www.mentorqa.com/login?redirect=%2Fdashboard';
    expect(androidIntentUrl(url)).toBe(
      'intent://www.mentorqa.com/login?redirect=%2Fdashboard#Intent;scheme=https;package=com.android.chrome;'
      + `S.browser_fallback_url=${encodeURIComponent(url)};end`,
    );
  });
});
