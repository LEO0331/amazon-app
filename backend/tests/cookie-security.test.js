import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clearAuthCookie,
  clearCsrfCookie,
  issueCsrfToken,
  setAuthCookie,
} from '../utils.js';

function createResponseRecorder() {
  const calls = {
    cookie: [],
    clearCookie: [],
  };

  return {
    calls,
    cookie(name, value, options) {
      calls.cookie.push({ name, value, options });
    },
    clearCookie(name, options) {
      calls.clearCookie.push({ name, options });
    },
  };
}

test('cookie policy: development defaults to SameSite=Lax and Secure=false', () => {
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'test';
  try {
    const res = createResponseRecorder();
    setAuthCookie(res, 'token');
    issueCsrfToken(res);

    assert.equal(res.calls.cookie[0].name, 'auth_token');
    assert.equal(res.calls.cookie[0].options.sameSite, 'lax');
    assert.equal(res.calls.cookie[0].options.secure, false);

    assert.equal(res.calls.cookie[1].name, 'csrf_token');
    assert.equal(res.calls.cookie[1].options.sameSite, 'lax');
    assert.equal(res.calls.cookie[1].options.secure, false);
  } finally {
    process.env.NODE_ENV = previousNodeEnv;
  }
});

test('cookie policy: production uses SameSite=None and Secure=true for cross-origin cookies', () => {
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try {
    const res = createResponseRecorder();
    setAuthCookie(res, 'token');
    issueCsrfToken(res);
    clearAuthCookie(res);
    clearCsrfCookie(res);

    const authSet = res.calls.cookie.find((entry) => entry.name === 'auth_token');
    const csrfSet = res.calls.cookie.find((entry) => entry.name === 'csrf_token');
    const authClear = res.calls.clearCookie.find((entry) => entry.name === 'auth_token');
    const csrfClear = res.calls.clearCookie.find((entry) => entry.name === 'csrf_token');

    assert.equal(authSet.options.sameSite, 'none');
    assert.equal(authSet.options.secure, true);
    assert.equal(csrfSet.options.sameSite, 'none');
    assert.equal(csrfSet.options.secure, true);
    assert.equal(authClear.options.sameSite, 'none');
    assert.equal(authClear.options.secure, true);
    assert.equal(csrfClear.options.sameSite, 'none');
    assert.equal(csrfClear.options.secure, true);
  } finally {
    process.env.NODE_ENV = previousNodeEnv;
  }
});
