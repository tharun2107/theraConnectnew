import prisma from '../../utils/prisma'

// Temporary enum until Prisma generates
enum DemoBookingStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Convert 24-hour time to 12-hour with AM/PM
function formatTime12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hours12 = hours % 12 || 12
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
}

// Get available demo slots with timezone conversion
export async function getAvailableDemoSlots(userTimezone?: string, selectedDate?: string) {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  
  // Admin timezone (default to Asia/Kolkata for India)
  const adminTimezone = process.env.ADMIN_TIMEZONE || 'Asia/Kolkata'

  // Build date filter - include today and future dates only
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  today.setHours(0, 0, 0, 0)
  
  const dateFilter: any = {
    gte: today, // Only today and future dates
  }
  
  // Determine which month/year to query based on selected date or current date
  let targetMonth = currentMonth
  let targetYear = currentYear

  // If specific date requested, filter by that date (must be today or future)
  if (selectedDate) {
    // Parse YYYY-MM-DD string as local date components
    const [year, month, day] = selectedDate.split('-').map(Number)
    const targetDate = new Date(year, month - 1, day)
    targetDate.setHours(0, 0, 0, 0)
    
    // Only allow dates that are today or in the future
    if (targetDate >= today) {
      const startOfDay = new Date(year, month - 1, day)
      const endOfDay = new Date(startOfDay)
      endOfDay.setDate(endOfDay.getDate() + 1)
      dateFilter.gte = startOfDay
      dateFilter.lt = endOfDay
      
      // Use the selected date's month/year for query
      targetMonth = month
      targetYear = year
    } else {
      // If past date requested, return empty
      return []
    }
  }

  // Get all active slots for the target month/year
  let slotsWhere: any = {
    year: targetYear,
    month: targetMonth,
    isActive: true,
    date: dateFilter,
  }
  
  // Include next month if we're past day 20 and no specific date selected
  if (!selectedDate && now.getDate() > 20) {
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear
    
    slotsWhere = {
      OR: [
        {
          year: currentYear,
          month: currentMonth,
          isActive: true,
          date: dateFilter,
        },
        {
          year: nextYear,
          month: nextMonth,
          isActive: true,
          date: dateFilter,
        },
      ],
    }
  }
  
  const slots = await prisma.demoSlot.findMany({
    where: slotsWhere,
    orderBy: {
      date: 'asc',
    },
  })

  // Filter out weekends (Saturday=6, Sunday=0)
  const weekdaySlots = slots.filter((slot: any) => {
    const slotDate = new Date(slot.date)
    const dayOfWeek = slotDate.getDay()
    return dayOfWeek !== 0 && dayOfWeek !== 6 // Not Sunday or Saturday
  })

  // Get all bookings for these slots in one query for better performance
  // Only include SCHEDULED bookings (not COMPLETED or CANCELLED)
  // Normalize slot dates to YYYY-MM-DD for consistent comparison
  const slotDateMap = new Map<string, string[]>() // date -> hours array
  
  for (const slot of weekdaySlots) {
    const slotDate = new Date(slot.date)
    // Extract date components in local timezone to avoid UTC conversion issues
    const year = slotDate.getFullYear()
    const month = slotDate.getMonth() + 1
    const day = slotDate.getDate()
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    if (!slotDateMap.has(dateKey)) {
      slotDateMap.set(dateKey, [])
    }
    slotDateMap.get(dateKey)!.push(slot.hour.toString())
  }
  
  const slotDateStrings = Array.from(slotDateMap.keys()).sort()
  
  // Create a set of booked slots for quick lookup
  let bookedSlots = new Set<string>()
  
  if (slotDateStrings.length > 0) {
    // Get all SCHEDULED bookings for these dates
    // Parse dates in local timezone to avoid UTC issues
    const startDateStr = slotDateStrings[0]
    const endDateStr = slotDateStrings[slotDateStrings.length - 1]
    const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number)
    const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number)
    
    const startDate = new Date(startYear, startMonth - 1, startDay)
    const endDate = new Date(endYear, endMonth - 1, endDay)
    endDate.setHours(23, 59, 59, 999)
    
    const bookings = await prisma.demoBooking.findMany({
      where: {
        status: DemoBookingStatus.SCHEDULED, // Only block SCHEDULED bookings
        slotDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        slotDate: true,
        slotHour: true,
      },
    })
    
    // Filter bookings and normalize dates to YYYY-MM-DD format for accurate comparison
    const validBookings = bookings.filter((b: any) => {
      const bookingDate = new Date(b.slotDate)
      const year = bookingDate.getFullYear()
      const month = bookingDate.getMonth() + 1
      const day = bookingDate.getDate()
      const bookingDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      
      // Check if this date exists in our slot dates
      if (!slotDateStrings.includes(bookingDateStr)) {
        return false
      }
      
      // Create the booked slot key
      const slotKey = `${bookingDateStr}-${b.slotHour}`
      return true
    })

    // Create booked slots set with normalized dates
    bookedSlots = new Set(
      validBookings.map((b: any) => {
        const bookingDate = new Date(b.slotDate)
        const year = bookingDate.getFullYear()
        const month = bookingDate.getMonth() + 1
        const day = bookingDate.getDate()
        const bookingDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        return `${bookingDateStr}-${b.slotHour}`
      })
    )
  }

  // Group by date and convert timezone if needed
  const groupedSlots: Record<string, any[]> = {}

  for (const slot of weekdaySlots) {
    // Normalize date to YYYY-MM-DD in local timezone (not UTC)
    const slotDate = new Date(slot.date)
    const year = slotDate.getFullYear()
    const month = slotDate.getMonth() + 1
    const day = slotDate.getDate()
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const slotKey = `${dateKey}-${slot.hour}`

    // Skip if already booked (check with normalized date)
    if (bookedSlots.has(slotKey)) {
      continue // This slot is booked, skip it - do not display it
    }

    // Convert timezone if user timezone is provided
    let displayTime = slot.timeString
    
    if (userTimezone && adminTimezone) {
      try {
        // Parse admin's time (e.g., "13:00" for 1pm in India)
        const [adminHours, adminMinutes] = slot.timeString.split(':').map(Number)
        // Use already normalized date components (year, month, day from above - they're already extracted)
        
        // Simple and reliable timezone conversion:
        // 1. Find UTC timestamp where admin timezone shows the desired time
        // 2. Convert that UTC to user's timezone
        
        // Method: Calculate timezone offset and apply it
        // Create a test date at noon UTC to calculate offset
        const testUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
        
        // Get what 12:00 UTC shows in admin timezone
        const adminNoonStr = new Intl.DateTimeFormat('en-US', {
          timeZone: adminTimezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(testUTC)
        
        const [adminNoonH, adminNoonM] = adminNoonStr.split(':').map(Number)
        const adminNoonMinutes = adminNoonH * 60 + adminNoonM
        const utcNoonMinutes = 12 * 60 // 12:00 = 720 minutes
        const adminOffsetMinutes = adminNoonMinutes - utcNoonMinutes
        
        // Get what 12:00 UTC shows in user timezone
        const userNoonStr = new Intl.DateTimeFormat('en-US', {
          timeZone: userTimezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(testUTC)
        
        const [userNoonH, userNoonM] = userNoonStr.split(':').map(Number)
        const userNoonMinutes = userNoonH * 60 + userNoonM
        const userOffsetMinutes = userNoonMinutes - utcNoonMinutes
        
        // Calculate timezone difference
        const offsetDiff = userOffsetMinutes - adminOffsetMinutes
        
        // Apply offset to admin's time
        const adminTimeMinutes = adminHours * 60 + adminMinutes
        const userTimeMinutes = (adminTimeMinutes + offsetDiff + 1440) % 1440 // Add 1440 to handle negatives, mod 24h
        const userHours = Math.floor(userTimeMinutes / 60)
        const userMinutes = userTimeMinutes % 60
        
        displayTime = `${String(userHours).padStart(2, '0')}:${String(userMinutes).padStart(2, '0')}`
      } catch (e) {
        console.error('Timezone conversion error:', e)
        displayTime = slot.timeString
      }
    }

    // Format time with AM/PM
    const displayTime12Hour = formatTime12Hour(displayTime)

    if (!groupedSlots[dateKey]) {
      groupedSlots[dateKey] = []
    }

    groupedSlots[dateKey].push({
      id: slot.id,
      date: dateKey,
      hour: slot.hour, // Keep original admin hour for booking
      timeString: displayTime12Hour, // Display time in user's timezone with AM/PM
      originalTimeString: slot.timeString, // Admin's original time
      originalHour: slot.hour, // Original admin hour
    })
  }

  // Convert to array format and sort by date
  const result = Object.entries(groupedSlots).map(([date, slots]) => ({
    date,
    slots: slots.sort((a, b) => a.originalHour - b.originalHour), // Sort by admin's original hour
  }))

  return result
}

// Create demo booking
export async function createDemoBooking(data: {
  name: string
  mobile: string
  email: string
  reason: string
  slotDate: string
  slotHour: number // This is the admin's original hour from the slot
  slotTimeString: string // This is the admin's original time string
  userTimezone?: string // User's timezone for email conversion
}) {
  // slotHour and slotTimeString should be the admin's original values, not user's converted time
  const slotDate = new Date(data.slotDate)
  
  // Find the demo slot by date and admin's original hour
  let demoSlot = await prisma.demoSlot.findFirst({
    where: {
      date: slotDate,
      hour: data.slotHour,
    },
  })

  if (!demoSlot) {
    throw new Error('Selected slot not found. Please select a valid time slot.')
  }

  // Check if slot is already booked
  const existingBooking = await prisma.demoBooking.findFirst({
    where: {
      slotDate: slotDate,
      slotHour: data.slotHour,
      status: {
        not: DemoBookingStatus.CANCELLED,
      },
    },
  })

  if (existingBooking) {
    throw new Error('This time slot is already booked')
  }

  // Create booking with admin's original time
  const booking = await prisma.demoBooking.create({
    data: {
      name: data.name,
      mobile: data.mobile,
      email: data.email,
      reason: data.reason,
      slotDate: slotDate,
      slotHour: data.slotHour, // Admin's original hour
      slotTimeString: demoSlot.timeString, // Admin's original time string
      demoSlotId: demoSlot.id,
      status: DemoBookingStatus.SCHEDULED,
    },
  })

  return booking
}

// Get demo booking by ID
export async function getDemoBookingById(bookingId: string) {
  return await prisma.demoBooking.findUnique({
    where: { id: bookingId },
    include: { demoSlot: true },
  })
}

// Update demo booking zoom details
export async function updateDemoBookingZoomDetails(
  bookingId: string,
  data: {
    meetingId: string
    meetingPassword: string
    zoomLink: string
  }
) {
  return await prisma.demoBooking.update({
    where: { id: bookingId },
    data: {
      meetingId: data.meetingId,
      meetingPassword: data.meetingPassword,
      zoomLink: data.zoomLink,
    },
  })
}

// Get all demo bookings
export async function getAllDemoBookings() {
  return await prisma.demoBooking.findMany({
    include: { demoSlot: true },
    orderBy: { createdAt: 'desc' },
  })
}

// Get demo booking history
export async function getDemoBookingHistory() {
  return await prisma.demoBooking.findMany({
    include: { demoSlot: true },
    orderBy: { slotDate: 'desc' },
  })
}

// Update demo booking notes
export async function updateDemoBookingNotes(
  bookingId: string,
  data: {
    userQuery?: string
    converted?: boolean
    additionalNotes?: string
  }
) {
  return await prisma.demoBooking.update({
    where: { id: bookingId },
    data: {
      userQuery: data.userQuery,
      converted: data.converted !== undefined ? data.converted : undefined,
      additionalNotes: data.additionalNotes,
    },
  })
}

// Get admin demo slots
export async function getAdminDemoSlots(month?: number, year?: number) {
  const now = new Date()
  const targetMonth = month || now.getMonth() + 1
  const targetYear = year || now.getFullYear()

  return await prisma.demoSlot.findMany({
    where: {
      month: targetMonth,
      year: targetYear,
    },
    include: {
      _count: {
        select: {
          bookings: {
            where: {
              status: {
                not: DemoBookingStatus.CANCELLED,
              },
            },
          },
        },
      },
    },
    orderBy: [
      { date: 'asc' },
      { hour: 'asc' },
    ],
  })
}

// Create admin demo slots for a month
export async function createAdminDemoSlots(
  month: number,
  year: number,
  slotTimes: string[] // Array of 8 time strings
) {
  // Delete existing slots for this month
  await prisma.demoSlot.deleteMany({
    where: {
      month,
      year,
    },
  })

  // Get all dates in the month (excluding weekends)
  const dates: Date[] = []
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)

  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Not Sunday or Saturday
      dates.push(new Date(d))
    }
  }

  // Create slots for each weekday
  const slots = []
  for (const date of dates) {
    for (const timeString of slotTimes) {
      const [hours, minutes] = timeString.split(':').map(Number)
      const hour = hours

      slots.push({
        date,
        hour,
        timeString,
        isActive: true,
        month,
        year,
      })
    }
  }

  // Create all slots in batch
  await prisma.demoSlot.createMany({
    data: slots,
    skipDuplicates: true,
  })

  return await prisma.demoSlot.findMany({
    where: { month, year },
    orderBy: [{ date: 'asc' }, { hour: 'asc' }],
  })
}

// Update admin demo slots for a month
export async function updateAdminDemoSlots(
  month: number,
  year: number,
  slotTimes: string[] // Array of 8 time strings
) {
  return await createAdminDemoSlots(month, year, slotTimes)
}

