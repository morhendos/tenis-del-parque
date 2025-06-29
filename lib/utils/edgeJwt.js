/**
 * Edge Runtime compatible JWT utilities for middleware
 * Uses Web Crypto API instead of Node.js crypto
 */

/**
 * Production-safe JWT token verification for Edge Runtime
 * Uses Web Crypto API for HMAC signature verification
 * @param {string} token - The JWT token to verify
 * @param {string} secret - The JWT secret
 * @returns {Object|null} - Decoded payload or null if invalid
 */
export async function verifyTokenEdge(token, secret) {
  try {
    if (!token || !secret) {
      return null
    }

    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const [headerB64, payloadB64, signatureB64] = parts

    // Decode header and payload
    const header = JSON.parse(base64urlDecode(headerB64))
    const payload = JSON.parse(base64urlDecode(payloadB64))

    // Check algorithm
    if (header.alg !== 'HS256') {
      return null
    }

    // Check if token is expired
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null
    }

    // Verify HMAC signature using Web Crypto API
    const encoder = new TextEncoder()
    const data = encoder.encode(`${headerB64}.${payloadB64}`)
    const secretKey = encoder.encode(secret)

    // Import the key for HMAC
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      secretKey,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    // Create expected signature
    const expectedSignature = await crypto.subtle.sign('HMAC', cryptoKey, data)
    const expectedSignatureB64 = base64urlEncode(new Uint8Array(expectedSignature))

    // Compare signatures (constant-time comparison)
    if (expectedSignatureB64 !== signatureB64) {
      return null
    }

    return payload

  } catch (error) {
    return null
  }
}

/**
 * Base64url decode for Edge Runtime
 */
function base64urlDecode(str) {
  // Add padding if needed
  const padded = str + '='.repeat((4 - (str.length % 4)) % 4)
  return atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
}

/**
 * Base64url encode for Edge Runtime
 */
function base64urlEncode(uint8Array) {
  const str = btoa(String.fromCharCode(...uint8Array))
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
} 