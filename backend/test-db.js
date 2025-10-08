const { PrismaClient } = require('@prisma/client')

async function testDatabase() {
  const prisma = new PrismaClient()
  
  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connected successfully!')
    
    // Test a simple query
    const userCount = await prisma.user.count()
    console.log(`✅ Found ${userCount} users in database`)
    
    // Test booking query (the one that's failing)
    const bookings = await prisma.booking.findMany({
      take: 1,
      include: {
        parent: { select: { name: true } },
        timeSlot: true
      }
    })
    console.log(`✅ Found ${bookings.length} bookings in database`)
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()
