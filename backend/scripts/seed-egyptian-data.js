const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding with Egyptian real estate data...');

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await prisma.commission.deleteMany();
    await prisma.deal.deleteMany();
    await prisma.projectCategoryUnitType.deleteMany();
    await prisma.projectCategory.deleteMany();
    await prisma.unit.deleteMany();
    await prisma.project.deleteMany();
    await prisma.developer.deleteMany();
    await prisma.unitType.deleteMany();
    await prisma.category.deleteMany();
    await prisma.brokerUser.deleteMany();
    await prisma.adminUser.deleteMany();

    // Create Categories
    console.log('📁 Creating categories...');
    const categories = await Promise.all([
      prisma.category.create({
        data: {
          name: 'Residential Apartments',
          categoryType: 'PROPERTY_TYPE'
        }
      }),
      prisma.category.create({
        data: {
          name: 'Luxury Villas',
          categoryType: 'PROPERTY_TYPE'
        }
      }),
      prisma.category.create({
        data: {
          name: 'Townhouses',
          categoryType: 'PROPERTY_TYPE'
        }
      }),
      prisma.category.create({
        data: {
          name: 'Penthouses',
          categoryType: 'PROPERTY_TYPE'
        }
      }),
      prisma.category.create({
        data: {
          name: 'Commercial Units',
          categoryType: 'PROPERTY_TYPE'
        }
      }),
      prisma.category.create({
        data: {
          name: 'Coastal Properties',
          categoryType: 'PROPERTY_TYPE'
        }
      })
    ]);

    // Create Unit Types
    console.log('🏠 Creating unit types...');
    const unitTypes = await Promise.all([
      prisma.unitType.create({
        data: {
          name: 'Studio Apartment'
        }
      }),
      prisma.unitType.create({
        data: {
          name: '1-Bedroom Apartment'
        }
      }),
      prisma.unitType.create({
        data: {
          name: '2-Bedroom Apartment'
        }
      }),
      prisma.unitType.create({
        data: {
          name: '3-Bedroom Apartment'
        }
      }),
      prisma.unitType.create({
        data: {
          name: '4-Bedroom Villa'
        }
      }),
      prisma.unitType.create({
        data: {
          name: '5-Bedroom Villa'
        }
      }),
      prisma.unitType.create({
        data: {
          name: 'Duplex Townhouse'
        }
      }),
      prisma.unitType.create({
        data: {
          name: 'Retail Shop'
        }
      }),
      prisma.unitType.create({
        data: {
          name: 'Office Space'
        }
      }),
      prisma.unitType.create({
        data: {
          name: 'Penthouse'
        }
      })
    ]);

    // Create Developers
    console.log('🏗️ Creating Egyptian developers...');
    const developers = await Promise.all([
      prisma.developer.create({
        data: {
          name: 'Talaat Moustafa Group (TMG)',
          description: 'One of Egypt\'s largest and most impactful developers, TMG specializes in integrated communities and luxury hospitality.',
          email: 'info@tmg.com.eg',
          phone: '+20-2-2614-0077',
          headquarters: 'Nile City Towers, Corniche El Nil, Cairo, Egypt',
          website: 'https://www.tmg.com.eg',
          actualCommissionRate: 2.8,
          brokerCommissionRate: 2.3,
          communicatedCommission: 2.0
        }
      }),
      prisma.developer.create({
        data: {
          name: 'Emaar Misr',
          description: 'Egyptian subsidiary of global Emaar Properties, known for luxury and integrated urban developments.',
          email: 'info@emaarmisr.com',
          phone: '+20-2-2480-8000',
          headquarters: 'Emaar Square, Downtown Cairo, Egypt',
          website: 'https://www.emaarmisr.com',
          actualCommissionRate: 3.0,
          brokerCommissionRate: 2.5,
          communicatedCommission: 2.2
        }
      }),
      prisma.developer.create({
        data: {
          name: 'Palm Hills Developments',
          description: 'A leading developer of residential communities and coastal resorts since 2005.',
          email: 'info@palmhillsdevelopments.com',
          phone: '+20-2-3850-6666',
          headquarters: 'Smart Village, Building B116, Sheikh Zayed City, Egypt',
          website: 'https://www.palmhillsdevelopments.com',
          actualCommissionRate: 2.7,
          brokerCommissionRate: 2.2,
          communicatedCommission: 1.9
        }
      }),
      prisma.developer.create({
        data: {
          name: 'SODIC',
          description: 'Sixth of October Development & Investment Company. Renowned for upscale, innovative residential and mixed-use developments.',
          email: 'info@sodic.com',
          phone: '+20-2-3827-5000',
          headquarters: 'Polygon Business Park, Sheikh Zayed City, Egypt',
          website: 'https://www.sodic.com',
          actualCommissionRate: 2.9,
          brokerCommissionRate: 2.4,
          communicatedCommission: 2.1
        }
      }),
      prisma.developer.create({
        data: {
          name: 'Mountain View Developments',
          description: 'Known for distinctively stylish residential communities and innovative, often European-inspired, designs.',
          email: 'info@mountainview.com.eg',
          phone: '+20-2-3850-0100',
          headquarters: 'Arkan Plaza, Sheikh Zayed City, Egypt',
          website: 'https://www.mountainview.com.eg',
          actualCommissionRate: 3.1,
          brokerCommissionRate: 2.6,
          communicatedCommission: 2.3
        }
      })
    ]);

    // Create Projects for each developer
    console.log('🏢 Creating projects...');
    
    // TMG Projects
    const tmgProjects = await Promise.all([
      prisma.project.create({
        data: {
          name: 'Madinaty',
          description: 'A large-scale suburban city development with integrated facilities and amenities',
          location: 'New Cairo',
          address: 'Cairo-Suez Road, New Cairo, Egypt',
          projectType: 'RESIDENTIAL',
          status: 'UNDER_CONSTRUCTION',
          developerId: developers[0].id,
          totalUnits: 15000,
          priceRange: '1.2M - 8.5M EGP',
          actualCommissionRate: 2.8,
          brokerCommissionRate: 2.3,
          communicatedCommission: 2.0,
          launchDate: new Date('2022-01-15'),
          completionDate: new Date('2026-12-31')
        }
      }),
      prisma.project.create({
        data: {
          name: 'Al Rehab',
          description: 'One of Egypt\'s first integrated gated communities with comprehensive amenities',
          location: 'New Cairo',
          address: 'Ring Road, New Cairo, Egypt',
          projectType: 'RESIDENTIAL',
          status: 'UNDER_CONSTRUCTION',
          developerId: developers[0].id,
          totalUnits: 8500,
          priceRange: '950K - 6.2M EGP',
          actualCommissionRate: 2.7,
          brokerCommissionRate: 2.2,
          communicatedCommission: 1.9,
          launchDate: new Date('2021-06-01'),
          completionDate: new Date('2025-08-30')
        }
      }),
      prisma.project.create({
        data: {
          name: 'Celia',
          description: 'A high-end residential project in the evolving New Administrative Capital',
          location: 'New Administrative Capital',
          address: 'R3 District, New Administrative Capital, Egypt',
          projectType: 'RESIDENTIAL',
          status: 'UNDER_CONSTRUCTION',
          developerId: developers[0].id,
          totalUnits: 3200,
          priceRange: '1.8M - 12M EGP',
          actualCommissionRate: 3.2,
          brokerCommissionRate: 2.7,
          communicatedCommission: 2.4,
          launchDate: new Date('2023-03-01'),
          completionDate: new Date('2027-10-15')
        }
      })
    ]);

    // Emaar Misr Projects
    const emaarProjects = await Promise.all([
      prisma.project.create({
        data: {
          name: 'Marassi',
          description: 'A seaside resort destination with residences, a marina, and hotels',
          location: 'North Coast',
          address: 'Sidi Abdel Rahman Bay, North Coast, Egypt',
          projectType: 'VACATION_HOMES',
          status: 'UNDER_CONSTRUCTION',
          developerId: developers[1].id,
          totalUnits: 4500,
          priceRange: '2.2M - 15M EGP',
          actualCommissionRate: 3.5,
          brokerCommissionRate: 3.0,
          communicatedCommission: 2.7,
          launchDate: new Date('2022-04-01'),
          completionDate: new Date('2026-09-30')
        }
      }),
      prisma.project.create({
        data: {
          name: 'Uptown Cairo',
          description: 'A residential-commercial lifestyle community with panoramic city views',
          location: 'Mokattam Hills',
          address: 'Mokattam Hills, Cairo, Egypt',
          projectType: 'MIXED_USE',
          status: 'UNDER_CONSTRUCTION',
          developerId: developers[1].id,
          totalUnits: 2800,
          priceRange: '1.5M - 9.5M EGP',
          actualCommissionRate: 3.1,
          brokerCommissionRate: 2.6,
          communicatedCommission: 2.3,
          launchDate: new Date('2021-11-01'),
          completionDate: new Date('2025-12-31')
        }
      }),
      prisma.project.create({
        data: {
          name: 'Mivida',
          description: 'A green residential development with mixed-use facilities and extensive landscaping',
          location: 'New Cairo',
          address: 'New Cairo, Cairo Governorate, Egypt',
          projectType: 'MIXED_USE',
          status: 'UNDER_CONSTRUCTION',
          developerId: developers[1].id,
          totalUnits: 5200,
          priceRange: '1.35M - 7.8M EGP',
          actualCommissionRate: 2.9,
          brokerCommissionRate: 2.4,
          communicatedCommission: 2.1,
          launchDate: new Date('2020-08-15'),
          completionDate: new Date('2025-06-30')
        }
      })
    ]);

    // Palm Hills Projects
    const palmHillsProjects = await Promise.all([
      prisma.project.create({
        data: {
          name: 'Palm Hills October',
          description: 'Residential villas and apartments in a well-established community',
          location: '6th of October City',
          address: '6th of October City, Giza Governorate, Egypt',
          projectType: 'RESIDENTIAL',
          status: 'UNDER_CONSTRUCTION',
          developerId: developers[2].id,
          totalUnits: 6800,
          priceRange: '980K - 5.5M EGP',
          actualCommissionRate: 2.6,
          brokerCommissionRate: 2.1,
          communicatedCommission: 1.8,
          launchDate: new Date('2021-02-01'),
          completionDate: new Date('2025-11-30')
        }
      }),
      prisma.project.create({
        data: {
          name: 'Palm Hills Katameya',
          description: 'Luxury villas and townhouses in an exclusive gated community',
          location: 'New Cairo',
          address: 'Katameya Heights, New Cairo, Egypt',
          projectType: 'RESIDENTIAL',
          status: 'UNDER_CONSTRUCTION',
          developerId: developers[2].id,
          totalUnits: 1800,
          priceRange: '2.8M - 12.5M EGP',
          actualCommissionRate: 3.2,
          brokerCommissionRate: 2.7,
          communicatedCommission: 2.4,
          launchDate: new Date('2022-09-01'),
          completionDate: new Date('2026-07-31')
        }
      }),
      prisma.project.create({
        data: {
          name: 'Hacienda Bay',
          description: 'Prestigious coastal village with resort-style living and private beaches',
          location: 'North Coast',
          address: 'Km 124 Alexandria-Marsa Matrouh Road, North Coast, Egypt',
          projectType: 'VACATION_HOMES',
          status: 'UNDER_CONSTRUCTION',
          developerId: developers[2].id,
          totalUnits: 3500,
          priceRange: '2.5M - 18M EGP',
          actualCommissionRate: 3.8,
          brokerCommissionRate: 3.3,
          communicatedCommission: 3.0,
          launchDate: new Date('2023-01-15'),
          completionDate: new Date('2027-12-31')
        }
      })
    ]);

    // SODIC Projects
    const sodicProjects = await Promise.all([
      prisma.project.create({
        data: {
          name: 'Westown',
          description: 'A mixed-use community with residential and entertainment facilities',
          location: 'Sheikh Zayed City',
          address: 'Sheikh Zayed City, Giza Governorate, Egypt',
          projectType: 'MIXED_USE',
          status: 'UNDER_CONSTRUCTION',
          developerId: developers[3].id,
          totalUnits: 4200,
          priceRange: '1.45M - 8.2M EGP',
          actualCommissionRate: 2.9,
          brokerCommissionRate: 2.4,
          communicatedCommission: 2.1,
          launchDate: new Date('2021-07-01'),
          completionDate: new Date('2025-10-30')
        }
      }),
      prisma.project.create({
        data: {
          name: 'Eastown',
          description: 'Residential apartments complemented by retail and leisure spaces',
          location: 'New Cairo',
          address: 'New Cairo, Cairo Governorate, Egypt',
          projectType: 'MIXED_USE',
          status: 'UNDER_CONSTRUCTION',
          developerId: developers[3].id,
          totalUnits: 3800,
          priceRange: '1.28M - 6.8M EGP',
          actualCommissionRate: 2.8,
          brokerCommissionRate: 2.3,
          communicatedCommission: 2.0,
          launchDate: new Date('2020-12-01'),
          completionDate: new Date('2025-05-31')
        }
      }),
      prisma.project.create({
        data: {
          name: 'June',
          description: 'A coastal development characterized by modern lifestyle design',
          location: 'North Coast',
          address: 'North Coast, Matrouh Governorate, Egypt',
          projectType: 'VACATION_HOMES',
          status: 'UNDER_CONSTRUCTION',
          developerId: developers[3].id,
          totalUnits: 2100,
          priceRange: '3.2M - 16.5M EGP',
          actualCommissionRate: 3.6,
          brokerCommissionRate: 3.1,
          communicatedCommission: 2.8,
          launchDate: new Date('2023-05-01'),
          completionDate: new Date('2027-08-31')
        }
      })
    ]);

    // Mountain View Projects
    const mountainViewProjects = await Promise.all([
      prisma.project.create({
        data: {
          name: 'Mountain View iCity',
          description: 'Smart, integrated residential communities with modern technology',
          location: 'New Cairo & 6th of October',
          address: 'New Cairo & 6th of October City, Egypt',
          projectType: 'RESIDENTIAL',
          status: 'UNDER_CONSTRUCTION',
          developerId: developers[4].id,
          totalUnits: 7500,
          priceRange: '1.1M - 6.5M EGP',
          actualCommissionRate: 2.7,
          brokerCommissionRate: 2.2,
          communicatedCommission: 1.9,
          launchDate: new Date('2021-10-01'),
          completionDate: new Date('2026-03-31')
        }
      }),
      prisma.project.create({
        data: {
          name: 'Mountain View Hyde Park',
          description: 'A tranquil, luxurious compound with villas and apartments',
          location: 'New Cairo',
          address: 'New Cairo, Cairo Governorate, Egypt',
          projectType: 'RESIDENTIAL',
          status: 'UNDER_CONSTRUCTION',
          developerId: developers[4].id,
          totalUnits: 2900,
          priceRange: '1.85M - 11.2M EGP',
          actualCommissionRate: 3.3,
          brokerCommissionRate: 2.8,
          communicatedCommission: 2.5,
          launchDate: new Date('2022-12-01'),
          completionDate: new Date('2027-02-28')
        }
      }),
      prisma.project.create({
        data: {
          name: 'Ras El Hekma Village',
          description: 'Greek-inspired coastal village with private beaches and lagoons',
          location: 'North Coast',
          address: 'Ras El Hekma, North Coast, Egypt',
          projectType: 'VACATION_HOMES',
          status: 'UNDER_CONSTRUCTION',
          developerId: developers[4].id,
          totalUnits: 1600,
          priceRange: '4.2M - 22M EGP',
          actualCommissionRate: 4.2,
          brokerCommissionRate: 3.7,
          communicatedCommission: 3.4,
          launchDate: new Date('2023-06-15'),
          completionDate: new Date('2028-09-30')
        }
      })
    ]);

    // Combine all projects
    const allProjects = [
      ...tmgProjects,
      ...emaarProjects,
      ...palmHillsProjects,
      ...sodicProjects,
      ...mountainViewProjects
    ];

    // Create Project Categories and Unit Types relationships
    console.log('🔗 Creating project category and unit type relationships...');
    
    for (const project of allProjects) {
      // Determine which categories to assign based on project type
      let categoriesToAssign = [];
      
      if (project.name.includes('Marassi') || project.name.includes('Hacienda') || 
          project.name.includes('June') || project.name.includes('Ras El Hekma')) {
        // Coastal projects
        categoriesToAssign = [categories[0], categories[1], categories[5]]; // Residential, Villas, Coastal
      } else if (project.name.includes('Celia') || project.name.includes('Hyde Park') || 
                 project.name.includes('Katameya')) {
        // Luxury projects
        categoriesToAssign = [categories[0], categories[1], categories[3]]; // Residential, Villas, Penthouses
      } else if (project.name.includes('Westown') || project.name.includes('Eastown')) {
        // Mixed-use projects
        categoriesToAssign = [categories[0], categories[2], categories[4]]; // Residential, Townhouses, Commercial
      } else {
        // Standard residential projects
        categoriesToAssign = [categories[0], categories[1], categories[2]]; // Residential, Villas, Townhouses
      }

      for (const category of categoriesToAssign) {
        const projectCategory = await prisma.projectCategory.create({
          data: {
            projectId: project.id,
            categoryId: category.id,
            isEnabled: true,
            actualCommissionRate: category.actualCommissionRate || 2.5,
            brokerCommissionRate: category.brokerCommissionRate || 2.0,
            communicatedCommission: category.communicatedCommission || 1.8
          }
        });

        // Assign appropriate unit types for each category
        let unitTypesToAssign = [];
        
        if (category.name === 'Residential Apartments') {
          unitTypesToAssign = [unitTypes[0], unitTypes[1], unitTypes[2], unitTypes[3]]; // Studios to 3BR
        } else if (category.name === 'Luxury Villas') {
          unitTypesToAssign = [unitTypes[4], unitTypes[5], unitTypes[9]]; // 4BR, 5BR Villas, Penthouses
        } else if (category.name === 'Townhouses') {
          unitTypesToAssign = [unitTypes[6]]; // Duplex Townhouse
        } else if (category.name === 'Penthouses') {
          unitTypesToAssign = [unitTypes[9]]; // Penthouse
        } else if (category.name === 'Commercial Units') {
          unitTypesToAssign = [unitTypes[7], unitTypes[8]]; // Retail, Office
        } else if (category.name === 'Coastal Properties') {
          unitTypesToAssign = [unitTypes[1], unitTypes[2], unitTypes[4], unitTypes[5]]; // 1BR-3BR, Villas
        }

        for (const unitType of unitTypesToAssign) {
          // Calculate price based on project price range
          const basePrice = 1500000; // Base price in EGP
          const unitPrice = Math.round(basePrice * (Math.random() * 0.8 + 0.6)); // Vary price by ±40%

          await prisma.projectCategoryUnitType.create({
            data: {
              projectId: project.id,
              categoryId: category.id,
              unitTypeId: unitType.id,
              isEnabled: true,
              price: unitPrice,
              actualCommissionRate: unitType.actualCommissionRate || 2.5,
              brokerCommissionRate: unitType.brokerCommissionRate || 2.0,
              communicatedCommission: unitType.communicatedCommission || 1.8
            }
          });
        }
      }
    }

    // Create Egyptian broker users
    console.log('👥 Creating Egyptian broker users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const brokerUsers = await Promise.all([
      prisma.brokerUser.create({
        data: {
          email: 'ahmed.hassan@byit.com',
          password: hashedPassword,
          firstName: 'Ahmed',
          lastName: 'Hassan',
          role: 'LICENSED_BROKER',
          phone: '+20-10-1234-5678',
          kycStatus: 'APPROVED',
          licenseNumber: 'EGY-BR-2023-001',
          licenseExpiry: new Date('2025-12-31'),
          brokerageCompany: 'Byit Real Estate',
          experienceYears: 8
        }
      }),
      prisma.brokerUser.create({
        data: {
          email: 'fatma.ali@byit.com',
          password: hashedPassword,
          firstName: 'Fatma',
          lastName: 'Ali',
          role: 'LICENSED_BROKER',
          phone: '+20-11-2345-6789',
          kycStatus: 'APPROVED',
          licenseNumber: 'EGY-BR-2023-002',
          licenseExpiry: new Date('2025-12-31'),
          brokerageCompany: 'Byit Real Estate',
          experienceYears: 6
        }
      }),
      prisma.brokerUser.create({
        data: {
          email: 'mohamed.ibrahim@byit.com',
          password: hashedPassword,
          firstName: 'Mohamed',
          lastName: 'Ibrahim',
          role: 'TRAINEE_BROKER',
          phone: '+20-12-3456-7890',
          kycStatus: 'APPROVED',
          brokerageCompany: 'Byit Real Estate',
          experienceYears: 2
        }
      }),
      prisma.brokerUser.create({
        data: {
          email: 'yasmin.mahmoud@byit.com',
          password: hashedPassword,
          firstName: 'Yasmin',
          lastName: 'Mahmoud',
          role: 'TRAINEE_BROKER',
          phone: '+20-10-4567-8901',
          kycStatus: 'APPROVED',
          brokerageCompany: 'Byit Real Estate',
          experienceYears: 1
        }
      }),
      prisma.brokerUser.create({
        data: {
          email: 'omar.abdel@byit.com',
          password: hashedPassword,
          firstName: 'Omar',
          lastName: 'Abdel Rahman',
          role: 'LICENSED_BROKER',
          phone: '+20-11-5678-9012',
          kycStatus: 'APPROVED',
          licenseNumber: 'EGY-BR-2023-003',
          licenseExpiry: new Date('2025-12-31'),
          brokerageCompany: 'Byit Real Estate',
          experienceYears: 5
        }
      }),
      prisma.brokerUser.create({
        data: {
          email: 'nour.ahmed@byit.com',
          password: hashedPassword,
          firstName: 'Nour',
          lastName: 'Ahmed',
          role: 'TRAINEE_BROKER',
          phone: '+20-12-6789-0123',
          kycStatus: 'APPROVED',
          brokerageCompany: 'Byit Real Estate',
          experienceYears: 1
        }
      }),
      prisma.brokerUser.create({
        data: {
          email: 'karim.hassan@byit.com',
          password: hashedPassword,
          firstName: 'Karim',
          lastName: 'Hassan',
          role: 'LICENSED_BROKER',
          phone: '+20-10-7890-1234',
          kycStatus: 'APPROVED',
          licenseNumber: 'EGY-BR-2023-004',
          licenseExpiry: new Date('2025-12-31'),
          brokerageCompany: 'Byit Real Estate',
          experienceYears: 7
        }
      }),
      prisma.brokerUser.create({
        data: {
          email: 'sara.mohamed@byit.com',
          password: hashedPassword,
          firstName: 'Sara',
          lastName: 'Mohamed',
          role: 'TRAINEE_BROKER',
          phone: '+20-11-8901-2345',
          kycStatus: 'APPROVED',
          brokerageCompany: 'Byit Real Estate',
          experienceYears: 1
        }
      })
    ]);

    // Create admin user
    const adminUser = await prisma.adminUser.create({
      data: {
        email: 'admin@byit.com',
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Administrator',
        role: 'SUPER_ADMIN',
        phone: '+20-2-1234-5678'
      }
    });

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Created ${categories.length} categories`);
    console.log(`- Created ${unitTypes.length} unit types`);
    console.log(`- Created ${developers.length} developers`);
    console.log(`- Created ${allProjects.length} projects`);
    console.log(`- Created ${brokerUsers.length} broker users`);
    console.log(`- Created 1 admin user`);
    
    console.log('\n🔐 Login credentials:');
    console.log('Admin: admin@byit.com / password123');
    console.log('Ahmed Hassan (Sales Manager): ahmed.hassan@byit.com / password123');
    console.log('Fatma Ali (Team Leader): fatma.ali@byit.com / password123');
    console.log('Mohamed Ibrahim (Broker): mohamed.ibrahim@byit.com / password123');
    console.log('And more... All passwords are: password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
