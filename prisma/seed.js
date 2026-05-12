const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Create demo company
  const company = await prisma.company.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Accord Children Services',
      encryptionPin: '1234',
    },
  })

  // Create areas
  const area1 = await prisma.area.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'North Area', companyId: company.id },
  })

  const region1 = await prisma.region.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'Region 1', companyId: company.id },
  })

  // Create homes
  const home1 = await prisma.home.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Training Home',
      companyId: company.id,
      areaId: area1.id,
      regionId: region1.id,
      registrationStatus: null,
      rating: null,
      lastInspectionDate: new Date('2023-12-19'),
      mothballed: false,
      reg40s: 1,
      budgetAmount: 50000,
    },
  })

  const home2 = await prisma.home.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Sandown House',
      companyId: company.id,
      areaId: area1.id,
      regionId: region1.id,
      registrationStatus: 'Registered',
      rating: 'Requires Improvement',
      lastInspectionDate: new Date('2024-07-31'),
      mothballed: false,
      reg40s: 2,
      budgetAmount: 80000,
    },
  })

  // Create users
  const hashPw = (pw) => bcrypt.hash(pw, 10)

  // Director / Admin
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: await hashPw('admin123'),
      role: 'DIRECTOR',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@mentor.com',
      companyId: company.id,
      homeId: home1.id,
    },
  })

  // Manager
  await prisma.user.upsert({
    where: { username: 'manager' },
    update: {},
    create: {
      username: 'manager',
      password: await hashPw('manager123'),
      role: 'MANAGER',
      firstName: 'Sarah',
      lastName: 'Thompson',
      email: 'sarah.thompson@mentor.com',
      companyId: company.id,
      homeId: home1.id,
    },
  })

  // Staff Member
  await prisma.user.upsert({
    where: { username: 'staff' },
    update: {},
    create: {
      username: 'staff',
      password: await hashPw('staff123'),
      role: 'STAFF_MEMBER',
      firstName: 'James',
      lastName: 'Wilson',
      email: 'james.wilson@mentor.com',
      companyId: company.id,
      homeId: home1.id,
    },
  })

  // Young Person
  await prisma.user.upsert({
    where: { username: 'youngperson' },
    update: {},
    create: {
      username: 'youngperson',
      password: await hashPw('young123'),
      role: 'YOUNG_PERSON',
      firstName: 'Alex',
      lastName: 'Brown',
      email: 'alex.brown@mentor.com',
      companyId: company.id,
      homeId: home1.id,
    },
  })

  // Inspector
  await prisma.user.upsert({
    where: { username: 'inspector' },
    update: {},
    create: {
      username: 'inspector',
      password: await hashPw('inspect123'),
      role: 'INSPECTOR',
      firstName: 'Ofsted',
      lastName: 'Inspector',
      email: 'inspector@ofsted.gov.uk',
      companyId: company.id,
      homeId: null,
    },
  })

  // Operations Manager
  await prisma.user.upsert({
    where: { username: 'operations' },
    update: {},
    create: {
      username: 'operations',
      password: await hashPw('ops123'),
      role: 'OPERATIONS',
      firstName: 'David',
      lastName: 'Clarke',
      email: 'david.clarke@mentor.com',
      companyId: company.id,
      homeId: null,
    },
  })

  // Admin
  await prisma.user.upsert({
    where: { username: 'sysadmin' },
    update: {},
    create: {
      username: 'sysadmin',
      password: await hashPw('admin123'),
      role: 'ADMIN',
      firstName: 'System',
      lastName: 'Admin',
      email: 'sysadmin@mentor.com',
      companyId: company.id,
      homeId: null,
    },
  })

  // Create beds for Training Home
  await prisma.bed.createMany({
    skipDuplicates: true,
    data: [
      { homeId: home1.id, bedNumber: 'B1', status: 'OCCUPIED' },
      { homeId: home1.id, bedNumber: 'B2', status: 'OCCUPIED' },
      { homeId: home1.id, bedNumber: 'B3', status: 'OCCUPIED' },
    ],
  })

  // Create beds for Sandown House
  await prisma.bed.createMany({
    skipDuplicates: true,
    data: [
      { homeId: home2.id, bedNumber: 'S1', status: 'REGISTERED' },
      { homeId: home2.id, bedNumber: 'S2', status: 'REGISTERED' },
      { homeId: home2.id, bedNumber: 'S3', status: 'REGISTERED' },
    ],
  })

  console.log('Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
