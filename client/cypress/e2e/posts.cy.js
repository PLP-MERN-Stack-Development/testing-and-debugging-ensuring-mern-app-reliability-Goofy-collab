// client/cypress/e2e/posts.cy.js - End-to-end tests for post management

describe('Post Management Flow', () => {
  beforeEach(() => {
    // Reset database
    cy.task('db:seed');
    
    // Login before each test
    cy.visit('/login');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Wait for successful login and redirect
    cy.url().should('include', '/dashboard');
  });

  describe('Creating Posts', () => {
    it('should create a new post successfully', () => {
      // Navigate to create post page
      cy.visit('/posts/new');
      
      // Fill in the form
      cy.get('input[name="title"]').type('My First E2E Test Post');
      cy.get('textarea[name="content"]').type('This is the content of my test post. It has multiple sentences to make it more realistic.');
      cy.get('select[name="category"]').select('Technology');
      
      // Submit the form
      cy.get('button[type="submit"]').click();
      
      // Verify success
      cy.url().should('match', /\/posts\/[a-f0-9]{24}/);
      cy.contains('My First E2E Test Post').should('be.visible');
      cy.contains('This is the content').should('be.visible');
      
      // Verify toast notification
      cy.get('.toast-success').should('contain', 'Post created successfully');
    });

    it('should show validation errors for invalid input', () => {
      cy.visit('/posts/new');
      
      // Try to submit without filling required fields
      cy.get('button[type="submit"]').click();
      
      // Verify error messages
      cy.get('.error-message').should('contain', 'Title is required');
      cy.get('.error-message').should('contain', 'Content is required');
      
      // URL should not change
      cy.url().should('include', '/posts/new');
    });

    it('should generate slug automatically from title', () => {
      cy.visit('/posts/new');
      
      cy.get('input[name="title"]').type('Hello World! This is My Post');
      cy.get('textarea[name="content"]').type('Some content here');
      cy.get('select[name="category"]').select('General');
      
      // Slug field should auto-populate (if visible)
      cy.get('input[name="slug"]').should('have.value', 'hello-world-this-is-my-post');
    });

    it('should handle network errors gracefully', () => {
      // Intercept the API call and force an error
      cy.intercept('POST', '/api/posts', {
        statusCode: 500,
        body: { error: 'Internal server error' },
      }).as('createPost');
      
      cy.visit('/posts/new');
      cy.get('input[name="title"]').type('Test Post');
      cy.get('textarea[name="content"]').type('Test content');
      cy.get('select[name="category"]').select('General');
      cy.get('button[type="submit"]').click();
      
      cy.wait('@createPost');
      cy.get('.toast-error').should('contain', 'Failed to create post');
    });
  });

  describe('Viewing Posts', () => {
    it('should display all posts on the posts page', () => {
      cy.visit('/posts');
      
      // Should see at least one post
      cy.get('.post-card').should('have.length.at.least', 1);
      
      // Each post card should have required elements
      cy.get('.post-card').first().within(() => {
        cy.get('.post-title').should('exist');
        cy.get('.post-excerpt').should('exist');
        cy.get('.post-author').should('exist');
        cy.get('.post-date').should('exist');
      });
    });

    it('should navigate to post detail when clicking a post', () => {
      cy.visit('/posts');
      
      // Click on the first post
      cy.get('.post-card').first().click();
      
      // Should navigate to detail page
      cy.url().should('match', /\/posts\/[a-f0-9]{24}/);
      
      // Should display full post content
      cy.get('.post-detail').should('exist');
      cy.get('.post-content').should('be.visible');
    });

    it('should filter posts by category', () => {
      cy.visit('/posts');
      
      // Select a category filter
      cy.get('select[name="category-filter"]').select('Technology');
      
      // All visible posts should be in the Technology category
      cy.get('.post-card').each(($post) => {
        cy.wrap($post).find('.post-category').should('contain', 'Technology');
      });
    });

    it('should search posts by title', () => {
      cy.visit('/posts');
      
      const searchTerm = 'Test';
      cy.get('input[name="search"]').type(searchTerm);
      cy.get('button[type="submit"]').click();
      
      // Results should contain the search term
      cy.get('.post-card').each(($post) => {
        cy.wrap($post).find('.post-title').invoke('text').should('include', searchTerm);
      });
    });

    it('should paginate results', () => {
      cy.visit('/posts');
      
      // Should see pagination controls if there are enough posts
      cy.get('.pagination').should('exist');
      
      // Get first post ID
      cy.get('.post-card').first().invoke('attr', 'data-post-id').then((firstPageId) => {
        // Go to page 2
        cy.get('.pagination button').contains('2').click();
        
        // First post on page 2 should be different
        cy.get('.post-card').first().invoke('attr', 'data-post-id').should('not.equal', firstPageId);
      });
    });
  });

  describe('Editing Posts', () => {
    it('should edit own post successfully', () => {
      // Navigate to user's posts
      cy.visit('/dashboard/my-posts');
      
      // Click edit on first post
      cy.get('.post-card').first().find('button.edit-btn').click();
      
      // Should navigate to edit page
      cy.url().should('include', '/edit');
      
      // Update the post
      const newTitle = 'Updated Post Title';
      cy.get('input[name="title"]').clear().type(newTitle);
      cy.get('button[type="submit"]').click();
      
      // Verify update
      cy.get('.toast-success').should('contain', 'Post updated');
      cy.contains(newTitle).should('be.visible');
    });

    it('should not allow editing other users\' posts', () => {
      // Try to visit edit page for a post owned by another user
      cy.visit('/posts/507f1f77bcf86cd799439011/edit');
      
      // Should be redirected or see error
      cy.url().should('not.include', '/edit');
      cy.get('.toast-error').should('contain', 'You don\'t have permission');
    });
  });

  describe('Deleting Posts', () => {
    it('should delete own post with confirmation', () => {
      cy.visit('/dashboard/my-posts');
      
      // Count initial posts
      cy.get('.post-card').then(($cards) => {
        const initialCount = $cards.length;
        
        // Click delete on first post
        cy.get('.post-card').first().find('button.delete-btn').click();
        
        // Confirm deletion
        cy.get('.confirmation-modal').should('be.visible');
        cy.get('.confirmation-modal button').contains('Delete').click();
        
        // Verify post is deleted
        cy.get('.toast-success').should('contain', 'Post deleted');
        cy.get('.post-card').should('have.length', initialCount - 1);
      });
    });

    it('should cancel deletion if user clicks cancel', () => {
      cy.visit('/dashboard/my-posts');
      
      cy.get('.post-card').then(($cards) => {
        const initialCount = $cards.length;
        
        // Click delete
        cy.get('.post-card').first().find('button.delete-btn').click();
        
        // Cancel deletion
        cy.get('.confirmation-modal button').contains('Cancel').click();
        
        // Post count should remain the same
        cy.get('.post-card').should('have.length', initialCount);
      });
    });
  });

  describe('Authentication Integration', () => {
    it('should redirect to login when accessing protected routes', () => {
      // Logout first
      cy.get('button.logout-btn').click();
      
      // Try to access protected route
      cy.visit('/posts/new');
      
      // Should redirect to login
      cy.url().should('include', '/login');
    });

    it('should preserve redirect path after login', () => {
      cy.get('button.logout-btn').click();
      
      // Try to access posts page
      cy.visit('/posts/new');
      
      // Login
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      
      // Should redirect back to originally requested page
      cy.url().should('include', '/posts/new');
    });
  });

  describe('Responsive Design', () => {
    it('should work on mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.visit('/posts');
      
      // Mobile menu should be visible
      cy.get('.mobile-menu-toggle').should('be.visible');
      cy.get('.mobile-menu-toggle').click();
      
      // Navigation should appear
      cy.get('.mobile-nav').should('be.visible');
    });

    it('should work on tablet viewport', () => {
      cy.viewport('ipad-2');
      cy.visit('/posts');
      
      // Layout should adapt
      cy.get('.post-card').should('be.visible');
    });
  });

  describe('Performance', () => {
    it('should load posts page within acceptable time', () => {
      const startTime = Date.now();
      
      cy.visit('/posts').then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(3000); // Should load within 3 seconds
      });
    });

    it('should implement infinite scroll for better UX', () => {
      cy.visit('/posts');
      
      // Scroll to bottom
      cy.scrollTo('bottom');
      
      // More posts should load
      cy.wait(1000);
      cy.get('.post-card').should('have.length.at.least', 10);
    });
  });
});