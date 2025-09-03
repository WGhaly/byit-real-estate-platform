import { PrismaClient, ProjectStatus, BrokerRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const egyptianGovernoratesData = [
  { name: 'القاهرة', nameEn: 'Cairo' },
  { name: 'الجيزة', nameEn: 'Giza' },
  { name: 'الإسكندرية', nameEn: 'Alexandria' },
  { name: 'أسوان', nameEn: 'Aswan' },
  { name: 'أسيوط', nameEn: 'Asyut' },
  { name: 'البحيرة', nameEn: 'Beheira' },
  { name: 'بني سويف', nameEn: 'Beni Suef' },
  { name: 'الدقهلية', nameEn: 'Dakahlia' },
  { name: 'دمياط', nameEn: 'Damietta' },
  { name: 'الفيوم', nameEn: 'Fayyum' },
  { name: 'الغربية', nameEn: 'Gharbia' },
  { name: 'الأقصر', nameEn: 'Luxor' },
  { name: 'المنوفية', nameEn: 'Monufia' },
  { name: 'المنيا', nameEn: 'Minya' },
  { name: 'الوادي الجديد', nameEn: 'New Valley' },
  { name: 'شمال سيناء', nameEn: 'North Sinai' },
  { name: 'بورسعيد', nameEn: 'Port Said' },
  { name: 'القليوبية', nameEn: 'Qalyubia' },
  { name: 'قنا', nameEn: 'Qena' },
  { name: 'البحر الأحمر', nameEn: 'Red Sea' },
  { name: 'الشرقية', nameEn: 'Sharqia' },
  { name: 'سوهاج', nameEn: 'Sohag' },
  { name: 'جنوب سيناء', nameEn: 'South Sinai' },
  { name: 'السويس', nameEn: 'Suez' },
  { name: 'كفر الشيخ', nameEn: 'Kafr el-Sheikh' },
  { name: 'مطروح', nameEn: 'Matrouh' },
  { name: 'الإسماعيلية', nameEn: 'Ismailia' }
];

const developersData = [
  {
    name: 'شركة العاصمة الإدارية الجديدة للتنمية العمرانية',
    nameEn: 'New Administrative Capital for Urban Development',
    location: 'العاصمة الإدارية الجديدة',
    locationEn: 'New Administrative Capital',
    phone: '+20101234567',
    address: 'العاصمة الإدارية الجديدة، مصر',
    addressEn: 'New Administrative Capital, Egypt',
    email: 'info@newcapital.gov.eg',
    website: 'https://newcapital.gov.eg',
    description: 'شركة حكومية متخصصة في تطوير العاصمة الإدارية الجديدة',
    descriptionEn: 'Government company specialized in developing the New Administrative Capital',
    logoUrl: '/images/developers/new-capital.png',
    establishedYear: 2015,
    projectsCount: 0,
    totalInvestment: 45000000000,
    isActive: true
  },
  {
    name: 'شركة المدن الاقتصادية المتخصصة',
    nameEn: 'Specialized Economic Cities Company',
    location: 'العين السخنة',
    locationEn: 'Ain Sokhna',
    phone: '+20101234568',
    address: 'العين السخنة، السويس، مصر',
    addressEn: 'Ain Sokhna, Suez, Egypt',
    email: 'info@secc.gov.eg',
    website: 'https://secc.gov.eg',
    description: 'شركة حكومية متخصصة في تطوير المدن الاقتصادية المتخصصة',
    descriptionEn: 'Government company specialized in developing specialized economic cities',
    logoUrl: '/images/developers/secc.png',
    establishedYear: 2014,
    projectsCount: 0,
    totalInvestment: 20000000000,
    isActive: true
  },
  {
    name: 'شركة إعمار مصر للتنمية',
    nameEn: 'Emaar Misr for Development',
    location: 'القاهرة',
    locationEn: 'Cairo',
    phone: '+20101234569',
    address: 'مدينة نصر، القاهرة، مصر',
    addressEn: 'Nasr City, Cairo, Egypt',
    email: 'info@emaarmisr.com',
    website: 'https://emaarmisr.com',
    description: 'شركة رائدة في التطوير العقاري في مصر',
    descriptionEn: 'Leading real estate development company in Egypt',
    logoUrl: '/images/developers/emaar.png',
    establishedYear: 2005,
    projectsCount: 0,
    totalInvestment: 15000000000,
    isActive: true
  },
  {
    name: 'مجموعة طلعت مصطفى',
    nameEn: 'Talaat Moustafa Group',
    location: 'القاهرة',
    locationEn: 'Cairo',
    phone: '+20101234570',
    address: 'مدينة نصر، القاهرة، مصر',
    addressEn: 'Nasr City, Cairo, Egypt',
    email: 'info@tmg.com.eg',
    website: 'https://tmg.com.eg',
    description: 'إحدى أكبر شركات التطوير العقاري في مصر والشرق الأوسط',
    descriptionEn: 'One of the largest real estate development companies in Egypt and the Middle East',
    logoUrl: '/images/developers/tmg.png',
    establishedYear: 1954,
    projectsCount: 0,
    totalInvestment: 25000000000,
    isActive: true
  },
  {
    name: 'شركة السادات للتنمية',
    nameEn: 'Sadat City Development Company',
    location: 'مدينة السادات',
    locationEn: 'Sadat City',
    phone: '+20101234571',
    address: 'مدينة السادات، المنوفية، مصر',
    addressEn: 'Sadat City, Monufia, Egypt',
    email: 'info@scdc.com.eg',
    website: 'https://scdc.com.eg',
    description: 'شركة حكومية متخصصة في تطوير مدينة السادات',
    descriptionEn: 'Government company specialized in developing Sadat City',
    logoUrl: '/images/developers/sadat.png',
    establishedYear: 1978,
    projectsCount: 0,
    totalInvestment: 8000000000,
    isActive: true
  },
  {
    name: 'شركة مدينة العبور الجديدة',
    nameEn: 'New Obour City Development Authority',
    location: 'مدينة العبور',
    locationEn: 'Obour City',
    phone: '+20101234572',
    address: 'مدينة العبور، القليوبية، مصر',
    addressEn: 'Obour City, Qalyubia, Egypt',
    email: 'info@obourcity.gov.eg',
    website: 'https://obourcity.gov.eg',
    description: 'هيئة حكومية متخصصة في تطوير مدينة العبور الجديدة',
    descriptionEn: 'Government authority specialized in developing New Obour City',
    logoUrl: '/images/developers/obour.png',
    establishedYear: 1981,
    projectsCount: 0,
    totalInvestment: 6000000000,
    isActive: true
  },
  {
    name: 'شركة المقاولون العرب',
    nameEn: 'Arab Contractors Company',
    location: 'القاهرة',
    locationEn: 'Cairo',
    phone: '+20101234573',
    address: 'الدقي، الجيزة، مصر',
    addressEn: 'Dokki, Giza, Egypt',
    email: 'info@arabcont.com',
    website: 'https://arabcont.com',
    description: 'شركة رائدة في المقاولات والتطوير العقاري',
    descriptionEn: 'Leading company in contracting and real estate development',
    logoUrl: '/images/developers/arab-contractors.png',
    establishedYear: 1955,
    projectsCount: 0,
    totalInvestment: 12000000000,
    isActive: true
  },
  {
    name: 'شركة حسن علام',
    nameEn: 'Hassan Allam Construction',
    location: 'القاهرة',
    locationEn: 'Cairo',
    phone: '+20101234574',
    address: 'مدينة نصر، القاهرة، مصر',
    addressEn: 'Nasr City, Cairo, Egypt',
    email: 'info@hassanallam.com',
    website: 'https://hassanallam.com',
    description: 'شركة رائدة في الإنشاءات والتطوير العقاري',
    descriptionEn: 'Leading company in construction and real estate development',
    logoUrl: '/images/developers/hassan-allam.png',
    establishedYear: 1936,
    projectsCount: 0,
    totalInvestment: 8000000000,
    isActive: true
  },
  {
    name: 'شركة الإسكان والتعمير',
    nameEn: 'Housing and Development Bank',
    location: 'القاهرة',
    locationEn: 'Cairo',
    phone: '+20101234575',
    address: 'وسط البلد، القاهرة، مصر',
    addressEn: 'Downtown, Cairo, Egypt',
    email: 'info@hdb.com.eg',
    website: 'https://hdb.com.eg',
    description: 'بنك متخصص في تمويل الإسكان والتطوير العقاري',
    descriptionEn: 'Bank specialized in housing finance and real estate development',
    logoUrl: '/images/developers/hdb.png',
    establishedYear: 1979,
    projectsCount: 0,
    totalInvestment: 10000000000,
    isActive: true
  },
  {
    name: 'شركة التعمير والاستشارات الهندسية',
    nameEn: 'ACE Engineering Consultants',
    location: 'القاهرة',
    locationEn: 'Cairo',
    phone: '+20101234576',
    address: 'الزمالك، القاهرة، مصر',
    addressEn: 'Zamalek, Cairo, Egypt',
    email: 'info@ace-eg.com',
    website: 'https://ace-eg.com',
    description: 'شركة رائدة في الاستشارات الهندسية والتطوير العقاري',
    descriptionEn: 'Leading company in engineering consultancy and real estate development',
    logoUrl: '/images/developers/ace.png',
    establishedYear: 1967,
    projectsCount: 0,
    totalInvestment: 5000000000,
    isActive: true
  },
  {
    name: 'شركة أورا العقارية',
    nameEn: 'ORA Developers',
    location: 'الشيخ زايد',
    locationEn: 'Sheikh Zayed',
    phone: '+20101234577',
    address: 'الشيخ زايد، الجيزة، مصر',
    addressEn: 'Sheikh Zayed, Giza, Egypt',
    email: 'info@ora.com.eg',
    website: 'https://ora.com.eg',
    description: 'شركة حديثة متخصصة في المشاريع العقارية الفاخرة',
    descriptionEn: 'Modern company specialized in luxury real estate projects',
    logoUrl: '/images/developers/ora.png',
    establishedYear: 2017,
    projectsCount: 0,
    totalInvestment: 3000000000,
    isActive: true
  },
  {
    name: 'شركة بالم هيلز للتنمية',
    nameEn: 'Palm Hills Developments',
    location: 'الشيخ زايد',
    locationEn: 'Sheikh Zayed',
    phone: '+20101234578',
    address: 'الشيخ زايد، الجيزة، مصر',
    addressEn: 'Sheikh Zayed, Giza, Egypt',
    email: 'info@palmhillsdevelopments.com',
    website: 'https://palmhillsdevelopments.com',
    description: 'شركة رائدة في تطوير المجتمعات السكنية المتكاملة',
    descriptionEn: 'Leading company in developing integrated residential communities',
    logoUrl: '/images/developers/palm-hills.png',
    establishedYear: 1997,
    projectsCount: 0,
    totalInvestment: 7000000000,
    isActive: true
  },
  {
    name: 'شركة صودك للتنمية والاستثمار العقاري',
    nameEn: 'SODIC Real Estate Development',
    location: 'الشيخ زايد',
    locationEn: 'Sheikh Zayed',
    phone: '+20101234579',
    address: 'الشيخ زايد، الجيزة، مصر',
    addressEn: 'Sheikh Zayed, Giza, Egypt',
    email: 'info@sodic.com',
    website: 'https://sodic.com',
    description: 'شركة رائدة في التطوير العقاري والمجتمعات المتكاملة',
    descriptionEn: 'Leading company in real estate development and integrated communities',
    logoUrl: '/images/developers/sodic.png',
    establishedYear: 1996,
    projectsCount: 0,
    totalInvestment: 9000000000,
    isActive: true
  },
  {
    name: 'شركة الأهلي صبور للتنمية العقارية',
    nameEn: 'Al Ahly Sabbour Development',
    location: 'القاهرة الجديدة',
    locationEn: 'New Cairo',
    phone: '+20101234580',
    address: 'القاهرة الجديدة، القاهرة، مصر',
    addressEn: 'New Cairo, Cairo, Egypt',
    email: 'info@ahlysabbour.com',
    website: 'https://ahlysabbour.com',
    description: 'شركة رائدة في التطوير العقاري والمجتمعات السكنية',
    descriptionEn: 'Leading company in real estate development and residential communities',
    logoUrl: '/images/developers/ahly-sabbour.png',
    establishedYear: 2005,
    projectsCount: 0,
    totalInvestment: 6000000000,
    isActive: true
  },
  {
    name: 'مجموعة العربية للإسكان والتعمير',
    nameEn: 'Arabia Group for Housing and Development',
    location: 'القاهرة',
    locationEn: 'Cairo',
    phone: '+20101234581',
    address: 'وسط البلد، القاهرة، مصر',
    addressEn: 'Downtown, Cairo, Egypt',
    email: 'info@arabiagroup.com.eg',
    website: 'https://arabiagroup.com.eg',
    description: 'مجموعة رائدة في الإسكان والتطوير العقاري',
    descriptionEn: 'Leading group in housing and real estate development',
    logoUrl: '/images/developers/arabia-group.png',
    establishedYear: 1982,
    projectsCount: 0,
    totalInvestment: 4000000000,
    isActive: true
  },
  {
    name: 'شركة مجموعة مدينتي للتطوير العقاري',
    nameEn: 'Madinaty Development Group',
    location: 'القاهرة الجديدة',
    locationEn: 'New Cairo',
    phone: '+20101234582',
    address: 'مدينتي، القاهرة الجديدة، مصر',
    addressEn: 'Madinaty, New Cairo, Egypt',
    email: 'info@madinaty.com',
    website: 'https://madinaty.com',
    description: 'شركة متخصصة في تطوير المجتمعات السكنية الكبيرة',
    descriptionEn: 'Company specialized in developing large residential communities',
    logoUrl: '/images/developers/madinaty.png',
    establishedYear: 2006,
    projectsCount: 0,
    totalInvestment: 15000000000,
    isActive: true
  },
  {
    name: 'شركة بيراميدز للتطوير العقاري',
    nameEn: 'Pyramids Development Company',
    location: 'الهرم',
    locationEn: 'Haram',
    phone: '+20101234583',
    address: 'الهرم، الجيزة، مصر',
    addressEn: 'Haram, Giza, Egypt',
    email: 'info@pyramidsdev.com',
    website: 'https://pyramidsdev.com',
    description: 'شركة متخصصة في التطوير العقاري في منطقة الأهرام',
    descriptionEn: 'Company specialized in real estate development in the Pyramids area',
    logoUrl: '/images/developers/pyramids.png',
    establishedYear: 1990,
    projectsCount: 0,
    totalInvestment: 3500000000,
    isActive: true
  },
  {
    name: 'شركة الدلتا للإسكان والتعمير',
    nameEn: 'Delta Housing and Development',
    location: 'طنطا',
    locationEn: 'Tanta',
    phone: '+20101234584',
    address: 'طنطا، الغربية، مصر',
    addressEn: 'Tanta, Gharbia, Egypt',
    email: 'info@deltahousing.com.eg',
    website: 'https://deltahousing.com.eg',
    description: 'شركة رائدة في التطوير العقاري في منطقة الدلتا',
    descriptionEn: 'Leading company in real estate development in the Delta region',
    logoUrl: '/images/developers/delta.png',
    establishedYear: 1985,
    projectsCount: 0,
    totalInvestment: 2500000000,
    isActive: true
  },
  {
    name: 'شركة الصعيد للتنمية العقارية',
    nameEn: 'Upper Egypt Real Estate Development',
    location: 'أسيوط',
    locationEn: 'Asyut',
    phone: '+20101234585',
    address: 'أسيوط، مصر',
    addressEn: 'Asyut, Egypt',
    email: 'info@upperegyptdev.com',
    website: 'https://upperegyptdev.com',
    description: 'شركة رائدة في التطوير العقاري في صعيد مصر',
    descriptionEn: 'Leading company in real estate development in Upper Egypt',
    logoUrl: '/images/developers/upper-egypt.png',
    establishedYear: 1988,
    projectsCount: 0,
    totalInvestment: 2000000000,
    isActive: true
  },
  {
    name: 'شركة الساحل الشمالي للتنمية السياحية',
    nameEn: 'North Coast Tourism Development',
    location: 'العلمين',
    locationEn: 'Alamein',
    phone: '+20101234586',
    address: 'العلمين، مطروح، مصر',
    addressEn: 'Alamein, Matrouh, Egypt',
    email: 'info@northcoastdev.com',
    website: 'https://northcoastdev.com',
    description: 'شركة متخصصة في التطوير السياحي والعقاري بالساحل الشمالي',
    descriptionEn: 'Company specialized in tourism and real estate development on the North Coast',
    logoUrl: '/images/developers/north-coast.png',
    establishedYear: 1992,
    projectsCount: 0,
    totalInvestment: 4500000000,
    isActive: true
  }
];

const projectTypesData = [
  { name: 'سكني', nameEn: 'Residential' },
  { name: 'تجاري', nameEn: 'Commercial' },
  { name: 'إداري', nameEn: 'Administrative' },
  { name: 'طبي', nameEn: 'Medical' },
  { name: 'تعليمي', nameEn: 'Educational' },
  { name: 'ترفيهي', nameEn: 'Entertainment' },
  { name: 'فندقي', nameEn: 'Hotel' },
  { name: 'صناعي', nameEn: 'Industrial' },
  { name: 'لوجستي', nameEn: 'Logistics' },
  { name: 'مختلط', nameEn: 'Mixed Use' }
];

const projectCategoriesData = [
  { name: 'شقق سكنية', nameEn: 'Residential Apartments', projectType: 'سكني' },
  { name: 'فيلات', nameEn: 'Villas', projectType: 'سكني' },
  { name: 'تاون هاوس', nameEn: 'Townhouses', projectType: 'سكني' },
  { name: 'بنتهاوس', nameEn: 'Penthouse', projectType: 'سكني' },
  { name: 'دوبلكس', nameEn: 'Duplex', projectType: 'سكني' },
  { name: 'محلات تجارية', nameEn: 'Retail Shops', projectType: 'تجاري' },
  { name: 'مولات تجارية', nameEn: 'Shopping Malls', projectType: 'تجاري' },
  { name: 'معارض', nameEn: 'Showrooms', projectType: 'تجاري' },
  { name: 'مكاتب إدارية', nameEn: 'Administrative Offices', projectType: 'إداري' },
  { name: 'مراكز إدارية', nameEn: 'Business Centers', projectType: 'إداري' },
  { name: 'عيادات طبية', nameEn: 'Medical Clinics', projectType: 'طبي' },
  { name: 'مستشفيات', nameEn: 'Hospitals', projectType: 'طبي' },
  { name: 'مراكز طبية', nameEn: 'Medical Centers', projectType: 'طبي' },
  { name: 'مدارس', nameEn: 'Schools', projectType: 'تعليمي' },
  { name: 'جامعات', nameEn: 'Universities', projectType: 'تعليمي' },
  { name: 'مراكز تدريب', nameEn: 'Training Centers', projectType: 'تعليمي' },
  { name: 'مطاعم', nameEn: 'Restaurants', projectType: 'ترفيهي' },
  { name: 'مقاهي', nameEn: 'Cafes', projectType: 'ترفيهي' },
  { name: 'نوادي', nameEn: 'Clubs', projectType: 'ترفيهي' },
  { name: 'فنادق', nameEn: 'Hotels', projectType: 'فندقي' },
  { name: 'منتجعات', nameEn: 'Resorts', projectType: 'فندقي' },
  { name: 'مصانع', nameEn: 'Factories', projectType: 'صناعي' },
  { name: 'ورش', nameEn: 'Workshops', projectType: 'صناعي' },
  { name: 'مخازن', nameEn: 'Warehouses', projectType: 'لوجستي' },
  { name: 'مراكز توزيع', nameEn: 'Distribution Centers', projectType: 'لوجستي' },
  { name: 'مجمعات متعددة الاستخدام', nameEn: 'Mixed Use Complexes', projectType: 'مختلط' }
];

const unitTypesData = [
  { name: 'ستوديو', nameEn: 'Studio', category: 'شقق سكنية' },
  { name: 'غرفة واحدة', nameEn: '1 Bedroom', category: 'شقق سكنية' },
  { name: 'غرفتين', nameEn: '2 Bedrooms', category: 'شقق سكنية' },
  { name: 'ثلاث غرف', nameEn: '3 Bedrooms', category: 'شقق سكنية' },
  { name: 'أربع غرف', nameEn: '4 Bedrooms', category: 'شقق سكنية' },
  { name: 'خمس غرف', nameEn: '5+ Bedrooms', category: 'شقق سكنية' },
  { name: 'فيلا منفصلة', nameEn: 'Standalone Villa', category: 'فيلات' },
  { name: 'فيلا متلاصقة', nameEn: 'Twin Villa', category: 'فيلات' },
  { name: 'فيلا بحديقة', nameEn: 'Villa with Garden', category: 'فيلات' },
  { name: 'تاون هاوس صغير', nameEn: 'Small Townhouse', category: 'تاون هاوس' },
  { name: 'تاون هاوس متوسط', nameEn: 'Medium Townhouse', category: 'تاون هاوس' },
  { name: 'تاون هاوس كبير', nameEn: 'Large Townhouse', category: 'تاون هاوس' },
  { name: 'بنتهاوس صغير', nameEn: 'Small Penthouse', category: 'بنتهاوس' },
  { name: 'بنتهاوس كبير', nameEn: 'Large Penthouse', category: 'بنتهاوس' },
  { name: 'دوبلكس علوي', nameEn: 'Upper Duplex', category: 'دوبلكس' },
  { name: 'دوبلكس سفلي', nameEn: 'Lower Duplex', category: 'دوبلكس' },
  { name: 'محل صغير', nameEn: 'Small Shop', category: 'محلات تجارية' },
  { name: 'محل متوسط', nameEn: 'Medium Shop', category: 'محلات تجارية' },
  { name: 'محل كبير', nameEn: 'Large Shop', category: 'محلات تجارية' },
  { name: 'مكتب صغير', nameEn: 'Small Office', category: 'مكاتب إدارية' },
  { name: 'مكتب متوسط', nameEn: 'Medium Office', category: 'مكاتب إدارية' },
  { name: 'مكتب كبير', nameEn: 'Large Office', category: 'مكاتب إدارية' },
  { name: 'عيادة صغيرة', nameEn: 'Small Clinic', category: 'عيادات طبية' },
  { name: 'عيادة متوسطة', nameEn: 'Medium Clinic', category: 'عيادات طبية' },
  { name: 'عيادة كبيرة', nameEn: 'Large Clinic', category: 'عيادات طبية' }
];

// Sample project data for each developer
const generateProjectsData = (developers: any[]) => {
  const projects = [];
  const locations = [
    'العاصمة الإدارية الجديدة', 'القاهرة الجديدة', 'الشيخ زايد', 'أكتوبر',
    'التجمع الخامس', 'مدينة نصر', 'الزمالك', 'المعادي', 'حلوان', 'المقطم',
    'الرحاب', 'مدينتي', 'القطامية', 'عين شمس', 'شبرا الخيمة'
  ];

  for (let i = 0; i < developers.length; i++) {
    const developer = developers[i];
    const projectCount = Math.floor(Math.random() * 8) + 3; // 3-10 projects per developer

    for (let j = 0; j < projectCount; j++) {
      const location = locations[Math.floor(Math.random() * locations.length)];
      const projectType = projectTypesData[Math.floor(Math.random() * projectTypesData.length)];
      
      projects.push({
        name: `${developer.name} Project ${j + 1}`,
        nameAr: `مشروع ${developer.name} ${j + 1}`,
        description: `Premium ${projectType.nameEn.toLowerCase()} project in ${location}`,
        descriptionAr: `مشروع ${projectType.name} متميز في ${location}`,
        location,
        governorate: 'القاهرة',
        type: projectType.name,
        typeEn: projectType.nameEn,
        status: Math.random() > 0.2 ? 'UNDER_CONSTRUCTION' : 'PLANNING',
        launchDate: new Date(2020 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        expectedCompletionDate: new Date(2025 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        totalUnits: Math.floor(Math.random() * 1000) + 100,
        soldUnits: Math.floor(Math.random() * 500),
        availableUnits: function() { return this.totalUnits - this.soldUnits; },
        minPrice: Math.floor(Math.random() * 2000000) + 500000,
        maxPrice: Math.floor(Math.random() * 5000000) + 2000000,
        minArea: Math.floor(Math.random() * 50) + 50,
        maxArea: Math.floor(Math.random() * 200) + 150,
        totalInvestment: Math.floor(Math.random() * 5000000000) + 1000000000,
        salesValue: Math.floor(Math.random() * 3000000000) + 500000000,
        logoUrl: `/images/projects/${developer.name.toLowerCase().replace(/\s+/g, '-')}-project-${j + 1}.jpg`,
        imagesUrls: [
          `/images/projects/${developer.name.toLowerCase().replace(/\s+/g, '-')}-project-${j + 1}-1.jpg`,
          `/images/projects/${developer.name.toLowerCase().replace(/\s+/g, '-')}-project-${j + 1}-2.jpg`,
          `/images/projects/${developer.name.toLowerCase().replace(/\s+/g, '-')}-project-${j + 1}-3.jpg`
        ],
        amenities: [
          'Swimming Pool', 'Gym', 'Security', 'Parking', 'Garden', 'Kids Area',
          'Club House', 'Commercial Area', 'Medical Center', 'School'
        ].slice(0, Math.floor(Math.random() * 6) + 4),
        paymentPlans: [
          { name: 'Cash', discount: 15, description: '15% discount for cash payment' },
          { name: 'Installments', years: 5, downPayment: 20, description: '20% down payment, 5 years installments' },
          { name: 'Extended', years: 8, downPayment: 10, description: '10% down payment, 8 years installments' }
        ],
        commissionStructure: {
          brokerCommission: Math.floor(Math.random() * 3) + 2, // 2-4%
          companyCommission: Math.floor(Math.random() * 2) + 1, // 1-2%
          teamLeaderBonus: Math.floor(Math.random() * 0.5 * 100) / 100, // 0-0.5%
          salesManagerBonus: Math.floor(Math.random() * 0.5 * 100) / 100 // 0-0.5%
        },
        isActive: Math.random() > 0.1,
        developerId: i + 1 // Will be updated with actual developer ID
      });
    }
  }

  return projects;
};

// Sample brokers data
const brokersData = [
  {
    firstName: 'أحمد',
    lastName: 'محمد',
    email: 'ahmed.mohamed@broker.com',
    phone: '+201012345678',
    licenseNumber: 'LIC001',
    role: 'LICENSED_BROKER',
    brokerageCompany: 'شركة الوسطاء المتقدمة',
    experienceYears: 5,
    teamLeaderId: null,
    governorate: 'القاهرة'
  },
  {
    firstName: 'فاطمة',
    lastName: 'السيد',
    email: 'fatma.elsayed@broker.com',
    phone: '+201012345679',
    licenseNumber: 'LIC002',
    role: 'LICENSED_BROKER',
    brokerageCompany: 'شركة الإسكندرية العقارية',
    experienceYears: 7,
    teamLeaderId: null,
    governorate: 'الإسكندرية'
  },
  {
    firstName: 'محمد',
    lastName: 'أحمد',
    email: 'mohamed.ahmed@broker.com',
    phone: '+201012345680',
    licenseNumber: 'LIC003',
    role: 'TRAINEE_BROKER',
    brokerageCompany: 'شركة الوسطاء المتقدمة',
    experienceYears: 3,
    teamLeaderId: 1,
    governorate: 'الجيزة'
  },
  {
    firstName: 'نور',
    lastName: 'خالد',
    email: 'nour.khaled@broker.com',
    phone: '+201012345681',
    licenseNumber: 'LIC004',
    role: 'TRAINEE_BROKER',
    brokerageCompany: 'شركة الوسطاء المتقدمة',
    experienceYears: 2,
    teamLeaderId: 1,
    governorate: 'الجيزة'
  },
  {
    firstName: 'عمر',
    lastName: 'حسن',
    email: 'omar.hassan@broker.com',
    phone: '+201012345682',
    licenseNumber: 'LIC005',
    role: 'LICENSED_BROKER',
    brokerageCompany: 'مجموعة القاهرة العقارية',
    experienceYears: 8,
    teamLeaderId: null,
    governorate: 'القاهرة'
  },
  {
    firstName: 'مريم',
    lastName: 'عبد الله',
    email: 'mariam.abdullah@broker.com',
    phone: '+201012345683',
    licenseNumber: 'LIC006',
    role: 'TRAINEE_BROKER',
    brokerageCompany: 'مجموعة القاهرة العقارية',
    experienceYears: 4,
    teamLeaderId: 5,
    governorate: 'القاهرة'
  },
  {
    firstName: 'يوسف',
    lastName: 'علي',
    email: 'youssef.ali@broker.com',
    phone: '+201012345684',
    licenseNumber: 'LIC007',
    role: 'LICENSED_BROKER',
    brokerageCompany: 'شركة الصعيد العقارية',
    experienceYears: 6,
    teamLeaderId: null,
    governorate: 'أسيوط'
  },
  {
    firstName: 'سارة',
    lastName: 'محمود',
    email: 'sara.mahmoud@broker.com',
    phone: '+201012345685',
    licenseNumber: 'LIC008',
    role: 'TRAINEE_BROKER',
    brokerageCompany: 'شركة الصعيد العقارية',
    experienceYears: 3,
    teamLeaderId: 7,
    governorate: 'الغربية'
  },
  {
    firstName: 'كريم',
    lastName: 'إبراهيم',
    email: 'kareem.ibrahim@broker.com',
    phone: '+201012345686',
    licenseNumber: 'LIC009',
    role: 'LICENSED_BROKER',
    brokerageCompany: 'شركة الدلتا العقارية',
    experienceYears: 5,
    teamLeaderId: null,
    governorate: 'الدقهلية'
  },
  {
    firstName: 'دينا',
    lastName: 'رضا',
    email: 'dina.reda@broker.com',
    phone: '+201012345687',
    licenseNumber: 'LIC010',
    role: 'TRAINEE_BROKER',
    brokerageCompany: 'شركة الدلتا العقارية',
    experienceYears: 2,
    teamLeaderId: 9,
    governorate: 'الأقصر'
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting Egyptian market seeding...');

    // 1. Create admin users
    console.log('👤 Creating admin users...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await prisma.adminUser.createMany({
      data: [
        {
          firstName: 'Byit',
          lastName: 'Admin',
          email: 'admin@byit.com',
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          phone: '+201000000000',
          isActive: true
        },
        {
          firstName: 'مدير',
          lastName: 'المبيعات',
          email: 'sales.manager@byit.com',
          password: hashedPassword,
          role: 'OPERATIONS_MANAGER',
          phone: '+201000000001',
          isActive: true
        },
        {
          firstName: 'مدير',
          lastName: 'العمليات',
          email: 'operations.manager@byit.com',
          password: hashedPassword,
          role: 'FINANCE_MANAGER',
          phone: '+201000000002',
          isActive: true
        }
      ],
      skipDuplicates: true
    });

    // 2. Skip governorates (not needed in current schema)
    console.log('🏛️ Skipping governorates creation (not in schema)...');

    // 3. Skip project types (using enum directly)
    console.log('🏗️ Skipping project types (using enum)...');

    // 4. Create developers
    console.log('🏢 Creating Egyptian developers...');
    const createdDevelopers = [];
  for (const developerData of developersData) {
    const developer = await prisma.developer.upsert({
      where: { name: developerData.name },
      update: {
        description: developerData.description,
        establishedYear: developerData.establishedYear,
        website: developerData.website,
        email: developerData.email,
        phone: developerData.phone,
        headquarters: developerData.location,
        operatingCities: [developerData.location],
        logo: developerData.logoUrl,
        actualCommissionRate: 2.5,
        brokerCommissionRate: 0.5,
        salesContactName: 'مدير المبيعات',
        salesContactEmail: `sales@${developerData.name.toLowerCase().replace(/\s+/g, '')}.com`,
        salesContactPhone: '+201000000000'
      },
      create: {
        name: developerData.name,
        description: developerData.description,
        establishedYear: developerData.establishedYear,
        website: developerData.website,
        email: developerData.email,
        phone: developerData.phone,
        headquarters: developerData.location,
        operatingCities: [developerData.location],
        logo: developerData.logoUrl,
        actualCommissionRate: 2.5,
        brokerCommissionRate: 0.5,
        salesContactName: 'مدير المبيعات',
        salesContactEmail: `sales@${developerData.name.toLowerCase().replace(/\s+/g, '')}.com`,
        salesContactPhone: '+201000000000'
      }
    });
    createdDevelopers.push(developer);
    console.log(`✅ Created/Updated developer: ${developer.name}`);
  }

    // 4. Skip project categories and unit types (simplified schema)
    console.log('📂 Skipping project categories and unit types (simplified schema)...');

    // 5. Create projects
    console.log('🏗️ Creating projects...');
    const projectsData = generateProjectsData(createdDevelopers);
    
    for (let i = 0; i < projectsData.length; i++) {
      const projectData = projectsData[i];
      const developer = createdDevelopers[Math.floor(i / Math.ceil(projectsData.length / createdDevelopers.length))];
      
      const project = await prisma.project.create({
        data: {
          name: projectData.name,
          description: projectData.description,
          location: projectData.location,
          developerId: developer.id,
          projectType: 'RESIDENTIAL',
          status: projectData.status as ProjectStatus,
          launchDate: projectData.launchDate,
          completionDate: projectData.expectedCompletionDate,
          totalUnits: projectData.totalUnits,
          availableUnits: projectData.totalUnits - projectData.soldUnits,
          priceRange: `${projectData.minPrice} - ${projectData.maxPrice} EGP`,
          paymentPlans: projectData.paymentPlans.map(pp => pp.name),
          images: projectData.imagesUrls,
          amenities: projectData.amenities,
          actualCommissionRate: projectData.commissionStructure.brokerCommission,
          brokerCommissionRate: projectData.commissionStructure.teamLeaderBonus
        }
      });

    }

    // 6. Create brokers
    console.log('👥 Creating brokers...');
    for (const brokerData of brokersData) {
      await prisma.brokerUser.create({
        data: {
          firstName: brokerData.firstName,
          lastName: brokerData.lastName,
          email: brokerData.email,
          password: hashedPassword,
          phone: brokerData.phone,
          role: brokerData.role as BrokerRole,
          licenseNumber: brokerData.licenseNumber,
          brokerageCompany: brokerData.brokerageCompany,
          experienceYears: brokerData.experienceYears
        }
      });
    }

    // 7. Update team leader relationships
    console.log('👔 Setting up team leader relationships...');
    const brokers = await prisma.brokerUser.findMany();
    for (const brokerData of brokersData) {
      if (brokerData.teamLeaderId) {
        const broker = brokers.find((b: any) => b.email === brokerData.email);
        const teamLeader = brokers[brokerData.teamLeaderId - 1]; // Assuming 1-based indexing
        
      }
    }

    // 8. Skip commission templates (simplified for now)
    console.log('💰 Skipping commission templates...');

    console.log('✅ Egyptian market seeding completed successfully!');
    console.log(`📊 Created:
    - ${createdDevelopers.length} developers
    - ${projectsData.length} projects  
    - ${brokers.length} brokers`);

  } catch (error) {
    console.error('❌ Error seeding Egyptian market:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
if (require.main === module) {
  seedDatabase()
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export default seedDatabase;
