// =============================================
// utils/generateToken.js - JWT Token Generator
// =============================================

import jwt from 'jsonwebtoken';

// ─────────────────────────────────────────────
// generateToken Function
// ─────────────────────────────────────────────
// JWT = JSON Web Token
// It's a secure way to identify who is logged in
//
// How it works:
// 1. User logs in with email + password
// 2. Server verifies credentials
// 3. Server creates a TOKEN containing user's ID
// 4. Server sends token to user
// 5. User sends token with every future request
// 6. Server reads token to know who the user is
//
// The token looks like: xxxxx.yyyyy.zzzzz
// Part 1 = Header (algorithm info)
// Part 2 = Payload (user data)
// Part 3 = Signature (security verification)

const generateToken = (res, userId, role) => {
  // jwt.sign() creates the token
  // Parameters:
  // 1. Payload = data to store in token (we store user ID and role)
  // 2. Secret = secret key used to sign token (from .env)
  // 3. Options = configuration (expiry time)
  
  const token = jwt.sign(
    { 
      id: userId,    // Store user's MongoDB _id
      role: role,    // Store user's role (student/vendor/admin)
    },
    process.env.JWT_SECRET,           // Secret key from .env
    { expiresIn: process.env.JWT_EXPIRE || '30d' }  // Token expires in 30 days
  );

  // ─────────────────────────────────────────────
  // STORE TOKEN IN HTTP-ONLY COOKIE
  // ─────────────────────────────────────────────
  // We store the JWT in a cookie for security
  // httpOnly: true means JavaScript cannot access this cookie
  // This prevents XSS (Cross-Site Scripting) attacks
  
  res.cookie('token', token, {
    httpOnly: true,      // Cannot be accessed by JavaScript (XSS protection)
    secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
    sameSite: 'strict',  // CSRF protection
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  });

  // Also return the token so we can send it in the response body
  // Frontend can store this in localStorage as a backup
  return token;
};

export default generateToken;