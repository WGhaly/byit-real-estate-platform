import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AdminRole, ProjectType, ProjectStatus, CategoryType, KYCStatus, BrokerRole } from '@prisma/client';

const prisma = new PrismaClient();

// Egyptian Developers Data
const egyptianDevelopers = [
  {
    name: "Talaat Moustafa Group (TMG)",
    description: "Egypt's leading real estate development company with over 60 years of experience in creating integrated communities.",
    establishedYear: 1954,
    licenseNumber: "TMG-2024-001",
    website: "https://www.tmg.com.eg",
    email: "info@tmg.com.eg",
    phone: "+20 2 26140200",
    headquarters: "New Cairo, Egypt",
    operatingCities: ["Cairo", "New Administrative Capital", "Alexandria", "North Coast"],
    certifications: ["ISO 9001:2015", "ISO 14001:2015"],
    awards: ["Best Developer 2023", "Excellence Award 2022"],
    actualCommissionRate: 7.5,
    brokerCommissionRate: 5.0,
    platformMarginRate: 2.5,
    salesContactName: "Ahmed Mostafa",
    salesContactPhone: "+20 10 12345678",
    salesContactEmail: "sales@tmg.com.eg",
  },
  {
    name: "Emaar Misr",
    description: "The Egyptian arm of Emaar Properties, developing world-class communities in Egypt.",
    establishedYear: 2005,
    licenseNumber: "EMR-2024-002",
    website: "https://www.emaarmisr.com",
    email: "info@emaarmisr.com",
    phone: "+20 2 26180000",
    headquarters: "New Cairo, Egypt",
    operatingCities: ["Cairo", "New Administrative Capital", "Alexandria"],
    certifications: ["ISO 9001:2015"],
    awards: ["Best Mixed-Use Development 2023"],
    actualCommissionRate: 8.0,
    brokerCommissionRate: 5.5,
    platformMarginRate: 2.5,
    salesContactName: "Sarah Hassan",
    salesContactPhone: "+20 10 87654321",
    salesContactEmail: "sales@emaarmisr.com",
  },
  {
    name: "Sodic",
    description: "Leading real estate developer creating distinctive communities that inspire better living.",
    establishedYear: 1996,
    licenseNumber: "SDC-2024-003",
    website: "https://www.sodic.com",
    email: "info@sodic.com",
    phone: "+20 2 38617100",
    headquarters: "Sheikh Zayed, Egypt",
    operatingCities: ["Cairo", "West Cairo", "North Coast"],
    certifications: ["ISO 9001:2015", "LEED Certification"],
    awards: ["Sustainable Development Award 2023"],
    actualCommissionRate: 7.0,
    brokerCommissionRate: 4.8,
    platformMarginRate: 2.2,
    salesContactName: "Omar Farouk",
    salesContactPhone: "+20 12 34567890",
    salesContactEmail: "sales@sodic.com",
  },
  {
    name: "Palm Hills Developments",
    description: "Developing premium residential and commercial communities across Egypt.",
    establishedYear: 1997,
    licenseNumber: "PHD-2024-004",
    website: "https://www.palmhillsdevelopments.com",
    email: "info@palmhills.com",
    phone: "+20 2 35370500",
    headquarters: "6th of October City, Egypt",
    operatingCities: ["Cairo", "6th of October", "North Coast", "New Administrative Capital"],
    certifications: ["ISO 9001:2015"],
    actualCommissionRate: 6.5,
    brokerCommissionRate: 4.5,
    platformMarginRate: 2.0,
    salesContactName: "Nour Abdel Rahman",
    salesContactPhone: "+20 10 98765432",
    salesContactEmail: "sales@palmhills.com",
  },
  {
    name: "Hassan Allam Properties",
    description: "Part of Hassan Allam Group, developing modern urban communities.",
    establishedYear: 2017,
    licenseNumber: "HAP-2024-005",
    website: "https://www.hassanallamproperties.com",
    email: "info@hassanallamproperties.com",
    phone: "+20 2 25809999",
    headquarters: "New Cairo, Egypt",
    operatingCities: ["Cairo", "New Administrative Capital"],
    certifications: ["ISO 9001:2015"],
    actualCommissionRate: 7.8,
    brokerCommissionRate: 5.3,
    platformMarginRate: 2.5,
    salesContactName: "Mahmoud Ali",
    salesContactPhone: "+20 11 11111111",
    salesContactEmail: "sales@hassanallamproperties.com",
  }
];

// Egyptian Projects Data
const egyptianProjects = [
  {
    name: "Madinaty",
    description: "A fully integrated city spanning 8,000 acres in New Cairo, offering residential, commercial, and recreational facilities.",
    location: "New Cairo, Egypt",
    address: "Ring Road, New Cairo",
    coordinates: "30.0131,31.4767",
    projectType: ProjectType.RESIDENTIAL,
    totalUnits: 120000,
    availableUnits: 15000,
    soldUnits: 105000,
    priceRange: "1,500,000 - 15,000,000 EGP",
    paymentPlans: ["Cash", "5 Years Installment", "7 Years Installment"],
    status: ProjectStatus.UNDER_CONSTRUCTION,
    launchDate: new Date("2006-03-15"),
    completionDate: new Date("2025-12-31"),
    amenities: ["Golf Course", "Schools", "Hospitals", "Shopping Mall", "Sports Club"],
    actualCommissionRate: 7.5,
    brokerCommissionRate: 5.0,
    platformMarginRate: 2.5,
    salesContactName: "Ahmed Mostafa",
    salesContactPhone: "+20 10 12345678",
    salesContactEmail: "madinaty@tmg.com.eg",
  },
  {
    name: "Al Rehab City",
    description: "A premium residential compound in New Cairo offering luxury villas and apartments.",
    location: "New Cairo, Egypt",
    address: "90th Street, New Cairo",
    coordinates: "30.0627,31.4953",
    projectType: ProjectType.RESIDENTIAL,
    totalUnits: 15000,
    availableUnits: 2500,
    soldUnits: 12500,
    priceRange: "2,000,000 - 25,000,000 EGP",
    paymentPlans: ["Cash", "3 Years Installment", "5 Years Installment"],
    status: ProjectStatus.READY,
    launchDate: new Date("2000-01-01"),
    completionDate: new Date("2020-12-31"),
    amenities: ["Club House", "Swimming Pools", "Green Areas", "Security", "Commercial Area"],
    actualCommissionRate: 7.5,
    brokerCommissionRate: 5.0,
    platformMarginRate: 2.5,
    salesContactName: "Ahmed Mostafa",
    salesContactPhone: "+20 10 12345678",
    salesContactEmail: "alrehab@tmg.com.eg",
  },
  {
    name: "Uptown Cairo",
    description: "Emaar Misr's flagship project offering luxury apartments and penthouses with stunning views.",
    location: "Mukattam Hills, Cairo",
    address: "Mukattam Hills, Cairo",
    coordinates: "30.0103,31.3089",
    projectType: ProjectType.RESIDENTIAL,
    totalUnits: 5000,
    availableUnits: 800,
    soldUnits: 4200,
    priceRange: "3,000,000 - 50,000,000 EGP",
    paymentPlans: ["Cash", "5 Years Installment", "8 Years Installment"],
    status: ProjectStatus.UNDER_CONSTRUCTION,
    launchDate: new Date("2018-06-01"),
    completionDate: new Date("2026-06-30"),
    amenities: ["Infinity Pool", "Spa", "Gym", "Concierge Service", "Private Gardens"],
    actualCommissionRate: 8.0,
    brokerCommissionRate: 5.5,
    platformMarginRate: 2.5,
    salesContactName: "Sarah Hassan",
    salesContactPhone: "+20 10 87654321",
    salesContactEmail: "uptown@emaarmisr.com",
  },
  {
    name: "Eastown",
    description: "A contemporary residential and commercial development in New Cairo by Sodic.",
    location: "New Cairo, Egypt",
    address: "90th Street, New Cairo",
    coordinates: "30.0444,31.4825",
    projectType: ProjectType.MIXED_USE,
    totalUnits: 8000,
    availableUnits: 1200,
    soldUnits: 6800,
    priceRange: "2,500,000 - 18,000,000 EGP",
    paymentPlans: ["Cash", "4 Years Installment", "6 Years Installment"],
    status: ProjectStatus.UNDER_CONSTRUCTION,
    launchDate: new Date("2015-09-01"),
    completionDate: new Date("2025-09-30"),
    amenities: ["Commercial Strips", "Office Spaces", "Green Areas", "Sports Facilities"],
    actualCommissionRate: 7.0,
    brokerCommissionRate: 4.8,
    platformMarginRate: 2.2,
    salesContactName: "Omar Farouk",
    salesContactPhone: "+20 12 34567890",
    salesContactEmail: "eastown@sodic.com",
  }
];

// Categories Data
const categories = [
  { name: "Apartments", categoryType: CategoryType.PROPERTY_TYPE },
  { name: "Villas", categoryType: CategoryType.PROPERTY_TYPE },
  { name: "Townhouses", categoryType: CategoryType.PROPERTY_TYPE },
  { name: "Commercial Units", categoryType: CategoryType.PROPERTY_TYPE },
  { name: "Offices", categoryType: CategoryType.PROPERTY_TYPE },
  { name: "Swimming Pool", categoryType: CategoryType.AMENITY_TYPE },
  { name: "Gym", categoryType: CategoryType.AMENITY_TYPE },
  { name: "Security", categoryType: CategoryType.AMENITY_TYPE },
  { name: "Green Areas", categoryType: CategoryType.AMENITY_TYPE },
];

// Unit Types Data
const unitTypes = [
  { name: "Studio" },
  { name: "1 Bedroom" },
  { name: "2 Bedroom" },
  { name: "3 Bedroom" },
  { name: "4 Bedroom" },
  { name: "Penthouse" },
  { name: "Duplex" },
  { name: "Twin House" },
  { name: "Standalone Villa" },
  { name: "Shop" },
  { name: "Office" },
  { name: "Clinic" },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create Super Admin User
    const hashedPassword = await bcrypt.hash('admin123456', 12);
    
    const superAdmin = await prisma.adminUser.upsert({
      where: { email: 'admin@byit.com' },
      update: {},
      create: {
        email: 'admin@byit.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: AdminRole.SUPER_ADMIN,
        mustChangePassword: false,
        phone: '+20 10 12345678',
        department: 'Administration',
        jobTitle: 'System Administrator',
      },
    });

    console.log('✅ Super Admin created:', superAdmin.email);

    // Create Categories
    console.log('🏷️ Creating categories...');
    for (const category of categories) {
      await prisma.category.upsert({
        where: { name: category.name },
        update: {},
        create: category,
      });
    }

    // Create Unit Types
    console.log('🏠 Creating unit types...');
    for (const unitType of unitTypes) {
      await prisma.unitType.upsert({
        where: { name: unitType.name },
        update: {},
        create: unitType,
      });
    }

    // Create Developers
    console.log('🏢 Creating Egyptian developers...');
    const createdDevelopers = [];
    for (const developer of egyptianDevelopers) {
      const createdDeveloper = await prisma.developer.upsert({
        where: { name: developer.name },
        update: {},
        create: {
          ...developer,
          createdBy: superAdmin.id,
        },
      });
      createdDevelopers.push(createdDeveloper);
    }

    // Create Projects
    console.log('🏗️ Creating Egyptian projects...');
    const tmgDeveloper = createdDevelopers.find(d => d.name === "Talaat Moustafa Group (TMG)");
    const emaarDeveloper = createdDevelopers.find(d => d.name === "Emaar Misr");
    const sodicDeveloper = createdDevelopers.find(d => d.name === "Sodic");

    const projectsWithDevelopers = [
      { ...egyptianProjects[0], developerId: tmgDeveloper?.id },
      { ...egyptianProjects[1], developerId: tmgDeveloper?.id },
      { ...egyptianProjects[2], developerId: emaarDeveloper?.id },
      { ...egyptianProjects[3], developerId: sodicDeveloper?.id },
    ];

    for (const project of projectsWithDevelopers) {
      if (project.developerId) {
        await prisma.project.upsert({
          where: { 
            name_developerId: {
              name: project.name,
              developerId: project.developerId,
            }
          },
          update: {},
          create: {
            ...project,
            developerId: project.developerId,
            createdBy: superAdmin.id,
          },
        });
      }
    }

    // Create sample broker users
    console.log('👥 Creating sample brokers...');
    const sampleBrokers = [
      {
        email: 'broker1@example.com',
        password: await bcrypt.hash('broker123', 12),
        firstName: 'Mohamed',
        lastName: 'Ahmed',
        phone: '+20 10 11111111',
        role: BrokerRole.LICENSED_BROKER,
        kycStatus: KYCStatus.APPROVED,
        licenseNumber: 'BR-2024-001',
        licenseExpiry: new Date('2025-12-31'),
        brokerageCompany: 'Prime Real Estate',
        experienceYears: 5,
      },
      {
        email: 'broker2@example.com',
        password: await bcrypt.hash('broker123', 12),
        firstName: 'Fatma',
        lastName: 'Hassan',
        phone: '+20 10 22222222',
        role: BrokerRole.LICENSED_BROKER,
        kycStatus: KYCStatus.APPROVED,
        licenseNumber: 'BR-2024-002',
        licenseExpiry: new Date('2025-12-31'),
        brokerageCompany: 'Elite Properties',
        experienceYears: 3,
      },
    ];

    for (const broker of sampleBrokers) {
      await prisma.brokerUser.upsert({
        where: { email: broker.email },
        update: {},
        create: broker,
      });
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('📧 Super Admin Email: admin@byit.com');
    console.log('🔑 Super Admin Password: admin123456');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
if (require.main === module) {
  seedDatabase()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seedDatabase;
