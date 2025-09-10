// MongoDB initialization script for Docker
db = db.getSiblingDB('mindgarden');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'role'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        },
        role: {
          enum: ['Student', 'Counselor', 'Admin']
        }
      }
    }
  }
});

db.createCollection('moods', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['user', 'mood', 'intensity'],
      properties: {
        mood: {
          enum: ['very_sad', 'sad', 'neutral', 'happy', 'very_happy']
        },
        intensity: {
          bsonType: 'number',
          minimum: 1,
          maximum: 10
        }
      }
    }
  }
});

// Create indexes for performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.moods.createIndex({ user: 1, createdAt: -1 });
db.moods.createIndex({ createdAt: -1 });
db.bookings.createIndex({ student: 1, createdAt: -1 });
db.bookings.createIndex({ counselor: 1, createdAt: -1 });
db.bookings.createIndex({ status: 1 });
db.resources.createIndex({ title: 'text', content: 'text', tags: 'text' });
db.resources.createIndex({ category: 1, isActive: 1 });
db.posts.createIndex({ createdAt: -1 });
db.posts.createIndex({ category: 1, isActive: 1 });
db.escalations.createIndex({ user: 1, createdAt: -1 });
db.escalations.createIndex({ status: 1, severity: 1 });

print('MongoDB initialization completed successfully!');
