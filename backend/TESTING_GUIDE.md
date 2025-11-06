# Backend Testing Guide

This guide helps you test the Leave Management and Recurring Booking features.

## Prerequisites

1. **Backend running**: `npm run dev` or `npm start`
2. **Database migrated**: `npx prisma migrate dev`
3. **Test users created**: Parent, Therapist, and Admin accounts

## Getting Authentication Token

First, login to get a JWT token:

```bash
# Login as Parent
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "parent@example.com",
    "password": "password123"
  }'

# Login as Therapist
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "therapist@example.com",
    "password": "password123"
  }'

# Login as Admin
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Save the token** for subsequent requests:
```bash
export PARENT_TOKEN="your_parent_token_here"
export THERAPIST_TOKEN="your_therapist_token_here"
export ADMIN_TOKEN="your_admin_token_here"
```

---

## 🗓️ Testing Leave Management

### 1. Therapist Requests Leave

**Endpoint:** `POST /api/v1/therapist/leaves`

```bash
curl -X POST http://localhost:3000/api/v1/therapist/leaves \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $THERAPIST_TOKEN" \
  -d '{
    "date": "2024-12-15",
    "type": "CASUAL",
    "reason": "Personal work"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Leave request submitted successfully. Admin will review your request.",
  "data": {
    "leaveId": "clxxx...",
    "date": "2024-12-15T00:00:00.000Z",
    "type": "CASUAL",
    "status": "PENDING"
  }
}
```

**Test Cases:**
- ✅ Valid leave request
- ✅ Past date (should fail)
- ✅ Invalid leave type (should fail)
- ✅ No leaves remaining (should fail for OPTIONAL)

---

### 2. Therapist Views Their Leaves

**Endpoint:** `GET /api/v1/therapist/leaves`

```bash
curl -X GET http://localhost:3000/api/v1/therapist/leaves \
  -H "Authorization: Bearer $THERAPIST_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "leaves": [
      {
        "id": "clxxx...",
        "date": "2024-12-15",
        "type": "CASUAL",
        "status": "PENDING",
        "reason": "Personal work",
        "createdAt": "2024-12-01T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 3. Admin Views All Leave Requests

**Endpoint:** `GET /api/v1/admin/leaves`

```bash
# Get all leaves
curl -X GET http://localhost:3000/api/v1/admin/leaves \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Get only PENDING leaves
curl -X GET "http://localhost:3000/api/v1/admin/leaves?status=PENDING" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "leaves": [
      {
        "id": "clxxx...",
        "date": "2024-12-15",
        "type": "CASUAL",
        "status": "PENDING",
        "therapist": {
          "name": "Dr. John Doe",
          "id": "clxxx..."
        }
      }
    ]
  }
}
```

---

### 4. Admin Approves Leave

**Endpoint:** `PUT /api/v1/admin/leaves/:leaveId`

```bash
curl -X PUT http://localhost:3000/api/v1/admin/leaves/clxxx... \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "action": "APPROVE",
    "adminNotes": "Approved for personal work"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Leave request approved successfully",
  "data": {
    "leaveId": "clxxx...",
    "status": "APPROVED"
  }
}
```

**What to Check:**
- ✅ Leave status changed to APPROVED
- ✅ Affected bookings cancelled (if any)
- ✅ Therapist and parents notified
- ✅ Leave balance decremented

---

### 5. Admin Rejects Leave

**Endpoint:** `PUT /api/v1/admin/leaves/:leaveId`

```bash
curl -X PUT http://localhost:3000/api/v1/admin/leaves/clxxx... \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "action": "REJECT",
    "adminNotes": "Not enough notice given"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Leave request rejected",
  "data": {
    "leaveId": "clxxx...",
    "status": "REJECTED"
  }
}
```

---

## 📅 Testing Recurring Bookings

### 1. Create Recurring Booking (Daily)

**Endpoint:** `POST /api/v1/bookings/recurring`

```bash
curl -X POST http://localhost:3000/api/v1/bookings/recurring \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PARENT_TOKEN" \
  -d '{
    "childId": "clxxx...",
    "therapistId": "clxxx...",
    "slotTime": "14:00",
    "recurrencePattern": "DAILY",
    "startDate": "2024-12-01",
    "endDate": "2024-12-31"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Recurring booking created successfully. Your child now has daily sessions!",
  "data": {
    "recurringBookingId": "clxxx...",
    "slotTime": "14:00",
    "startDate": "2024-12-01",
    "endDate": "2024-12-31",
    "recurrencePattern": "DAILY"
  }
}
```

**What to Check:**
- ✅ Recurring booking created
- ✅ Individual bookings generated (excluding weekends)
- ✅ Payments created for each booking
- ✅ Data access permissions created

---

### 2. Create Recurring Booking (Weekly)

**Endpoint:** `POST /api/v1/bookings/recurring`

```bash
curl -X POST http://localhost:3000/api/v1/bookings/recurring \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PARENT_TOKEN" \
  -d '{
    "childId": "clxxx...",
    "therapistId": "clxxx...",
    "slotTime": "10:00",
    "recurrencePattern": "WEEKLY",
    "dayOfWeek": "MONDAY",
    "startDate": "2024-12-01",
    "endDate": "2024-12-31"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Recurring booking created successfully. Your child now has daily sessions!",
  "data": {
    "recurringBookingId": "clxxx...",
    "slotTime": "10:00",
    "recurrencePattern": "WEEKLY",
    "dayOfWeek": "MONDAY",
    "startDate": "2024-12-01",
    "endDate": "2024-12-31"
  }
}
```

**What to Check:**
- ✅ Only Mondays in the date range have bookings
- ✅ Weekends excluded
- ✅ Correct time slots created

---

### 3. Get All Recurring Bookings

**Endpoint:** `GET /api/v1/bookings/recurring`

```bash
curl -X GET http://localhost:3000/api/v1/bookings/recurring \
  -H "Authorization: Bearer $PARENT_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Recurring bookings retrieved successfully",
  "data": {
    "totalRecurringBookings": 2,
    "recurringBookings": [
      {
        "id": "clxxx...",
        "slotTime": "14:00",
        "recurrencePattern": "DAILY",
        "startDate": "2024-12-01",
        "endDate": "2024-12-31",
        "isActive": true,
        "child": { "name": "Alice", "id": "clxxx..." },
        "therapist": { "name": "Dr. John", "id": "clxxx..." },
        "bookings": [
          {
            "id": "clxxx...",
            "status": "SCHEDULED",
            "timeSlot": {
              "startTime": "2024-12-01T14:00:00.000Z",
              "endTime": "2024-12-01T15:00:00.000Z"
            }
          }
        ]
      }
    ]
  }
}
```

---

### 4. Get Upcoming Sessions for Recurring Booking

**Endpoint:** `GET /api/v1/bookings/recurring/:recurringBookingId/sessions`

```bash
curl -X GET http://localhost:3000/api/v1/bookings/recurring/clxxx.../sessions \
  -H "Authorization: Bearer $PARENT_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Upcoming sessions retrieved successfully",
  "data": {
    "totalUpcomingSessions": 15,
    "sessions": [
      {
        "id": "clxxx...",
        "status": "SCHEDULED",
        "timeSlot": {
          "startTime": "2024-12-02T14:00:00.000Z",
          "endTime": "2024-12-02T15:00:00.000Z"
        },
        "child": { "name": "Alice" },
        "therapist": { "name": "Dr. John" }
      }
    ]
  }
}
```

---

### 5. Cancel Recurring Booking

**Endpoint:** `DELETE /api/v1/bookings/recurring/:recurringBookingId`

```bash
curl -X DELETE http://localhost:3000/api/v1/bookings/recurring/clxxx... \
  -H "Authorization: Bearer $PARENT_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Recurring booking cancelled successfully. All future sessions have been cancelled.",
  "data": {
    "recurringBookingId": "clxxx...",
    "isActive": false
  }
}
```

**What to Check:**
- ✅ Recurring booking marked as inactive
- ✅ Future bookings cancelled (status = CANCELLED_BY_PARENT)
- ✅ Past bookings remain unchanged
- ✅ Time slots freed up

---

## 🧪 Test Scenarios

### Scenario 1: Leave Affects Recurring Bookings

1. Create a recurring booking for a month
2. Therapist requests leave on a date within that month
3. Admin approves the leave
4. **Expected:** The booking for that date should be cancelled

### Scenario 2: Weekly Recurring Booking

1. Create weekly recurring booking (MONDAY, 10:00 AM)
2. **Expected:** Only Mondays have bookings
3. **Expected:** Weekends excluded

### Scenario 3: Daily Recurring Booking

1. Create daily recurring booking (14:00)
2. **Expected:** All weekdays have bookings
3. **Expected:** Weekends excluded

### Scenario 4: Leave Balance Tracking

1. Therapist requests CASUAL leave
2. Admin approves
3. **Expected:** `casualRemaining` decremented
4. **Expected:** Next leave request shows updated balance

---

## 🔍 Database Verification

Check the database directly to verify:

```sql
-- Check recurring bookings
SELECT * FROM "RecurringBooking" WHERE "isActive" = true;

-- Check generated bookings
SELECT * FROM "Booking" WHERE "recurringBookingId" IS NOT NULL;

-- Check leave requests
SELECT * FROM "TherapistLeave" ORDER BY "createdAt" DESC;

-- Check leave balances
SELECT 
  id, 
  type, 
  status, 
  "casualRemaining", 
  "sickRemaining", 
  "festiveRemaining", 
  "optionalRemaining"
FROM "TherapistLeave" 
WHERE "therapistId" = 'your_therapist_id'
ORDER BY "date" DESC;
```

---

## 📝 Postman Collection

You can import these into Postman:

### Environment Variables
- `base_url`: `http://localhost:3000/api/v1`
- `parent_token`: Your parent JWT token
- `therapist_token`: Your therapist JWT token
- `admin_token`: Your admin JWT token

### Collection Structure
```
TheraConnect API
├── Authentication
│   ├── Login Parent
│   ├── Login Therapist
│   └── Login Admin
├── Leave Management
│   ├── Request Leave (Therapist)
│   ├── Get My Leaves (Therapist)
│   ├── Get All Leaves (Admin)
│   ├── Approve Leave (Admin)
│   └── Reject Leave (Admin)
└── Recurring Bookings
    ├── Create Recurring Booking (Daily)
    ├── Create Recurring Booking (Weekly)
    ├── Get All Recurring Bookings
    ├── Get Upcoming Sessions
    └── Cancel Recurring Booking
```

---

## ✅ Checklist

### Leave Management
- [ ] Therapist can request leave
- [ ] Therapist can view their leaves
- [ ] Admin can view all leave requests
- [ ] Admin can approve leave
- [ ] Admin can reject leave
- [ ] Approved leave cancels affected bookings
- [ ] Leave balance tracking works
- [ ] Notifications sent correctly

### Recurring Bookings
- [ ] Create daily recurring booking
- [ ] Create weekly recurring booking
- [ ] Individual bookings generated correctly
- [ ] Weekends excluded
- [ ] Payments created for each booking
- [ ] Data access permissions created
- [ ] Get all recurring bookings
- [ ] Get upcoming sessions
- [ ] Cancel recurring booking
- [ ] Future bookings cancelled on cancel

---

## 🐛 Common Issues

1. **"Leave not found"**: Check leave ID is correct
2. **"Child already has active recurring booking"**: Cancel existing one first
3. **"No leaves remaining"**: Check leave balance in database
4. **"Therapist not found"**: Ensure therapist is ACTIVE
5. **Date format errors**: Use YYYY-MM-DD format

---

## 📊 Expected Database State

After creating a daily recurring booking for December 2024:
- **RecurringBooking**: 1 record
- **Booking**: ~22 records (weekdays only)
- **Payment**: ~22 records
- **DataAccessPermission**: ~22 records
- **TimeSlot**: ~22 records (all marked as booked)

---

## 🚀 Quick Test Script

Save this as `test-backend.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000/api/v1"

# Login and get tokens
echo "Logging in..."
PARENT_TOKEN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"parent@example.com","password":"password123"}' | jq -r '.token')

THERAPIST_TOKEN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"therapist@example.com","password":"password123"}' | jq -r '.token')

# Test leave request
echo "Testing leave request..."
curl -X POST $BASE_URL/therapist/leaves \
  -H "Authorization: Bearer $THERAPIST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"date":"2024-12-15","type":"CASUAL","reason":"Test"}'

# Test recurring booking
echo "Testing recurring booking..."
curl -X POST $BASE_URL/bookings/recurring \
  -H "Authorization: Bearer $PARENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "childId":"your_child_id",
    "therapistId":"your_therapist_id",
    "slotTime":"14:00",
    "recurrencePattern":"DAILY",
    "startDate":"2024-12-01",
    "endDate":"2024-12-31"
  }'

echo "Tests completed!"
```

Make it executable: `chmod +x test-backend.sh`

