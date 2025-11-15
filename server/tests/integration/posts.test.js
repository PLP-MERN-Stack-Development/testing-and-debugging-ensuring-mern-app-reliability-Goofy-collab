// posts.test.js - Integration tests for posts API endpoints

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const Post = require('../../src/models/Post');
const User = require('../../src/models/User');
const { generateToken } = require('../../src/utils/auth');

let mongoServer;
let token;
let userId;
let postId;

// Setup in-memory MongoDB server before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create a test user
  const user = await User.create({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
  });
  userId = user._id;
  token = generateToken(user);
});

// Clean up after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Reset database before each test for isolation
beforeEach(async () => {
  // Clear all collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }

  // Recreate test user
  const user = await User.create({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
  });
  userId = user._id;
  token = generateToken(user);

  // Recreate test post
  const post = await Post.create({
    title: 'Test Post',
    content: 'This is a test post content',
    author: userId,
    category: mongoose.Types.ObjectId(),
    slug: 'test-post',
  });
  postId = post._id;
});

describe('POST /api/posts', () => {
  it('should create a new post when authenticated', async () => {
    const newPost = {
      title: 'New Test Post',
      content: 'This is a new test post content',
      category: mongoose.Types.ObjectId().toString(),
    };

    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send(newPost);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toBe(newPost.title);
    expect(res.body.content).toBe(newPost.content);
    expect(res.body.author).toBe(userId.toString());
  });

  it('should return 401 if not authenticated', async () => {
    const newPost = {
      title: 'Unauthorized Post',
      content: 'This should not be created',
      category: mongoose.Types.ObjectId().toString(),
    };

    const res = await request(app)
      .post('/api/posts')
      .send(newPost);

    expect(res.status).toBe(401);
  });

  it('should return 400 if validation fails', async () => {
    const invalidPost = {
      // Missing title
      content: 'This post is missing a title',
      category: mongoose.Types.ObjectId().toString(),
    };

    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send(invalidPost);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should auto-generate slug from title', async () => {
    const newPost = {
      title: 'My Awesome Blog Post',
      content: 'Content here',
      category: mongoose.Types.ObjectId().toString(),
    };

    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send(newPost);

    expect(res.status).toBe(201);
    expect(res.body.slug).toBe('my-awesome-blog-post');
  });
});

describe('GET /api/posts', () => {
  it('should return all posts', async () => {
    const res = await request(app).get('/api/posts');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should filter posts by category', async () => {
    const categoryId = mongoose.Types.ObjectId();
    
    // Create posts with different categories
    await Post.create({
      title: 'Filtered Post',
      content: 'This post should be filtered by category',
      author: userId,
      category: categoryId,
      slug: 'filtered-post',
    });

    await Post.create({
      title: 'Another Post',
      content: 'Different category',
      author: userId,
      category: mongoose.Types.ObjectId(),
      slug: 'another-post',
    });

    const res = await request(app)
      .get(`/api/posts?category=${categoryId}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBe(1);
    expect(res.body[0].category.toString()).toBe(categoryId.toString());
  });

  it('should paginate results', async () => {
    // Create multiple posts
    const posts = [];
    for (let i = 0; i < 15; i++) {
      posts.push({
        title: `Pagination Post ${i}`,
        content: `Content for pagination test ${i}`,
        author: userId,
        category: mongoose.Types.ObjectId(),
        slug: `pagination-post-${i}`,
      });
    }
    await Post.insertMany(posts);

    const page1 = await request(app)
      .get('/api/posts?page=1&limit=10');
    
    const page2 = await request(app)
      .get('/api/posts?page=2&limit=10');

    expect(page1.status).toBe(200);
    expect(page2.status).toBe(200);
    expect(page1.body.length).toBe(10);
    expect(page2.body.length).toBeGreaterThan(0);
    expect(page1.body[0]._id).not.toBe(page2.body[0]._id);
  });

  it('should sort posts by creation date descending', async () => {
    // Create posts with slight delays to ensure different timestamps
    await Post.create({
      title: 'First Post',
      content: 'Created first',
      author: userId,
      category: mongoose.Types.ObjectId(),
      slug: 'first-post',
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    await Post.create({
      title: 'Second Post',
      content: 'Created second',
      author: userId,
      category: mongoose.Types.ObjectId(),
      slug: 'second-post',
    });

    const res = await request(app).get('/api/posts?sort=-createdAt');

    expect(res.status).toBe(200);
    expect(res.body[0].title).toBe('Second Post');
  });
});

describe('GET /api/posts/:id', () => {
  it('should return a post by ID', async () => {
    const res = await request(app)
      .get(`/api/posts/${postId}`);

    expect(res.status).toBe(200);
    expect(res.body._id).toBe(postId.toString());
    expect(res.body.title).toBe('Test Post');
  });

  it('should return 404 for non-existent post', async () => {
    const nonExistentId = mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/posts/${nonExistentId}`);

    expect(res.status).toBe(404);
  });

  it('should return 400 for invalid post ID format', async () => {
    const res = await request(app)
      .get('/api/posts/invalid-id-format');

    expect(res.status).toBe(400);
  });

  it('should populate author information', async () => {
    const res = await request(app)
      .get(`/api/posts/${postId}`);

    expect(res.status).toBe(200);
    expect(res.body.author).toHaveProperty('username');
    expect(res.body.author.username).toBe('testuser');
  });
});

describe('PUT /api/posts/:id', () => {
  it('should update a post when authenticated as author', async () => {
    const updates = {
      title: 'Updated Test Post',
      content: 'This content has been updated',
    };

    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updates);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe(updates.title);
    expect(res.body.content).toBe(updates.content);
    
    // Verify in database
    const updatedPost = await Post.findById(postId);
    expect(updatedPost.title).toBe(updates.title);
  });

  it('should return 401 if not authenticated', async () => {
    const updates = {
      title: 'Unauthorized Update',
    };

    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .send(updates);

    expect(res.status).toBe(401);
  });

  it('should return 403 if not the author', async () => {
    // Create another user
    const anotherUser = await User.create({
      username: 'anotheruser',
      email: 'another@example.com',
      password: 'password123',
    });
    const anotherToken = generateToken(anotherUser);

    const updates = {
      title: 'Forbidden Update',
    };

    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${anotherToken}`)
      .send(updates);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 404 for non-existent post', async () => {
    const nonExistentId = mongoose.Types.ObjectId();
    const updates = {
      title: 'Update Non-Existent',
    };

    const res = await request(app)
      .put(`/api/posts/${nonExistentId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updates);

    expect(res.status).toBe(404);
  });

  it('should not allow updating the author field', async () => {
    const newAuthorId = mongoose.Types.ObjectId();
    const updates = {
      title: 'Valid Update',
      author: newAuthorId,
    };

    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updates);

    expect(res.status).toBe(200);
    // Author should remain unchanged
    expect(res.body.author).toBe(userId.toString());
  });
});

describe('DELETE /api/posts/:id', () => {
  it('should delete a post when authenticated as author', async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    
    // Verify post is deleted
    const deletedPost = await Post.findById(postId);
    expect(deletedPost).toBeNull();
  });

  it('should return 401 if not authenticated', async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`);

    expect(res.status).toBe(401);
  });

  it('should return 403 if not the author', async () => {
    // Create another user
    const anotherUser = await User.create({
      username: 'deleteuser',
      email: 'delete@example.com',
      password: 'password123',
    });
    const anotherToken = generateToken(anotherUser);

    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${anotherToken}`);

    expect(res.status).toBe(403);
  });

  it('should return 404 for non-existent post', async () => {
    const nonExistentId = mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/posts/${nonExistentId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe('GET /api/posts/slug/:slug', () => {
  it('should return a post by slug', async () => {
    const res = await request(app)
      .get('/api/posts/slug/test-post');

    expect(res.status).toBe(200);
    expect(res.body.slug).toBe('test-post');
    expect(res.body.title).toBe('Test Post');
  });

  it('should return 404 for non-existent slug', async () => {
    const res = await request(app)
      .get('/api/posts/slug/non-existent-slug');

    expect(res.status).toBe(404);
  });
});



// // posts.test.js - Integration tests for posts API endpoints

// const request = require('supertest');
// const mongoose = require('mongoose');
// const { MongoMemoryServer } = require('mongodb-memory-server');
// const app = require('../../src/app');
// const Post = require('../../src/models/Post');
// const User = require('../../src/models/User');
// const { generateToken } = require('../../src/utils/auth');

// let mongoServer;
// let token;
// let userId;
// let postId;

// // Setup in-memory MongoDB server before all tests
// beforeAll(async () => {
//   mongoServer = await MongoMemoryServer.create();
//   const mongoUri = mongoServer.getUri();
//   await mongoose.connect(mongoUri);

//   // Create a test user
//   const user = await User.create({
//     username: 'testuser',
//     email: 'test@example.com',
//     password: 'password123',
//   });
//   userId = user._id;
//   token = generateToken(user);

//   // Create a test post
//   const post = await Post.create({
//     title: 'Test Post',
//     content: 'This is a test post content',
//     author: userId,
//     category: mongoose.Types.ObjectId(),
//     slug: 'test-post',
//   });
//   postId = post._id;
// });

// // Clean up after all tests
// afterAll(async () => {
//   await mongoose.disconnect();
//   await mongoServer.stop();
// });

// // Clean up database between tests
// afterEach(async () => {
//   // Keep the test user and post, but clean up any other created data
//   const collections = mongoose.connection.collections;
//   for (const key in collections) {
//     const collection = collections[key];
//     if (collection.collectionName !== 'users' && collection.collectionName !== 'posts') {
//       await collection.deleteMany({});
//     }
//   }
// });

// describe('POST /api/posts', () => {
//   it('should create a new post when authenticated', async () => {
//     const newPost = {
//       title: 'New Test Post',
//       content: 'This is a new test post content',
//       category: mongoose.Types.ObjectId().toString(),
//     };

//     const res = await request(app)
//       .post('/api/posts')
//       .set('Authorization', `Bearer ${token}`)
//       .send(newPost);

//     expect(res.status).toBe(201);
//     expect(res.body).toHaveProperty('_id');
//     expect(res.body.title).toBe(newPost.title);
//     expect(res.body.content).toBe(newPost.content);
//     expect(res.body.author).toBe(userId.toString());
//   });

//   it('should return 401 if not authenticated', async () => {
//     const newPost = {
//       title: 'Unauthorized Post',
//       content: 'This should not be created',
//       category: mongoose.Types.ObjectId().toString(),
//     };

//     const res = await request(app)
//       .post('/api/posts')
//       .send(newPost);

//     expect(res.status).toBe(401);
//   });

//   it('should return 400 if validation fails', async () => {
//     const invalidPost = {
//       // Missing title
//       content: 'This post is missing a title',
//       category: mongoose.Types.ObjectId().toString(),
//     };

//     const res = await request(app)
//       .post('/api/posts')
//       .set('Authorization', `Bearer ${token}`)
//       .send(invalidPost);

//     expect(res.status).toBe(400);
//     expect(res.body).toHaveProperty('error');
//   });
// });

// describe('GET /api/posts', () => {
//   it('should return all posts', async () => {
//     const res = await request(app).get('/api/posts');

//     expect(res.status).toBe(200);
//     expect(Array.isArray(res.body)).toBeTruthy();
//     expect(res.body.length).toBeGreaterThan(0);
//   });

//   it('should filter posts by category', async () => {
//     const categoryId = mongoose.Types.ObjectId().toString();
    
//     // Create a post with specific category
//     await Post.create({
//       title: 'Filtered Post',
//       content: 'This post should be filtered by category',
//       author: userId,
//       category: categoryId,
//       slug: 'filtered-post',
//     });

//     const res = await request(app)
//       .get(`/api/posts?category=${categoryId}`);

//     expect(res.status).toBe(200);
//     expect(Array.isArray(res.body)).toBeTruthy();
//     expect(res.body.length).toBeGreaterThan(0);
//     expect(res.body[0].category).toBe(categoryId);
//   });

//   it('should paginate results', async () => {
//     // Create multiple posts
//     const posts = [];
//     for (let i = 0; i < 15; i++) {
//       posts.push({
//         title: `Pagination Post ${i}`,
//         content: `Content for pagination test ${i}`,
//         author: userId,
//         category: mongoose.Types.ObjectId(),
//         slug: `pagination-post-${i}`,
//       });
//     }
//     await Post.insertMany(posts);

//     const page1 = await request(app)
//       .get('/api/posts?page=1&limit=10');
    
//     const page2 = await request(app)
//       .get('/api/posts?page=2&limit=10');

//     expect(page1.status).toBe(200);
//     expect(page2.status).toBe(200);
//     expect(page1.body.length).toBe(10);
//     expect(page2.body.length).toBeGreaterThan(0);
//     expect(page1.body[0]._id).not.toBe(page2.body[0]._id);
//   });
// });

// describe('GET /api/posts/:id', () => {
//   it('should return a post by ID', async () => {
//     const res = await request(app)
//       .get(`/api/posts/${postId}`);

//     expect(res.status).toBe(200);
//     expect(res.body._id).toBe(postId.toString());
//     expect(res.body.title).toBe('Test Post');
//   });

//   it('should return 404 for non-existent post', async () => {
//     const nonExistentId = mongoose.Types.ObjectId();
//     const res = await request(app)
//       .get(`/api/posts/${nonExistentId}`);

//     expect(res.status).toBe(404);
//   });
// });

// describe('PUT /api/posts/:id', () => {
//   it('should update a post when authenticated as author', async () => {
//     const updates = {
//       title: 'Updated Test Post',
//       content: 'This content has been updated',
//     };

//     const res = await request(app)
//       .put(`/api/posts/${postId}`)
//       .set('Authorization', `Bearer ${token}`)
//       .send(updates);

//     expect(res.status).toBe(200);
//     expect(res.body.title).toBe(updates.title);
//     expect(res.body.content).toBe(updates.content);
//   });

//   it('should return 401 if not authenticated', async () => {
//     const updates = {
//       title: 'Unauthorized Update',
//     };

//     const res = await request(app)
//       .put(`/api/posts/${postId}`)
//       .send(updates);

//     expect(res.status).toBe(401);
//   });

//   it('should return 403 if not the author', async () => {
//     // Create another user
//     const anotherUser = await User.create({
//       username: 'anotheruser',
//       email: 'another@example.com',
//       password: 'password123',
//     });
//     const anotherToken = generateToken(anotherUser);

//     const updates = {
//       title: 'Forbidden Update',
//     };

//     const res = await request(app)
//       .put(`/api/posts/${postId}`)
//       .set('Authorization', `Bearer ${anotherToken}`)
//       .send(updates);

//     expect(res.status).toBe(403);
//   });
// });

// describe('DELETE /api/posts/:id', () => {
//   it('should delete a post when authenticated as author', async () => {
//     const res = await request(app)
//       .delete(`/api/posts/${postId}`)
//       .set('Authorization', `Bearer ${token}`);

//     expect(res.status).toBe(200);
    
//     // Verify post is deleted
//     const deletedPost = await Post.findById(postId);
//     expect(deletedPost).toBeNull();
//   });

//   it('should return 401 if not authenticated', async () => {
//     const res = await request(app)
//       .delete(`/api/posts/${postId}`);

//     expect(res.status).toBe(401);
//   });
// }); 