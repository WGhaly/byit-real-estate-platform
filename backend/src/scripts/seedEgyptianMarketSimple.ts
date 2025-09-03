import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// Simplified Egyptian market seeding data
const adminUsers = [
  {
    email: 'admin@byit.com',
    password: 'Admin123!',
    firstName: 'Ahmed',
    lastName: 'Mohamed',
    role: 'SUPER_ADMIN' as const,
    phone: '+201234567890',
    department: 'System Administration'
  },
  {
    email: 'operations@byit.com',
    password: 'Ops123!',
    firstName: 'Fatima',
    lastName: 'Ahmed',
    role: 'OPERATIONS_MANAGER' as const,
    phone: '+201234567891',
    department: 'Operations'
  },
  {
    email: 'finance@byit.com',
    password: 'Finance123!',
    firstName: 'Mahmoud',
    lastName: 'Salem',
    role: 'FINANCE_MANAGER' as const,
    phone: '+201234567892',
    department: 'Finance'
  }
];

const egyptianDevelopers = [
  {
    name: 'New Administrative Capital Development Authority',
    description: 'Leading company in developing the New Administrative Capital',
    establishedYear: 2017,
    website: 'https://newcapital.gov.eg',
    email: 'info@newcapital.gov.eg',
    phone: '+201000000001',
    headquarters: 'New Administrative Capital',
    logo: '/logos/new-capital.png'
  },
  {
    name: 'Talaat Moustafa Group',
    description: 'Leading group in real estate and tourism development',
    establishedYear: 1954,
    website: 'https://tmg.com.eg',
    email: 'info@tmg.com.eg',
    phone: '+201000000002',
    headquarters: 'Cairo',
    logo: '/logos/tmg.png'
  },
  {
    name: 'Emaar Misr Development Company',
    description: 'Real estate development company specialized in premium projects',
    establishedYear: 2005,
    website: 'https://emaar.com.eg',
    email: 'info@emaar.com.eg',
    phone: '+201000000003',
    headquarters: 'New Cairo',
    logo: '/logos/emaar.png'
  },
  {
    name: 'Palm Hills Developments',
    description: 'Leading real estate developer in residential and commercial projects',
    establishedYear: 1997,
    website: 'https://palmhills.com',
    email: 'info@palmhills.com',
    phone: '+201000000004',
    headquarters: '6th of October',
    logo: '/logos/palm-hills.png'
  },
  {
    name: 'Arab Contractors Company',
    description: 'Leading company in contracting and real estate development',
    establishedYear: 1955,
    website: 'https://arabc.com.eg',
    email: 'info@arabc.com.eg',
    phone: '+201000000005',
    headquarters: 'Cairo',
    logo: '/logos/arab-contractors.png'
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting Egyptian market seeding...');

    // 1. Create admin users
    console.log('👤 Creating admin users...');
    for (const adminData of adminUsers) {
      const hashedPassword = await hash(adminData.password, 12);
      await prisma.adminUser.upsert({
        where: { email: adminData.email },
        update: {
          firstName: adminData.firstName,
          lastName: adminData.lastName,
          role: adminData.role,
          phone: adminData.phone,
          department: adminData.department
        },
        create: {
          email: adminData.email,
          password: hashedPassword,
          firstName: adminData.firstName,
          lastName: adminData.lastName,
          role: adminData.role,
          phone: adminData.phone,
          department: adminData.department,
          mustChangePassword: false
        }
      });
      console.log(`✅ Created/Updated admin: ${adminData.email}`);
    }

    // 2. Create developers
    console.log('🏢 Creating Egyptian developers...');
    const createdDevelopers = [];
    for (const developerData of egyptianDevelopers) {
      const developer = await prisma.developer.upsert({
        where: { name: developerData.name },
        update: {
          description: developerData.description,
          establishedYear: developerData.establishedYear,
          website: developerData.website,
          email: developerData.email,
          phone: developerData.phone,
          headquarters: developerData.headquarters,
          operatingCities: [developerData.headquarters],
          logo: developerData.logo,
          defaultCommissionRate: 2.5,
          bonusCommissionRate: 0.5
        },
        create: {
          name: developerData.name,
          description: developerData.description,
          establishedYear: developerData.establishedYear,
          website: developerData.website,
          email: developerData.email,
          phone: developerData.phone,
          headquarters: developerData.headquarters,
          operatingCities: [developerData.headquarters],
          logo: developerData.logo,
          defaultCommissionRate: 2.5,
          bonusCommissionRate: 0.5,
          salesContactName: 'Sales Manager',
          salesContactEmail: developerData.email,
          salesContactPhone: developerData.phone
        }
      });
      createdDevelopers.push(developer);
      console.log(`✅ Created/Updated developer: ${developer.name}`);
    }

    // 3. Create base categories and unit types
    console.log('🏗️ Creating base categories and unit types...');
    
    // Create categories (unit type categories)
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { name: 'Residential' },
        update: {},
        create: {
          name: 'Residential',
          categoryType: 'UNIT_TYPE',
        }
      }),
      prisma.category.upsert({
        where: { name: 'Commercial' },
        update: {},
        create: {
          name: 'Commercial',
          categoryType: 'UNIT_TYPE',
        }
      }),
      prisma.category.upsert({
        where: { name: 'Clinic' },
        update: {},
        create: {
          name: 'Clinic',
          categoryType: 'UNIT_TYPE',
        }
      })
    ]);

    // Create unit types for each category
    const unitTypes = await Promise.all([
      // Residential unit types
      prisma.unitType.upsert({
        where: { name: 'Studio' },
        update: {},
        create: {
          name: 'Studio',
        }
      }),
      prisma.unitType.upsert({
        where: { name: '1BR' },
        update: {},
        create: {
          name: '1BR',
        }
      }),
      prisma.unitType.upsert({
        where: { name: '2BR' },
        update: {},
        create: {
          name: '2BR',
        }
      }),
      prisma.unitType.upsert({
        where: { name: '3BR' },
        update: {},
        create: {
          name: '3BR',
        }
      }),
      prisma.unitType.upsert({
        where: { name: '4BR' },
        update: {},
        create: {
          name: '4BR',
        }
      }),
      prisma.unitType.upsert({
        where: { name: 'Duplex' },
        update: {},
        create: {
          name: 'Duplex',
        }
      }),
      prisma.unitType.upsert({
        where: { name: 'Villa' },
        update: {},
        create: {
          name: 'Villa',
        }
      }),
      prisma.unitType.upsert({
        where: { name: 'Townhouse' },
        update: {},
        create: {
          name: 'Townhouse',
        }
      }),
      prisma.unitType.upsert({
        where: { name: 'Penthouse' },
        update: {},
        create: {
          name: 'Penthouse',
        }
      }),
      // Commercial unit types
      prisma.unitType.upsert({
        where: { name: 'Office' },
        update: {},
        create: {
          name: 'Office',
        }
      }),
      prisma.unitType.upsert({
        where: { name: 'Shop' },
        update: {},
        create: {
          name: 'Shop',
        }
      }),
      prisma.unitType.upsert({
        where: { name: 'Warehouse' },
        update: {},
        create: {
          name: 'Warehouse',
        }
      }),
      // Clinic unit types
      prisma.unitType.upsert({
        where: { name: 'Medical Office' },
        update: {},
        create: {
          name: 'Medical Office',
        }
      }),
      prisma.unitType.upsert({
        where: { name: 'Dental Clinic' },
        update: {},
        create: {
          name: 'Dental Clinic',
        }
      }),
      prisma.unitType.upsert({
        where: { name: 'Surgery Center' },
        update: {},
        create: {
          name: 'Surgery Center',
        }
      })
    ]);

    console.log(`✅ Created ${categories.length} categories and ${unitTypes.length} unit types`);

    // 4. Create projects with categories and unit types
    console.log('🏗️ Creating projects...');
    const projectTypes = ['RESIDENTIAL', 'COMMERCIAL', 'MIXED_USE', 'VACATION_HOMES'];
    const statuses = ['PLANNING', 'UNDER_CONSTRUCTION', 'READY', 'DELIVERED'];
    const locations = ['New Administrative Capital', 'New Cairo', '6th of October', 'Sheikh Zayed', 'Fifth Settlement'];

    let projectCounter = 1;
    for (const developer of createdDevelopers) {
      // Create 4 projects per developer
      for (let j = 1; j <= 4; j++) {
        const project = await prisma.project.create({
          data: {
            name: `${developer.name.split(' ')[0] || 'Real Estate'} Project ${j}`,
            description: `Premium residential project in ${locations[Math.floor(Math.random() * locations.length)]}`,
            location: locations[Math.floor(Math.random() * locations.length)],
            developerId: developer.id,
            projectType: projectTypes[Math.floor(Math.random() * projectTypes.length)] as any,
            status: statuses[Math.floor(Math.random() * statuses.length)] as any,
            launchDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            completionDate: new Date(2026 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            totalUnits: 100 + Math.floor(Math.random() * 900),
            availableUnits: 50 + Math.floor(Math.random() * 450),
            priceRange: `${500000 + Math.floor(Math.random() * 2000000)} - ${2000000 + Math.floor(Math.random() * 8000000)} EGP`,
            paymentPlans: ['Cash', 'Installments', 'Extended Payment'],
            images: [`/images/projects/project-${projectCounter}-1.jpg`, `/images/projects/project-${projectCounter}-2.jpg`],
            amenities: ['Swimming Pool', 'Gym', 'Security', 'Parking', 'Gardens'],
            commissionRate: 2 + Math.floor(Math.random() * 3),
            bonusCommissionRate: 0.1 + Math.random() * 0.4
          }
        });

        // Add categories to project with commission inheritance
        for (const category of categories) {
          const baseCommission = Number(project.commissionRate || 3);
          const projectCategory = await prisma.projectCategory.create({
            data: {
              projectId: project.id,
              categoryId: category.id,
              actualCommissionRate: baseCommission + (Math.random() * 0.5 - 0.25), // Inherit + small variation
              brokerCommissionRate: 85, // 85% goes to broker
              platformMarginRate: 15, // 15% platform margin
            }
          });

          // Get unit types for this category based on category name
          let categoryUnitTypes: any[] = [];
          if (category.name === 'Residential') {
            categoryUnitTypes = unitTypes.filter(ut => ['Studio', '1BR', '2BR', '3BR', '4BR', 'Duplex', 'Villa', 'Townhouse', 'Penthouse'].includes(ut.name));
          } else if (category.name === 'Commercial') {
            categoryUnitTypes = unitTypes.filter(ut => ['Office', 'Shop', 'Warehouse'].includes(ut.name));
          } else if (category.name === 'Clinic') {
            categoryUnitTypes = unitTypes.filter(ut => ['Medical Office', 'Dental Clinic', 'Surgery Center'].includes(ut.name));
          }

          // Add unit types to project category with commission inheritance
          for (const unitType of categoryUnitTypes) {
            const categoryCommission = Number(projectCategory.actualCommissionRate || 3);
            await prisma.projectCategoryUnitType.create({
              data: {
                projectId: project.id,
                categoryId: category.id,
                unitTypeId: unitType.id,
                actualCommissionRate: categoryCommission + (Math.random() * 0.3 - 0.15), // Inherit + small variation
                brokerCommissionRate: 85, // 85% goes to broker
                platformMarginRate: 15, // 15% platform margin
              }
            });
          }
        }

        console.log(`✅ Created project ${projectCounter}/20 with categories and unit types`);
        projectCounter++;
      }
    }

    // 5. Create brokers
    console.log('👔 Creating brokers...');
    for (let i = 0; i < 10; i++) {
      const hashedPassword = await hash('Broker123!', 12);
      await prisma.brokerUser.create({
        data: {
          email: `broker${i + 1}@byit.com`,
          password: hashedPassword,
          firstName: `Broker${i + 1}`,
          lastName: 'Real Estate',
          phone: `+2010000010${i}`,
          role: Math.random() > 0.5 ? 'LICENSED_BROKER' : 'TRAINEE_BROKER',
          licenseNumber: `BR-${String(i + 1).padStart(4, '0')}`,
          kycStatus: 'APPROVED',
          experienceYears: Math.floor(Math.random() * 10) + 1,
          totalDeals: Math.floor(Math.random() * 50),
          totalCommissions: Math.floor(Math.random() * 500000),
          averageRating: 3 + Math.random() * 2 // 3-5 rating
        }
      });
      console.log(`✅ Created broker ${i + 1}/10`);
    }

    console.log('✅ Egyptian market seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding Egyptian market:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedDatabase();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
