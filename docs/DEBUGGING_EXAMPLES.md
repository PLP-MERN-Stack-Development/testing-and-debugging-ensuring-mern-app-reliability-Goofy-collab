# Debugging Techniques & Examples

## 🐛 Overview

This document demonstrates the debugging techniques and tools implemented in the MERN Testing Application.

## 1. Server-Side Debugging

### Example 1: Error Handling with Custom Error Classes

**File**: `server/src/middleware/errorHandler.js`

```javascript
// Custom error class for operational errors
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

// Usage in controller:
throw new AppError('Post not found', 404);
```

**Benefits**:
- Clear error messages
- Proper HTTP status codes
- Stack trace preservation
- Distinguishes operational vs programming errors

### Example 2: Request Logging

**File**: `server/src/utils/logger.js`

```javascript
// Automatically logs every request
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  });
  
  next();
};
```

**Log Output Example**:
```json
{
  "level": "info",
  "message": "API Request",
  "method": "GET",
  "url": "/api/posts",
  "status": 200,
  "duration": "45ms",
  "timestamp": "2025-11-16T10:30:00.000Z"
}
```

### Example 3: Mongoose Error Handling

**File**: `server/src/middleware/errorHandler.js`

```javascript
// Handle different Mongoose errors
if (err.name === 'CastError') {
  error = new AppError('Resource not found', 404);
}

if (err.code === 11000) {
  const field = Object.keys(err.keyValue)[0];
  error = new AppError(`${field} already exists`, 400);
}

if (err.name === 'ValidationError') {
  const messages = Object.values(err.errors).map((e) => e.message);
  error = new AppError(`Validation failed: ${messages.join(', ')}`, 400);
}
```

**Real Debugging Scenario**:
```
Error: E11000 duplicate key error
→ Converted to: { error: "email already exists", status: 400 }
```

### Example 4: Performance Monitoring

**File**: `server/src/middleware/performanceMonitor.js`

```javascript
// Log slow API requests
if (duration > 1000) {
  logger.warn({
    message: 'Slow request detected',
    method: req.method,
    url: req.originalUrl,
    duration: `${duration}ms`,
  });
}
```

**Alert Example**:
```
⚠️  Slow request: GET /api/posts took 1234ms
→ Investigate: Database query optimization needed
```

## 2. Client-Side Debugging

### Example 1: React Error Boundary

**File**: `client/src/components/ErrorBoundary.jsx`

```javascript
componentDidCatch(error, errorInfo) {
  // Log to console in development
  console.error('ErrorBoundary caught:', error, errorInfo);
  
  // In production, send to error tracking service
  if (import.meta.env.PROD) {
    // Sentry.captureException(error);
  }
}
```

**What It Catches**:
```javascript
// Component throws error
const BrokenComponent = () => {
  throw new Error('Component crashed!');
};

// ErrorBoundary catches it and shows:
// "Oops! Something went wrong"
// Instead of white screen of death
```

### Example 2: API Error Interceptor

**File**: `client/src/utils/api.js`

```javascript
// Intercept all API errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('Auth error:', error.response.data);
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 404:
          console.error('Not found:', error.response.data);
          break;
      }
    }
    return Promise.reject(error);
  }
);
```

**Debugging Output**:
```
API Error: {
  status: 401,
  message: "Invalid token",
  url: "/api/posts"
}
→ Action: Redirect to login
```

### Example 3: Performance Tracking

**File**: `client/src/utils/performanceMonitor.js`

```javascript
// Track component render time
export const measurePerformance = (metricName, callback) => {
  const start = performance.now();
  const result = callback();
  const end = performance.now();
  const duration = end - start;
  
  if (duration > 100) {
    console.warn(`⚠️  ${metricName} took ${duration.toFixed(2)}ms`);
  }
  
  return result;
};
```

**Usage Example**:
```javascript
useEffect(() => {
  measurePerformance('Data Processing', () => {
    // Expensive operation
    processLargeDataset(data);
  });
}, [data]);

// Output: ⚠️  Data Processing took 234.56ms
```

### Example 4: API Call Monitoring

**File**: `client/src/utils/performanceMonitor.js`

```javascript
export const measureAPICall = async (apiName, apiCall) => {
  const start = performance.now();
  try {
    const result = await apiCall();
    const duration = performance.now() - start;
    
    console.log(`✓ ${apiName}: ${duration.toFixed(2)}ms`);
    
    if (duration > 2000) {
      console.warn(`⚠️  Slow API: ${apiName} took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`✗ ${apiName} failed after ${duration.toFixed(2)}ms`);
    throw error;
  }
};
```

**Console Output**:
```
✓ Fetch Posts: 123.45ms
⚠️  Slow API: Upload Image took 3456.78ms
✗ Create Post failed after 567.89ms: Error: Network timeout
```

## 3. Testing as Debugging

### Example 1: Test-Driven Debugging

**Scenario**: Bug report - "Posts not sorting correctly"

**Step 1**: Write a failing test
```javascript
it('should sort posts by creation date descending', async () => {
  // Create posts with delays
  await Post.create({ title: 'First Post', ... });
  await new Promise(resolve => setTimeout(resolve, 100));
  await Post.create({ title: 'Second Post', ... });
  
  const res = await request(app).get('/api/posts?sort=-createdAt');
  
  expect(res.body[0].title).toBe('Second Post');
  // Test fails ❌
});
```

**Step 2**: Fix the code
```javascript
// In controller, add sort parameter
const posts = await Post.find(query).sort(sort);
```

**Step 3**: Test passes ✅

### Example 2: Debugging with Mock Data

```javascript
// Test with mock to isolate issue
it('should handle API errors', async () => {
  api.get.mockRejectedValue(new Error('Network error'));
  
  render(<PostsList />);
  
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
  
  // Found bug: Error not displayed to user
  // Fix: Add error state and display logic
});
```

## 4. Development Tools

### Browser DevTools Usage

**Console Logging Strategy**:
```javascript
// Development only
if (import.meta.env.DEV) {
  console.log('API Request:', { method, url, data });
}

// Use console groups
console.group('User Authentication');
console.log('Token:', token);
console.log('User:', user);
console.groupEnd();
```

**Network Tab Inspection**:
```
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by XHR
4. Check:
   - Request headers (Authorization token?)
   - Response status (200, 401, 500?)
   - Response time (slow query?)
   - Payload (correct data?)
```

**React DevTools**:
```
1. Install React DevTools extension
2. Inspect component props
3. Check state updates
4. Profile component renders
```

## 5. Common Debugging Scenarios

### Scenario 1: "Tests pass but app doesn't work"

**Problem**: Environment mismatch

**Solution**:
```javascript
// Check environment variables
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Common issue: .env file not loaded
// Fix: Restart dev server after adding .env
```

### Scenario 2: "Can't debug async code"

**Problem**: Promises swallowing errors

**Solution**:
```javascript
// Bad
someAsyncFunction(); // Error silently fails

// Good
someAsyncFunction()
  .catch(err => console.error('Async error:', err));

// Better - in async function
try {
  await someAsyncFunction();
} catch (err) {
  console.error('Caught error:', err);
}
```

### Scenario 3: "Flaky tests"

**Problem**: Race conditions or shared state

**Solution**:
```javascript
// Bad - shared state between tests
let user;
beforeAll(() => {
  user = createUser(); // Reused across tests
});

// Good - isolated state
beforeEach(() => {
  user = createUser(); // Fresh for each test
});
```

### Scenario 4: "MongoDB connection issues in tests"

**Problem**: Real database vs test database

**Solution**:
```javascript
// Use MongoDB Memory Server for tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
```

## 6. Debugging Checklist

### When a test fails:
- [ ] Read the error message carefully
- [ ] Check the expected vs received values
- [ ] Verify test data setup
- [ ] Check for async/await issues
- [ ] Look for shared state between tests
- [ ] Run test in isolation: `npm test -- filename.test.js`

### When the app has a bug:
- [ ] Reproduce the bug consistently
- [ ] Check browser console for errors
- [ ] Check network tab for failed requests
- [ ] Check server logs
- [ ] Add console.log statements strategically
- [ ] Use debugger breakpoints
- [ ] Write a failing test that reproduces the bug

### For performance issues:
- [ ] Use performance.now() to measure time
- [ ] Check slow database queries
- [ ] Profile React component renders
- [ ] Check for memory leaks
- [ ] Optimize re-renders with React.memo
- [ ] Use proper keys in lists

## 7. Tools Reference

| Tool | Purpose | Command |
|------|---------|---------|
| Jest | Server testing | `npm test` |
| Vitest | Client testing | `npm run test:ui` |
| Chrome DevTools | Browser debugging | F12 |
| VS Code Debugger | IDE debugging | F5 |
| Postman | API testing | Manual testing |
| MongoDB Compass | Database inspection | GUI tool |

## 📚 Additional Resources

- [Chrome DevTools Guide](https://developer.chrome.com/docs/devtools/)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Winston Logger](https://github.com/winstonjs/winston)
- [Jest Debugging](https://jestjs.io/docs/troubleshooting)

---

**Note**: All code examples are from actual implementation in this project.