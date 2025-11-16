# 🧪 Testing and Debugging MERN Applications

## 📊 Test Results Summary

### ✅ All Tests Passing

- **Client Tests**: 11/11 passing (82% coverage)
- **Server Tests**: 51/51 passing
- **Total**: **62 tests passing**

### 📈 Coverage Reports

| Component | Statements | Branches | Functions | Lines |
|-----------|-----------|----------|-----------|-------|
| **Client** | 82.35% | 65% | 75% | 82.35% |
| **Server** | Coverage available in `/server/coverage/` |

## 🎯 Assignment Completion

This project demonstrates comprehensive testing strategies for a MERN stack application:

✅ **Unit Testing** - Components and utility functions tested in isolation  
✅ **Integration Testing** - API endpoints tested with real database operations  
✅ **E2E Testing** - User workflows tested with Cypress  
✅ **Error Handling** - Custom error handlers and logging implemented  
✅ **Debugging Tools** - Performance monitoring and error boundaries  
✅ **70%+ Coverage** - Exceeds minimum requirements

## 📁 Project Structure

```
mern-testing/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Button.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   ├── tests/          # Client-side tests
│   │   │   ├── setup.js
│   │   │   └── unit/
│   │   │       ├── Button.test.jsx
│   │   │       └── ErrorBoundary.test.jsx
│   │   └── utils/
│   │       ├── api.js
│   │       └── performanceMonitor.js
│   └── cypress/            # E2E tests
│       └── e2e/
├── server/                 # Express.js backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   │   └── postsController.js
│   │   ├── models/         # Mongoose models
│   │   │   ├── User.js
│   │   │   └── Post.js
│   │   ├── routes/         # API routes
│   │   │   └── posts.js
│   │   ├── middleware/     # Custom middleware
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   └── performanceMonitor.js
│   │   └── utils/
│   │       ├── auth.js
│   │       ├── helpers.js
│   │       └── logger.js
│   ├── tests/              # Server-side tests
│   │   ├── unit/
│   │   │   └── utils.test.js
│   │   └── integration/
│   │       ├── app.test.js
│   │       ├── errorHandling.test.js
│   │       └── posts.test.js
│   └── logs/               # Application logs
└── docs/                   # Documentation
    ├── TESTING_STRATEGY.md
    ├── DEBUGGING_EXAMPLES.md
    └── screenshots/
```

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/PLP-MERN-Stack-Development/testing-and-debugging-ensuring-mern-app-reliability-Goofy-collab.git
cd testing-and-debugging-ensuring-mern-app-reliability-Goofy-collab

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Environment Variables

Create `.env` files:

**Server** (`server/.env`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mern-testing-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRE=7d
LOG_LEVEL=info
```

**Client** (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_NODE_ENV=development
```

## 🧪 Running Tests

### Client Tests

```bash
cd client

# Run tests in watch mode
npm test

# Run tests with coverage
npm run test:coverage

# Open Vitest UI
npm run test:ui

# Run Cypress E2E tests
npm run cypress:open
```

### Server Tests

```bash
cd server

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm test posts.test.js
```

### Run All Tests

```bash
# From project root
npm test
```

## 📊 Viewing Coverage Reports

### Client Coverage

```bash
cd client
npm run test:coverage
start coverage/index.html
```

### Server Coverage

```bash
cd server
npm run test:coverage
start coverage/index.html
```

## 🛠️ Development

### Start Development Servers

```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend
cd client
npm run dev
```

- Backend API: http://localhost:5000
- Frontend App: http://localhost:5173

## 📚 Documentation

- [Testing Strategy](./docs/TESTING_STRATEGY.md) - Comprehensive testing approach
- [Debugging Examples](./docs/DEBUGGING_EXAMPLES.md) - Debugging techniques and tools
- [Coverage Reports](./docs/screenshots/) - Test coverage screenshots

## 🧰 Technologies Used

### Frontend
- React 18
- Vite
- Vitest + React Testing Library
- Cypress
- Axios
- React Toastify

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Jest + Supertest
- MongoDB Memory Server
- Winston (logging)
- JWT (authentication)
- Bcrypt (password hashing)

### Testing Tools
- **Unit Testing**: Vitest, Jest
- **Integration Testing**: Supertest, MongoDB Memory Server
- **E2E Testing**: Cypress
- **Coverage**: Istanbul/c8

## 🎯 Testing Highlights

### Unit Tests
- ✅ Button component (8 tests)
- ✅ ErrorBoundary component (3 tests)
- ✅ Utility functions (25+ tests)
- ✅ Auth middleware (3 tests)

### Integration Tests
- ✅ Posts CRUD operations (24 tests)
- ✅ Authentication flows (6 tests)
- ✅ Error handling (3 tests)
- ✅ Pagination & filtering (4 tests)

### E2E Tests
- ✅ Post creation workflow
- ✅ Post editing workflow
- ✅ Post deletion workflow
- ✅ Authentication flows

## 🐛 Debugging Features

### Server-Side
- ✅ Winston logging to files
- ✅ Request/response logging
- ✅ Performance monitoring
- ✅ Global error handler
- ✅ Mongoose error handling
- ✅ JWT error handling

### Client-Side
- ✅ React Error Boundary
- ✅ Axios interceptors
- ✅ Performance monitoring
- ✅ API call logging
- ✅ Development mode logging

## 📸 Screenshots

See [docs/screenshots/](./docs/screenshots/) for:
- Client test results
- Server test results
- Coverage reports
- E2E test execution

## 📝 License

This project is for educational purposes as part of the MERN Stack Testing & Debugging assignment.

## 🙏 Acknowledgments

- Assignment provided by Full-Stack Web Development - MERN
- Testing frameworks: Jest, Vitest, Cypress
- MongoDB Memory Server for isolated testing

---

**Last Updated**: November 2025