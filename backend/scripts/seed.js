const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Mood = require('../models/Mood');
const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const Post = require('../models/Post');
const Escalation = require('../models/Escalation');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindgarden', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Mood.deleteMany({}),
      Booking.deleteMany({}),
      Resource.deleteMany({}),
      Post.deleteMany({}),
      Escalation.deleteMany({})
    ]);

    console.log('🧹 Cleared existing data');

    // Create users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@mindgarden.com',
        password: 'password123',
        role: 'admin',
        consentGiven: true,
        consentDate: new Date(),
        isActive: true
      },
      {
        name: 'Dr. Sarah Johnson',
        email: 'counselor@mindgarden.com',
        password: 'password123',
        role: 'counselor',
        profile: {
          specialization: 'Anxiety and Depression',
          experience: 8,
          bio: 'Licensed therapist specializing in cognitive behavioral therapy for students.',
          availability: [
            { day: 'Monday', startTime: '09:00', endTime: '17:00' },
            { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
            { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
            { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
            { day: 'Friday', startTime: '09:00', endTime: '15:00' }
          ]
        },
        consentGiven: true,
        consentDate: new Date(),
        isActive: true
      },
      {
        name: 'Alex Chen',
        email: 'student@mindgarden.com',
        password: 'password123',
        role: 'student',
        profile: {
          age: 20,
          gender: 'other',
          university: 'Tech University',
          course: 'Computer Science',
          year: 2
        },
        garden: {
          level: 3,
          points: 250,
          streak: 7,
          lastActivity: new Date(),
          plants: [
            { type: 'seedling', level: 1, unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            { type: 'flower', level: 2, unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
          ],
          badges: [
            { name: 'First Steps', description: 'Logged first mood', earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), icon: '👣' },
            { name: 'Consistent Tracker', description: '7-day streak', earnedAt: new Date(), icon: '📅' }
          ]
        },
        consentGiven: true,
        consentDate: new Date(),
        isActive: true
      },
      {
        name: 'Maya Patel',
        email: 'maya@mindgarden.com',
        password: 'password123',
        role: 'student',
        profile: {
          age: 19,
          gender: 'female',
          university: 'State University',
          course: 'Psychology',
          year: 1
        },
        garden: {
          level: 2,
          points: 150,
          streak: 3,
          lastActivity: new Date(),
          plants: [
            { type: 'seedling', level: 1, unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }
          ],
          badges: [
            { name: 'First Steps', description: 'Logged first mood', earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), icon: '👣' }
          ]
        },
        consentGiven: true,
        consentDate: new Date(),
        isActive: true
      },
      {
        name: 'Jordan Smith',
        email: 'jordan@mindgarden.com',
        password: 'password123',
        role: 'student',
        profile: {
          age: 21,
          gender: 'male',
          university: 'Community College',
          course: 'Business Administration',
          year: 3
        },
        garden: {
          level: 1,
          points: 75,
          streak: 1,
          lastActivity: new Date(),
          plants: [],
          badges: []
        },
        consentGiven: true,
        consentDate: new Date(),
        isActive: true
      }
    ]);

    console.log('👥 Created users');

    const [admin, counselor, student1, student2, student3] = users;

    // Create mood entries
    const moods = [];
    const moodTypes = ['very_happy', 'happy', 'neutral', 'sad', 'anxious', 'stressed'];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      moods.push({
        userId: student1._id,
        mood: moodTypes[Math.floor(Math.random() * moodTypes.length)],
        intensity: Math.floor(Math.random() * 10) + 1,
        notes: i % 3 === 0 ? 'Feeling good about my progress in studies' : undefined,
        triggers: i % 4 === 0 ? ['Work/Studies', 'Sleep'] : [],
        activities: i % 3 === 0 ? ['Exercise', 'Music'] : [],
        sleepHours: 6 + Math.random() * 4,
        sentiment: {
          score: Math.random() * 2 - 1,
          magnitude: Math.random(),
          label: Math.random() > 0.5 ? 'positive' : 'negative'
        },
        createdAt: date,
        pointsAwarded: 5
      });
    }

    for (let i = 0; i < 15; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      moods.push({
        userId: student2._id,
        mood: moodTypes[Math.floor(Math.random() * moodTypes.length)],
        intensity: Math.floor(Math.random() * 10) + 1,
        notes: i % 4 === 0 ? 'Adjusting to college life' : undefined,
        triggers: i % 3 === 0 ? ['Relationships', 'Academic'] : [],
        activities: i % 2 === 0 ? ['Reading', 'Friends'] : [],
        sleepHours: 7 + Math.random() * 3,
        sentiment: {
          score: Math.random() * 2 - 1,
          magnitude: Math.random(),
          label: Math.random() > 0.4 ? 'positive' : 'negative'
        },
        createdAt: date,
        pointsAwarded: 5
      });
    }

    await Mood.create(moods);
    console.log('💭 Created mood entries');

    // Create bookings
    const bookings = await Booking.create([
      {
        student: student1._id,
        counselor: counselor._id,
        sessionDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        sessionTime: '14:00',
        type: 'individual',
        mode: 'online',
        status: 'approved',
        reason: 'Feeling overwhelmed with coursework and need strategies to manage stress',
        urgency: 'medium',
        notes: {
          student: 'Particularly struggling with time management',
          counselor: 'Will focus on CBT techniques for stress management'
        },
        meetingLink: 'https://meet.mindgarden.com/session-123'
      },
      {
        student: student2._id,
        counselor: counselor._id,
        sessionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        sessionTime: '10:00',
        type: 'individual',
        mode: 'online',
        status: 'pending',
        reason: 'Anxiety about upcoming exams and social situations at college',
        urgency: 'medium',
        notes: {
          student: 'First time seeking counseling, feeling nervous but hopeful'
        }
      },
      {
        student: student3._id,
        counselor: counselor._id,
        sessionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        sessionTime: '15:00',
        type: 'individual',
        mode: 'online',
        status: 'completed',
        reason: 'Depression symptoms and lack of motivation in studies',
        urgency: 'high',
        notes: {
          student: 'Having trouble getting out of bed and attending classes',
          counselor: 'Discussed behavioral activation techniques'
        },
        feedback: {
          rating: 5,
          comment: 'Dr. Johnson was very understanding and provided practical strategies',
          submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        }
      }
    ]);

    console.log('📅 Created bookings');

    // Create resources
    const resources = await Resource.create([
      {
        title: 'Managing Test Anxiety: A Student\'s Guide',
        description: 'Comprehensive strategies for dealing with exam stress and performance anxiety.',
        content: `# Managing Test Anxiety

Test anxiety is a common experience among students, but it doesn't have to control your academic performance. Here are proven strategies to help you manage anxiety before and during exams.

## Before the Test
- **Prepare thoroughly**: Good preparation is the best anxiety reducer
- **Practice relaxation techniques**: Deep breathing, progressive muscle relaxation
- **Get adequate sleep**: Aim for 7-9 hours the night before
- **Eat a healthy breakfast**: Fuel your brain properly

## During the Test
- **Read instructions carefully**: Take your time to understand what's being asked
- **Start with easier questions**: Build confidence before tackling difficult ones
- **Use breathing techniques**: If you feel overwhelmed, take slow, deep breaths
- **Stay positive**: Replace negative thoughts with encouraging self-talk

## Long-term Strategies
- **Develop good study habits**: Regular review is better than cramming
- **Practice mindfulness**: Regular meditation can reduce overall anxiety
- **Seek support**: Don't hesitate to reach out to counselors or tutors

Remember, some anxiety is normal and can even improve performance. The goal is to manage it, not eliminate it completely.`,
        type: 'article',
        category: 'academic',
        tags: ['anxiety', 'exams', 'stress', 'study tips'],
        author: 'Dr. Sarah Johnson',
        source: 'MindGarden Counseling Team',
        difficulty: 'beginner',
        duration: 10,
        createdBy: counselor._id,
        isFeatured: true,
        views: 156,
        likes: 23
      },
      {
        title: '5-Minute Breathing Exercise for Anxiety',
        description: 'A quick and effective breathing technique to calm anxiety and stress.',
        content: `# 5-Minute Breathing Exercise

This simple breathing exercise can help reduce anxiety and stress in just 5 minutes.

## The 4-7-8 Technique

1. **Inhale** through your nose for 4 counts
2. **Hold** your breath for 7 counts
3. **Exhale** through your mouth for 8 counts
4. **Repeat** 4-6 times

## Instructions
- Find a comfortable seated position
- Close your eyes or soften your gaze
- Place one hand on your chest, one on your belly
- Focus on making your belly rise more than your chest
- Don't worry if you feel lightheaded at first - this is normal

## When to Use
- Before exams or presentations
- When feeling overwhelmed
- Before sleep to calm your mind
- During study breaks

Practice this technique regularly, even when you're not anxious, to make it more effective when you need it most.`,
        type: 'article',
        category: 'mindfulness',
        tags: ['breathing', 'anxiety', 'mindfulness', 'quick relief'],
        author: 'MindGarden Team',
        difficulty: 'beginner',
        duration: 5,
        createdBy: admin._id,
        isFeatured: true,
        views: 89,
        likes: 34
      },
      {
        title: 'Building Healthy Relationships in College',
        description: 'Tips for forming meaningful connections and maintaining healthy boundaries.',
        content: `# Building Healthy Relationships in College

College is a time of significant social growth. Here's how to build meaningful relationships while maintaining your well-being.

## Making New Friends
- **Be yourself**: Authentic connections are stronger than superficial ones
- **Join activities**: Clubs, sports, and study groups are great places to meet like-minded people
- **Be open**: Say yes to social invitations, even if you feel nervous
- **Show interest**: Ask questions and listen actively to others

## Maintaining Boundaries
- **Know your limits**: It's okay to say no to social events when you need rest
- **Communicate clearly**: Express your needs and expectations honestly
- **Respect others' boundaries**: Just as you have limits, so do others
- **Quality over quantity**: A few close friends are better than many acquaintances

## Dealing with Conflict
- **Address issues early**: Don't let small problems grow into big ones
- **Use "I" statements**: Express how you feel without blaming others
- **Listen actively**: Try to understand the other person's perspective
- **Know when to walk away**: Some relationships aren't worth maintaining

## Red Flags to Watch For
- Constant criticism or put-downs
- Pressure to do things you're uncomfortable with
- Isolation from other friends or family
- Controlling behavior

Remember, healthy relationships should enhance your life, not drain your energy.`,
        type: 'article',
        category: 'relationships',
        tags: ['friendship', 'boundaries', 'communication', 'college life'],
        author: 'Dr. Sarah Johnson',
        difficulty: 'intermediate',
        duration: 15,
        createdBy: counselor._id,
        views: 67,
        likes: 18
      },
      {
        title: 'Crisis Resources and Emergency Contacts',
        description: 'Important resources for mental health emergencies and crisis situations.',
        content: `# Crisis Resources and Emergency Contacts

If you or someone you know is in immediate danger, please call emergency services right away.

## Immediate Help
- **Emergency Services**: 911
- **Suicide Prevention Lifeline**: 988
- **Crisis Text Line**: Text HOME to 741741
- **Online Crisis Chat**: suicidepreventionlifeline.org/chat

## Warning Signs of Crisis
- Thoughts of suicide or self-harm
- Feeling hopeless or trapped
- Extreme mood changes
- Increased use of alcohol or drugs
- Withdrawing from friends and activities
- Giving away prized possessions
- Talking about death or suicide

## How to Help Someone in Crisis
1. **Take it seriously**: Don't dismiss threats of suicide
2. **Listen without judgment**: Let them express their feelings
3. **Don't leave them alone**: Stay with them or ensure someone else can
4. **Remove means of harm**: Take away weapons, pills, or other dangerous items
5. **Get professional help**: Call crisis services or emergency responders
6. **Follow up**: Check in regularly after the crisis has passed

## Additional Resources
- **National Alliance on Mental Illness (NAMI)**: 1-800-950-NAMI
- **Crisis Text Line**: Text HOME to 741741
- **The Trevor Project** (LGBTQ+ youth): 1-866-488-7386
- **RAINN National Sexual Assault Hotline**: 1-800-656-HOPE

## Campus Resources
Most colleges have counseling centers available 24/7. Check your student portal or contact your resident advisor for campus-specific resources.

Remember: Seeking help is a sign of strength, not weakness.`,
        type: 'article',
        category: 'emergency',
        tags: ['crisis', 'emergency', 'suicide prevention', 'resources'],
        author: 'MindGarden Crisis Team',
        difficulty: 'beginner',
        createdBy: admin._id,
        isFeatured: true,
        views: 234,
        likes: 45
      }
    ]);

    console.log('📚 Created resources');

    // Create community posts
    const posts = await Post.create([
      {
        author: student1._id,
        title: 'Finally found a study routine that works!',
        content: `After struggling for months with procrastination and feeling overwhelmed, I finally found a study routine that's working for me. 

Here's what helped:
- Breaking study sessions into 25-minute chunks (Pomodoro technique)
- Setting up a dedicated study space away from my bed
- Using a physical planner instead of digital apps
- Rewarding myself with small treats after completing tasks

The biggest game-changer was actually scheduling breaks. I used to feel guilty about taking breaks, but now I realize they're essential for staying focused.

Anyone else have study tips that work for them?`,
        category: 'advice',
        tags: ['study tips', 'productivity', 'academic'],
        isAnonymous: false,
        status: 'active',
        likes: [{ userId: student2._id }, { userId: student3._id }],
        comments: [
          {
            author: student2._id,
            content: 'This is so helpful! I\'ve been struggling with the same issues. Definitely going to try the Pomodoro technique.',
            isAnonymous: false,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
          }
        ],
        views: 23,
        sentiment: { score: 0.8, label: 'positive' }
      },
      {
        author: student2._id,
        title: 'Dealing with homesickness in first year',
        content: `I'm a first-year student and I've been really struggling with homesickness. I miss my family, my pets, and even my old room. Some days I just want to pack up and go home.

I know this is normal, but it doesn't make it any easier. I've tried joining clubs and making friends, but I still feel this constant ache for home.

Has anyone else gone through this? How did you cope? I don't want to give up on college, but some days it feels so hard.`,
        category: 'support',
        tags: ['homesickness', 'first year', 'college adjustment'],
        isAnonymous: true,
        status: 'active',
        likes: [{ userId: student1._id }, { userId: student3._id }],
        comments: [
          {
            author: student1._id,
            content: 'I went through the exact same thing! It does get better, I promise. What helped me was creating a "home away from home" - decorating my dorm with familiar things and establishing new routines.',
            isAnonymous: true,
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
          },
          {
            author: student3._id,
            content: 'Homesickness is so real. I found that video calling family regularly (but not too much) helped. Also, exploring the local area and finding new favorite spots made me feel more connected to my new environment.',
            isAnonymous: true,
            createdAt: new Date(Date.now() - 30 * 60 * 1000)
          }
        ],
        views: 34,
        sentiment: { score: -0.3, label: 'negative' }
      },
      {
        author: student3._id,
        title: 'Small win: Attended all my classes this week!',
        content: `This might seem like nothing to most people, but I attended every single one of my classes this week! 

I've been struggling with depression and motivation, and there were weeks where I barely left my dorm room. But I've been working with a counselor and trying new strategies.

What helped:
- Setting out clothes the night before
- Having a friend text me each morning
- Treating myself to coffee after each class
- Reminding myself that showing up is 50% of success

I know it's just one week, but it feels like a huge victory. Sometimes the smallest steps are the biggest wins.

To anyone else struggling - you're not alone, and every small step counts. 💪`,
        category: 'celebration',
        tags: ['depression', 'motivation', 'small wins', 'mental health'],
        isAnonymous: true,
        status: 'active',
        likes: [{ userId: student1._id }, { userId: student2._id }],
        comments: [
          {
            author: student1._id,
            content: 'This is HUGE! Celebrating the small wins is so important. You should be proud of yourself! 🎉',
            isAnonymous: true,
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
          },
          {
            author: student2._id,
            content: 'Way to go! I love that you\'re treating yourself after each class. Those little rewards can make such a difference.',
            isAnonymous: true,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
          }
        ],
        views: 18,
        sentiment: { score: 0.9, label: 'positive' }
      }
    ]);

    console.log('💬 Created community posts');

    // Create sample escalation
    await Escalation.create([
      {
        userId: student3._id,
        type: 'mood',
        severity: 'medium',
        triggerData: {
          moodId: moods[0]._id,
          sentimentScore: -0.8,
          keywords: ['hopeless', 'worthless']
        },
        description: 'High negative sentiment detected in mood entry with concerning keywords',
        status: 'resolved',
        assignedTo: counselor._id,
        actions: [
          {
            type: 'contacted',
            description: 'Reached out to student via email',
            performedBy: counselor._id,
            performedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            notes: 'Student responded positively, scheduled counseling session'
          }
        ],
        resolution: {
          outcome: 'Student connected with counseling services',
          notes: 'Follow-up session scheduled, student showing improvement',
          resolvedBy: counselor._id,
          resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      }
    ]);

    console.log('🚨 Created escalation records');

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Demo Accounts Created:');
    console.log('👑 Admin: admin@mindgarden.com / password123');
    console.log('👩‍⚕️ Counselor: counselor@mindgarden.com / password123');
    console.log('🎓 Student: student@mindgarden.com / password123');
    console.log('🎓 Student 2: maya@mindgarden.com / password123');
    console.log('🎓 Student 3: jordan@mindgarden.com / password123');
    console.log('\n🌱 The MindGarden is ready to grow!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeding
seedDatabase();
