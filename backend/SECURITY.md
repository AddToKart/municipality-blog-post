# Security Implementation Guide

## Overview

This document describes the comprehensive security measures implemented in the Santa Maria Municipality Blog System to protect against common web vulnerabilities and attacks.

## 🛡️ Security Features Implemented

### 1. **Authentication & Authorization**

#### Token Blacklist System

- **Location**: `backend/src/utils/tokenBlacklist.ts`
- **Purpose**: Invalidates JWT tokens on logout, making logout functional and secure
- **How it works**:
  - Maintains an in-memory blacklist of logged-out tokens
  - Automatically cleans up expired tokens every hour
  - Tokens are checked against blacklist on every authenticated request
  - In production, consider migrating to Redis for scalability across multiple servers

#### Enhanced Authentication Middleware

- **Location**: `backend/src/middleware/auth.ts`
- **Features**:
  - Validates token format and payload
  - Checks if token is blacklisted
  - Validates token expiration
  - Secure error handling without information leakage
  - Production-safe logging

### 2. **Brute Force Protection**

#### Login Rate Limiting

- **Location**: `backend/src/middleware/authRateLimiter.ts`
- **Limits**:
  - **Login endpoint**: 5 attempts per 15 minutes per IP
  - **Failed login tracker**: Blocks after 3 failed attempts for 1 hour
  - **Auth endpoints**: 100 requests per 15 minutes
  - Tracks both by IP address and email combination

#### Failed Login Tracker

- Monitors failed login attempts
- Progressive blocking:
  - 3 failed attempts → 1 hour block
  - Separate tracking for each email/IP combination
  - Automatic unblocking after duration expires
  - Cleared on successful login

### 3. **SQL Injection Prevention**

#### Parameterized Queries

- **All database queries use parameterized statements**
- Example:

  ```typescript
  // ✅ SAFE - Parameterized query
  await query("SELECT * FROM users WHERE email = $1", [email]);

  // ❌ UNSAFE - String concatenation (never used)
  await query(`SELECT * FROM users WHERE email = '${email}'`);
  ```

#### Input Validation Utilities

- **Location**: `backend/src/utils/validation.ts`
- **Features**:
  - Email format validation (RFC 5322)
  - Password strength validation
  - SQL injection pattern detection
  - Integer sanitization
  - String length validation
  - Pagination parameter validation

#### SQL Security Utilities

- **Location**: `backend/src/utils/sqlSecurity.ts`
- **Features**:
  - LIKE pattern escaping
  - ID validation and sanitization
  - Slug validation
  - Enum validation
  - Column name whitelisting
  - Order direction validation
  - Query audit helper (development mode)

### 4. **Input Validation & Sanitization**

#### Request Validation Middleware

- `validateLoginRequest`: Email and password validation
- `validatePaginationParams`: Page and limit validation
- `validateIdParam`: Dynamic ID parameter validation
- SQL injection pattern detection
- Length restrictions to prevent buffer overflow

#### Validation Functions

```typescript
// Email validation
isValidEmail(email: string): boolean

// Password strength (8+ chars, letter + number)
isValidPassword(password: string): boolean

// SQL injection detection
containsSQLInjection(input: string): boolean

// Safe integer parsing
sanitizeInteger(input: any): number | null
sanitizePositiveInteger(input: any): number | null
```

### 5. **Security Headers**

#### Helmet.js Configuration

- **Location**: `backend/src/app.ts`
- **Headers enabled**:
  - `X-DNS-Prefetch-Control`: Controls DNS prefetching
  - `X-Frame-Options`: Prevents clickjacking
  - `X-Content-Type-Options`: Prevents MIME sniffing
  - `Strict-Transport-Security`: Forces HTTPS
  - `X-Download-Options`: Prevents downloads in IE
  - `X-Permitted-Cross-Domain-Policies`: Controls cross-domain
  - `Referrer-Policy`: Controls referrer information
  - `Content-Security-Policy`: Prevents XSS and injection attacks

#### CORS Configuration

```typescript
{
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}
```

### 6. **Rate Limiting**

#### Global Rate Limits

- **API endpoints**: 300 requests per 15 minutes
- **Login endpoint**: 5 requests per 15 minutes
- **Other auth endpoints**: 100 requests per 15 minutes
- Configurable via environment variables:
  - `RATE_LIMIT_WINDOW_MS`
  - `RATE_LIMIT_MAX_REQUESTS`
  - `AUTH_RATE_LIMIT_MAX_REQUESTS`

### 7. **Production Logging**

#### ProductionLogger

- **Location**: `backend/src/utils/logger.ts`
- **Features**:
  - Development mode: Full error details
  - Production mode: Sanitized errors without sensitive data
  - No exposure of:
    - File paths
    - User IDs
    - Database errors
    - Stack traces

## 🔒 Security Best Practices

### Database Queries

1. **Always use parameterized queries**
2. **Never concatenate user input into SQL**
3. **Validate and sanitize all inputs**
4. **Use whitelist validation for column names**
5. **Limit query results to prevent DOS**

### Authentication

1. **Use strong JWT secrets** (minimum 32 characters)
2. **Set reasonable token expiration** (currently 24 hours)
3. **Implement logout functionality** (token blacklist)
4. **Rate limit authentication endpoints**
5. **Track failed login attempts**

### Input Validation

1. **Validate on both client and server**
2. **Use type-safe validation functions**
3. **Set maximum input lengths**
4. **Whitelist allowed characters**
5. **Detect SQL injection patterns**

### Error Handling

1. **Never expose internal errors to clients**
2. **Log detailed errors server-side only**
3. **Return generic error messages**
4. **Don't reveal system information**

## 🚀 Testing Authentication

### Login Flow

```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Response includes token
{"success":true,"data":{"token":"...","user":{...}}}

# 2. Access protected route
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 3. Logout
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 4. Try to use same token (should fail)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
# Response: {"success":false,"error":"Token has been invalidated"}
```

### Testing Rate Limiting

```bash
# Try multiple login attempts with wrong password
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"wrong"}'
  echo "\nAttempt $i"
done

# After 5 attempts, you should get:
# {"success":false,"error":"Too many login attempts. Please try again in 15 minutes."}
```

## 🔧 Environment Variables

### Required Security Settings

```env
# JWT Secret - MUST be strong (32+ characters)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173

# Rate limiting (optional, has defaults)
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=300
AUTH_RATE_LIMIT_MAX_REQUESTS=20

# Node environment
NODE_ENV=production  # or 'development'
```

## ⚠️ Production Deployment Checklist

- [ ] Set strong `JWT_SECRET` (32+ random characters)
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper `FRONTEND_URL`
- [ ] Enable HTTPS/TLS
- [ ] Set up Redis for token blacklist (for multi-server setups)
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerting
- [ ] Enable database connection pooling
- [ ] Configure proper CORS origins
- [ ] Review and adjust rate limits
- [ ] Set up log aggregation
- [ ] Enable database backups
- [ ] Configure fail2ban or similar
- [ ] Set up SSL/TLS certificates
- [ ] Review and update CSP headers

## 📊 Security Monitoring

### What to Monitor

1. **Failed login attempts** - Track patterns
2. **Rate limit hits** - Identify potential attacks
3. **Token blacklist size** - Monitor memory usage
4. **Authentication errors** - Detect issues
5. **SQL query errors** - Catch injection attempts

### Logging

- All authentication events are logged
- Failed logins are tracked separately
- Production logs hide sensitive data
- Development logs include full details

## 🔐 Password Security

### Current Implementation

- **Hashing**: bcrypt with automatic salting
- **Minimum length**: 8 characters
- **Requirements**: At least one letter AND one number
- **Storage**: Never stored in plain text
- **Comparison**: Constant-time comparison via bcrypt

### Recommendations for Users

- Use unique passwords
- Enable 2FA (if implemented)
- Change passwords periodically
- Don't reuse passwords

## 🛠️ Future Security Enhancements

Consider implementing:

1. **Two-Factor Authentication (2FA)**
2. **Redis-based token blacklist** for horizontal scaling
3. **Content Security Policy (CSP) reporting**
4. **CAPTCHA for login** after failed attempts
5. **Password history** to prevent reuse
6. **Account lockout** after multiple failed attempts
7. **Security audit logging**
8. **Penetration testing**
9. **Automated security scanning**
10. **Database encryption at rest**

## 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)
