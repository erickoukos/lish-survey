const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedQuestions() {
  try {
    console.log('🌱 Seeding survey sections and questions...')

    // Create sections
    const sections = [
      {
        sectionKey: 'A',
        title: 'General Information',
        description: 'Basic demographic and department information',
        order: 1,
        isActive: true
      },
      {
        sectionKey: 'B',
        title: 'Awareness & Understanding',
        description: 'Policy awareness and understanding levels',
        order: 2,
        isActive: true
      },
      {
        sectionKey: 'C',
        title: 'Urgent Trainings',
        description: 'Immediate training needs and priorities',
        order: 3,
        isActive: true
      },
      {
        sectionKey: 'D',
        title: 'Finance & Wellness',
        description: 'Financial wellness and literacy needs',
        order: 4,
        isActive: true
      },
      {
        sectionKey: 'E',
        title: 'Culture & Wellness',
        description: 'Workplace culture and mental health needs',
        order: 5,
        isActive: true
      },
      {
        sectionKey: 'F',
        title: 'Digital Skills',
        description: 'Digital literacy and technology skills',
        order: 6,
        isActive: true
      },
      {
        sectionKey: 'G',
        title: 'Professional Development',
        description: 'Career development and soft skills needs',
        order: 7,
        isActive: true
      },
      {
        sectionKey: 'H',
        title: 'Observed Issues',
        description: 'Workplace issues and concerns',
        order: 8,
        isActive: true
      },
      {
        sectionKey: 'I',
        title: 'Training Methods',
        description: 'Preferred training delivery methods',
        order: 9,
        isActive: true
      },
      {
        sectionKey: 'J',
        title: 'Final Questions',
        description: 'Additional feedback and suggestions',
        order: 10,
        isActive: true
      }
    ]

    // Create sections
    for (const section of sections) {
      await prisma.surveySection.upsert({
        where: { sectionKey: section.sectionKey },
        update: section,
        create: section
      })
      console.log(`✅ Created section: ${section.title}`)
    }

    // Create sample questions for each section
    const questions = [
      // Section A - General Information
      {
        section: 'A',
        questionType: 'select',
        questionText: 'Which department do you work in?',
        questionNumber: 1,
        isRequired: true,
        options: [
          'Head of Department (HODs)',
          'Technical Team',
          'Data Annotation Team',
          'Digital Marketing Department',
          'HR & Administration Department',
          'Finance & Accounting Department',
          'Project Management Department',
          'Sanitation Department',
          'Security Department'
        ],
        isActive: true
      },

      // Section B - Awareness & Understanding
      {
        section: 'B',
        questionType: 'rating',
        questionText: 'How would you rate your understanding of the Anti-Social Behavior Policy?',
        questionNumber: 1,
        isRequired: true,
        validationRules: { min: 1, max: 5 },
        helpText: '1 = Not aware at all, 5 = Fully understand and can apply',
        isActive: true
      },
      {
        section: 'B',
        questionType: 'rating',
        questionText: 'How would you rate your understanding of the Anti-Discrimination Policy?',
        questionNumber: 2,
        isRequired: true,
        validationRules: { min: 1, max: 5 },
        helpText: '1 = Not aware at all, 5 = Fully understand and can apply',
        isActive: true
      },
      {
        section: 'B',
        questionType: 'rating',
        questionText: 'How would you rate your understanding of Sexual Harassment Prevention policies?',
        questionNumber: 3,
        isRequired: true,
        validationRules: { min: 1, max: 5 },
        helpText: '1 = Not aware at all, 5 = Fully understand and can apply',
        isActive: true
      },

      // Section C - Urgent Trainings
      {
        section: 'C',
        questionType: 'multiselect',
        questionText: 'Which of the following policies do you need urgent training on?',
        questionNumber: 1,
        isRequired: true,
        options: [
          'Anti-Social Behavior Policy',
          'Anti-Discrimination Policy',
          'Sexual Harassment Prevention',
          'Safeguarding Policy',
          'HR Policy Manual',
          'Code of Conduct',
          'Finance & Financial Wellness',
          'Work-Life Balance & Mental Health Awareness',
          'Digital Workplace & Skills',
          'Soft Skills'
        ],
        helpText: 'Select all that apply',
        isActive: true
      },

      // Section D - Finance & Wellness
      {
        section: 'D',
        questionType: 'multiselect',
        questionText: 'What financial wellness topics would you like training on?',
        questionNumber: 1,
        isRequired: false,
        options: [
          'Financial Literacy Basics – Saving, spending, and tracking money smartly',
          'Digital Finance Tools – Mobile banking, and expense tracking',
          'Investment & Savings Options – youth-friendly investment paths like SACCOs, money markets, and digital assets',
          'Debt Management – responsible use of loans, credit, and avoiding financial stress'
        ],
        helpText: 'Select all that apply',
        isActive: true
      },

      // Section E - Culture & Wellness
      {
        section: 'E',
        questionType: 'multiselect',
        questionText: 'What culture and wellness topics would you like training on?',
        questionNumber: 1,
        isRequired: false,
        options: [
          'Stress management strategies for high-paced digital environments',
          'Recognizing burnout and early warning signs',
          'Accessing mental health resources and support',
          'Avoiding digital fatigue and information overload (Healthy Tech Use)',
          'Self-awareness and emotional regulation',
          'Understanding others\' perspectives (empathy)',
          'Using emotional intelligence for leadership and teamwork',
          'Resilience & Adaptability Training',
          'Wellness & Lifestyle Management',
          'Diversity, Equity & Inclusion (DEI) Awareness'
        ],
        helpText: 'Select all that apply',
        isActive: true
      },

      // Section F - Digital Skills
      {
        section: 'F',
        questionType: 'multiselect',
        questionText: 'What digital skills training do you need?',
        questionNumber: 1,
        isRequired: false,
        options: [
          'Cybersecurity Awareness',
          'Responsible AI & Ethical Tech Use',
          'Data Privacy & Compliance'
        ],
        helpText: 'Select all that apply',
        isActive: true
      },

      // Section G - Professional Development
      {
        section: 'G',
        questionType: 'multiselect',
        questionText: 'What professional development training do you need?',
        questionNumber: 1,
        isRequired: false,
        options: [
          'Effective Communication',
          'Leadership Skills for Young Professionals',
          'Entrepreneurial Mindset & Intrapreneurship',
          'Personal Branding & Professional Networking',
          'Teamwork & Conflict Resolution',
          'Time Management & Productivity Tools'
        ],
        helpText: 'Select all that apply',
        isActive: true
      },

      // Section H - Observed Issues
      {
        section: 'H',
        questionType: 'multiselect',
        questionText: 'Have you observed any of the following issues in your workplace?',
        questionNumber: 1,
        isRequired: false,
        options: [
          'Anti-social behavior (e.g., verbal abuse, public disorder)',
          'Discrimination (e.g., gender, race, disability bias)',
          'Harassment (verbal, physical, sexual, cyber)',
          'Lack of safeguarding for vulnerable persons (Women, PWDs, Senior Citizens)',
          'None of the above'
        ],
        helpText: 'Select all that apply',
        isActive: true
      },

      // Section I - Training Methods
      {
        section: 'I',
        questionType: 'select',
        questionText: 'What is your preferred method for receiving training?',
        questionNumber: 1,
        isRequired: true,
        options: [
          'In-person training sessions',
          'Self-paced e-learning modules',
          'Shared Policy handbooks'
        ],
        isActive: true
      },
      {
        section: 'I',
        questionType: 'select',
        questionText: 'How often would you like refresher training?',
        questionNumber: 2,
        isRequired: true,
        options: [
          '1 training /Week',
          '1 training /Monthly',
          '2 trainings /Month'
        ],
        isActive: true
      },

      // Section J - Final Questions
      {
        section: 'J',
        questionType: 'text',
        questionText: 'What challenges do you face in understanding or applying workplace policies?',
        questionNumber: 1,
        isRequired: false,
        placeholder: 'Please describe any challenges you face...',
        helpText: 'This information will help us improve our training programs',
        isActive: true
      },
      {
        section: 'J',
        questionType: 'text',
        questionText: 'Do you have any suggestions for improving policy compliance in our organization?',
        questionNumber: 2,
        isRequired: false,
        placeholder: 'Please share your suggestions...',
        helpText: 'Your feedback is valuable for improving our workplace',
        isActive: true
      },
      {
        section: 'J',
        questionType: 'text',
        questionText: 'Any additional comments or feedback?',
        questionNumber: 3,
        isRequired: false,
        placeholder: 'Please share any additional thoughts...',
        isActive: true
      }
    ]

    // Create questions
    for (const question of questions) {
      await prisma.surveyQuestion.upsert({
        where: {
          section_questionNumber: {
            section: question.section,
            questionNumber: question.questionNumber
          }
        },
        update: {
          ...question,
          options: question.options ? JSON.stringify(question.options) : null,
          validationRules: question.validationRules ? JSON.stringify(question.validationRules) : null
        },
        create: {
          ...question,
          options: question.options ? JSON.stringify(question.options) : null,
          validationRules: question.validationRules ? JSON.stringify(question.validationRules) : null
        }
      })
      console.log(`✅ Created question: ${question.questionText.substring(0, 50)}...`)
    }

    console.log('🎉 Successfully seeded survey sections and questions!')
  } catch (error) {
    console.error('❌ Error seeding questions:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  seedQuestions()
    .then(() => {
      console.log('✅ Seeding completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error)
      process.exit(1)
    })
}

module.exports = { seedQuestions }
