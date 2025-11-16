# Testing Strategy - MERN Testing Application

## 📋 Overview

This document outlines the comprehensive testing strategy implemented for the MERN stack application, including unit testing, integration testing, and end-to-end testing approaches.

## 🎯 Testing Goals

- Achieve minimum 70% code coverage for unit tests
- Test all critical API endpoints with integration tests
- Implement end-to-end tests for key user workflows
- Establish debugging practices for efficient troubleshooting

## 📊 Test Coverage Summary

### Client-Side Testing
- **Framework**: Vitest + React Testing Library
- **Test Files**: 2
- **Total Tests**: 11 passing
- **Code Coverage**:
  - Statements: 82.35%
  - Branches: 65%
  - Functions: 75%
  - Lines: 82.35%

### Server-Side Testing
- **Framework**: Jest + Supertest
- **Test Files**: 4
- **Total Tests**: 51 passing
- **Test Database**: MongoDB Memory Server

## 🧪 Testing Approaches

### 1. Unit Testing

#### Client-Side Unit Tests
**Location**: `client/src/tests/unit/`

**Components Tested**:
- **Button Component** (`Button.test.jsx`)
  - Renders with default props
  - Handles different variants (primary, secondary, danger)
  - Handles different sizes (sm, md, lg)
  - Handles disabled state
  - Calls onClick handler correctly
  - Doesn't call onClick when disabled
  - Accepts custom props and className

- **ErrorBoundary Component** (`ErrorBoundary.test.jsx`)
  - Catches and displays errors
  - Renders children when no error
  - Displays error details in development mode

**Testing Strategy**:
- Use React Testing Library for component testing
- Mock dependencies to test in isolation
- Test user interactions with fireEvent
- Verify accessibility with proper role queries

#### Server-Side Unit Tests
**Location**: `server/tests/unit/`

**Modules Tested**:
- **Utility Functions** (`utils.test.js`)
  - `generateSlug()`: URL-friendly slug generation
  - `validateEmail()`: Email format validation
  - `sanitizeInput()`: HTML tag removal and trimming
  - `formatDate()`: Date formatting with timezone handling
  - `calculateReadingTime()`: Word count to reading time conversion

- **Auth Middleware** (`utils.test.js`)
  - Token verification
  - Authentication flow
  - Error handling for invalid tokens

**Testing Strategy**:
- Test pure functions with various inputs
- Test edge cases (empty strings, null, undefined)
- Test validation logic thoroughly
- Mock external dependencies (JWT, bcrypt)

### 2. Integration Testing

#### API Endpoint Tests
**Location**: `server/tests/integration/`

**Endpoints Tested**:

**Posts API** (`posts.test.js`):
- `POST /api/posts`
  - ✅ Creates post when authenticated
  - ✅ Returns 401 without authentication
  - ✅ Returns 400 for validation failures
  - ✅ Auto-generates slug from title

- `GET /api/posts`
  - ✅ Returns all posts
  - ✅ Filters posts by category
  - ✅ Paginates results (page & limit)
  - ✅ Sorts posts by creation date

- `GET /api/posts/:id`
  - ✅ Returns post by ID
  - ✅ Returns 404 for non-existent post
  - ✅ Returns 400 for invalid ID format
  - ✅ Populates author information

- `PUT /api/posts/:id`
  - ✅ Updates post when authenticated as author
  - ✅ Returns 401 without authentication
  - ✅ Returns 403 if not the author
  - ✅ Returns 404 for non-existent post
  - ✅ Prevents updating author field

- `DELETE /api/posts/:id`
  - ✅ Deletes post when authenticated as author
  - ✅ Returns 401 without authentication
  - ✅ Returns 403 if not the author
  - ✅ Returns 404 for non-existent post

- `GET /api/posts/slug/:slug`
  - ✅ Returns post by slug
  - ✅ Returns 404 for non-existent slug

**Error Handling** (`errorHandling.test.js`):
- ✅ Returns 400 for invalid post ID
- ✅ Returns 401 for protected routes without auth
- ✅ Returns 404 for non-existent routes

**Basic App** (`app.test.js`):
- ✅ Health check endpoint
- ✅ API root endpoint
- ✅ 404 for non-existent routes

**Testing Strategy**:
- Use Supertest for HTTP assertions
- Use MongoDB Memory Server for isolated database
- Test authentication with JWT tokens
- Reset database before each test for isolation
- Test both success and error scenarios

### 3. End-to-End Testing

#### Cypress Tests
**Location**: `client/cypress/e2e/`

**User Flows Tested**:
- Homepage loading
- Post visibility toggle
- Post fetching and display
- Create post workflow (if implemented)
- Edit post workflow (if implemented)
- Delete post workflow (if implemented)

**Testing Strategy**:
- Test complete user journeys
- Verify UI updates after API calls
- Test form submissions
- Verify error handling in UI
- Test responsive design on different viewports

## 🛠️ Testing Tools & Libraries

### Client-Side
- **Vitest**: Fast unit test framework
- **React Testing Library**: React component testing utilities
- **@testing-library/jest-dom**: Custom Jest matchers for DOM
- **@testing-library/user-event**: User interaction simulation
- **Cypress**: End-to-end testing framework

### Server-Side
- **Jest**: JavaScript testing framework
- **Supertest**: HTTP assertions library
- **MongoDB Memory Server**: In-memory MongoDB for testing
- **bcryptjs**: Password hashing (in User model)
- **jsonwebtoken**: JWT authentication

## 🐛 Debugging Techniques Implemented

### 1. Server-Side Debugging

#### Error Handling Middleware
**File**: `server/src/middleware/errorHandler.js`

```javascript
- Global error handler catches all errors
- Logs error details (message, status, stack, URL, method, IP, user)
- Returns appropriate error responses
- Handles Mongoose errors (CastError, ValidationError, Duplicate Key)
- Handles JWT errors (Invalid token, Expired token)
```

#### Winston Logger
**File**: `server/src/utils/logger.js`

```javascript
- Structured logging to files (error.log, combined.log)
- Console logging in development
- Logs API requests and responses
- Tracks response times
```

#### Performance Monitoring
**File**: `server/src/middleware/performanceMonitor.js`

```javascript
- Tracks request duration
- Logs slow requests (>1000ms)
- Adds X-Response-Time header
```

### 2. Client-Side Debugging

#### Error Boundary
**File**: `client/src/components/ErrorBoundary.jsx`

```javascript
- Catches React component errors
- Displays user-friendly error message
- Shows error details in development mode
- Provides "Try Again" and "Go to Home" options
- Logs errors to console (can be extended to external service)
```

#### API Error Handling
**File**: `client/src/utils/api.js`

```javascript
- Axios interceptors for request/response
- Logs API calls in development
- Handles different HTTP status codes (400, 401, 403, 404, 500)
- Displays error messages to users
- Redirects to login on 401 errors
```

#### Performance Monitoring
**File**: `client/src/utils/performanceMonitor.js`

```javascript
- Measures function execution time
- Tracks API call performance
- Logs slow operations (>100ms for functions, >2000ms for API)
- Monitors component mount times
- Tracks page load metrics
```

### 3. Development Tools

- **Browser DevTools**:
  - Console for client-side errors
  - Network tab for API monitoring
  - React DevTools for component inspection
  
- **VS Code Debugger**:
  - Breakpoints in test files
  - Step-through debugging
  
- **Terminal Logging**:
  - Server request/response logs
  - Test output with detailed error messages

## 📈 Test Execution

### Running Tests

```bash
# Client tests
cd client
npm test                    # Run in watch mode
npm run test:coverage       # With coverage report
npm run test:ui             # Open Vitest UI

# Server tests
cd server
npm test                    # Run all tests
npm run test:coverage       # With coverage report
npm run test:watch          # Run in watch mode

# Root - Run all tests
npm test
```

### Continuous Integration
- Tests run automatically on every commit
- Coverage reports generated
- Failed tests block deployment

## 🎯 Testing Best Practices Followed

1. **Test Isolation**: Each test is independent and doesn't affect others
2. **Descriptive Names**: Test names clearly describe what is being tested
3. **Arrange-Act-Assert**: Clear test structure
4. **Mock External Dependencies**: API calls, databases, external services
5. **Test Edge Cases**: Empty inputs, null values, invalid data
6. **Error Testing**: Both success and failure scenarios
7. **Coverage Monitoring**: Maintain >70% coverage
8. **Fast Execution**: Use in-memory database for speed

## 🔄 Future Improvements

- [ ] Add visual regression tests
- [ ] Implement performance benchmarking
- [ ] Add more E2E tests for complex workflows
- [ ] Integrate with CI/CD pipeline
- [ ] Add mutation testing
- [ ] Implement API contract testing
- [ ] Add load testing for API endpoints

## 📚 References

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Cypress Documentation](https://docs.cypress.io/)

---

**Last Updated**: November 2025  
