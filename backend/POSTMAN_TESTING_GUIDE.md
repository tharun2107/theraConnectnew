# Postman Testing Guide - Recurring Bookings & Leave Management

Complete URLs and JSON payloads for testing all endpoints.

## 🔐 Step 1: Get Authentication Tokens

### Login as Parent
**Method:** `POST`  
**URL:** `http://localhost:3000/api/v1/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "parent@example.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "user": {
    "id": "clxxx...",
    "email": "parent@example.com",
    "role": "PARENT"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Save the token** - Copy the `token` value for subsequent requests.

---

### Login as Therapist
**Method:** `POST`  
**URL:** `http://localhost:3000/api/v1/auth/login`

**Body (JSON):**
```json
{
  "email": "therapist@example.com",
  "password": "password123"
}
```

---

### Login as Admin
**Method:** `POST`  
**URL:** `http://localhost:3000/api/v1/auth/login`

**Body (JSON):**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

---

## 📅 RECURRING BOOKINGS - Complete Testing

### 1. Create Daily Recurring Booking

**Method:** `POST`  
**URL:** `http://localhost:3000/api/v1/bookings/recurring`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_PARENT_TOKEN_HERE
```

**Body (JSON):**
```json
{
  "childId": "clxxx...",
  "therapistId": "clxxx...",
  "slotTime": "14:00",
  "recurrencePattern": "DAILY",
  "startDate": "2024-12-01",
  "endDate": "2024-12-31"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Recurring booking created successfully. Your child now has daily sessions!",
  "data": {
    "recurringBookingId": "clxxx...",
    "slotTime": "14:00",
    "startDate": "2024-12-01T00:00:00.000Z",
    "endDate": "2024-12-31T00:00:00.000Z",
    "recurrencePattern": "DAILY"
  }
}
```

---

### 2. Create Weekly Recurring Booking (Every Monday)

**Method:** `POST`  
**URL:** `http://localhost:3000/api/v1/bookings/recurring`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_PARENT_TOKEN_HERE
```

**Body (JSON):**
```json
{
  "childId": "clxxx...",
  "therapistId": "clxxx...",
  "slotTime": "10:00",
  "recurrencePattern": "WEEKLY",
  "dayOfWeek": "MONDAY",
  "startDate": "2024-12-01",
  "endDate": "2024-12-31"
}
```

**Valid `dayOfWeek` values:**
- `MONDAY`
- `TUESDAY`
- `WEDNESDAY`
- `THURSDAY`
- `FRIDAY`
- `SATURDAY`

---

### 3. Create Weekly Recurring Booking (Every Wednesday)

**Method:** `POST`  
**URL:** `http://localhost:3000/api/v1/bookings/recurring`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_PARENT_TOKEN_HERE
```

**Body (JSON):**
```json
{
  "childId": "clxxx...",
  "therapistId": "clxxx...",
  "slotTime": "15:30",
  "recurrencePattern": "WEEKLY",
  "dayOfWeek": "WEDNESDAY",
  "startDate": "2024-12-01",
  "endDate": "2024-12-31"
}
```

---

### 4. Get All Recurring Bookings

**Method:** `GET`  
**URL:** `http://localhost:3000/api/v1/bookings/recurring`

**Headers:**
```
Authorization: Bearer YOUR_PARENT_TOKEN_HERE
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
        "isActive": true,
        "createdAt": "2024-12-01T10:00:00.000Z",
        "recurrencePattern": "DAILY",
        "dayOfWeek": null,
        "slotTime": "14:00",
        "startDate": "2024-12-01T00:00:00.000Z",
        "endDate": "2024-12-31T00:00:00.000Z",
        "parentId": "clxxx...",
        "childId": "clxxx...",
        "therapistId": "clxxx...",
        "child": {
          "id": "clxxx...",
          "name": "Alice",
          "age": 8
        },
        "therapist": {
          "id": "clxxx...",
          "name": "Dr. John Doe",
          "specialization": "Child Psychology"
        },
        "bookings": [
          {
            "id": "clxxx...",
            "status": "SCHEDULED",
            "timeSlot": {
              "id": "clxxx...",
              "startTime": "2024-12-02T14:00:00.000Z",
              "endTime": "2024-12-02T15:00:00.000Z"
            }
          }
        ]
      }
    ]
  }
}
```

---

### 5. Get Upcoming Sessions for a Recurring Booking

**Method:** `GET`  
**URL:** `http://localhost:3000/api/v1/bookings/recurring/{recurringBookingId}/sessions`

**Example URL:**
```
http://localhost:3000/api/v1/bookings/recurring/clxxx1234567890/sessions
```

**Headers:**
```
Authorization: Bearer YOUR_PARENT_TOKEN_HERE
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
        "createdAt": "2024-12-01T10:00:00.000Z",
        "timeSlot": {
          "id": "clxxx...",
          "startTime": "2024-12-02T14:00:00.000Z",
          "endTime": "2024-12-02T15:00:00.000Z",
          "isBooked": true,
          "isActive": true
        },
        "child": {
          "id": "clxxx...",
          "name": "Alice",
          "age": 8
        },
        "therapist": {
          "id": "clxxx...",
          "name": "Dr. John Doe",
          "specialization": "Child Psychology"
        }
      }
    ]
  }
}
```

---

### 6. Cancel Recurring Booking

**Method:** `DELETE`  
**URL:** `http://localhost:3000/api/v1/bookings/recurring/{recurringBookingId}`

**Example URL:**
```
http://localhost:3000/api/v1/bookings/recurring/clxxx1234567890
```

**Headers:**
```
Authorization: Bearer YOUR_PARENT_TOKEN_HERE
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

---

## 🗓️ LEAVE MANAGEMENT - Complete Testing

### 1. Therapist Requests Leave

**Method:** `POST`  
**URL:** `http://localhost:3000/api/v1/therapist/leaves`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_THERAPIST_TOKEN_HERE
```

**Body (JSON) - CASUAL Leave:**
```json
{
  "date": "2024-12-15",
  "type": "CASUAL",
  "reason": "Personal work"
}
```

**Body (JSON) - SICK Leave:**
```json
{
  "date": "2024-12-20",
  "type": "SICK",
  "reason": "Feeling unwell"
}
```

**Body (JSON) - FESTIVE Leave:**
```json
{
  "date": "2024-12-25",
  "type": "FESTIVE",
  "reason": "Christmas holiday"
}
```

**Body (JSON) - OPTIONAL Leave:**
```json
{
  "date": "2024-12-10",
  "type": "OPTIONAL",
  "reason": "Family event"
}
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

---

### 2. Therapist Views Their Leaves

**Method:** `GET`  
**URL:** `http://localhost:3000/api/v1/therapist/leaves`

**Headers:**
```
Authorization: Bearer YOUR_THERAPIST_TOKEN_HERE
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "leaves": [
      {
        "id": "clxxx...",
        "date": "2024-12-15T00:00:00.000Z",
        "type": "CASUAL",
        "status": "PENDING",
        "reason": "Personal work",
        "createdAt": "2024-12-01T10:00:00.000Z",
        "casualRemaining": null,
        "sickRemaining": null,
        "festiveRemaining": null,
        "optionalRemaining": null
      }
    ]
  }
}
```

---

### 3. Admin Views All Leave Requests

**Method:** `GET`  
**URL:** `http://localhost:3000/api/v1/admin/leaves`

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "leaves": [
      {
        "id": "clxxx...",
        "date": "2024-12-15T00:00:00.000Z",
        "type": "CASUAL",
        "status": "PENDING",
        "reason": "Personal work",
        "createdAt": "2024-12-01T10:00:00.000Z",
        "therapist": {
          "id": "clxxx...",
          "name": "Dr. John Doe",
          "userId": "clxxx..."
        }
      }
    ]
  }
}
```

---

### 4. Admin Gets Leave Details

**Method:** `GET`  
**URL:** `http://localhost:3000/api/v1/admin/leaves/{leaveId}`

**Example URL:**
```
http://localhost:3000/api/v1/admin/leaves/clxxx1234567890
```

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "leave": {
      "id": "clxxx...",
      "date": "2024-12-15T00:00:00.000Z",
      "type": "CASUAL",
      "status": "PENDING",
      "reason": "Personal work",
      "createdAt": "2024-12-01T10:00:00.000Z",
      "therapist": {
        "id": "clxxx...",
        "name": "Dr. John Doe",
        "phone": "+1234567890"
      },
      "affectedBookings": []
    }
  }
}
```

---

### 5. Admin Approves Leave

**Method:** `PUT`  
**URL:** `http://localhost:3000/api/v1/admin/leaves/{leaveId}`

**Example URL:**
```
http://localhost:3000/api/v1/admin/leaves/clxxx1234567890
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
```

**Body (JSON):**
```json
{
  "action": "APPROVE",
  "adminNotes": "Approved for personal work"
}
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

---

### 6. Admin Rejects Leave

**Method:** `PUT`  
**URL:** `http://localhost:3000/api/v1/admin/leaves/{leaveId}`

**Example URL:**
```
http://localhost:3000/api/v1/admin/leaves/clxxx1234567890
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
```

**Body (JSON):**
```json
{
  "action": "REJECT",
  "adminNotes": "Not enough notice given. Please request at least 3 days in advance."
}
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

## 📋 Complete Test Flow Example

### Scenario: Create Recurring Booking and Test Leave Impact

**Step 1: Get IDs**
```bash
# Get child ID (from parent profile)
GET http://localhost:3000/api/v1/parents/profile
Authorization: Bearer YOUR_PARENT_TOKEN

# Get therapist ID (from therapist list)
GET http://localhost:3000/api/v1/admin/therapists
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Step 2: Create Recurring Booking**
```json
POST http://localhost:3000/api/v1/bookings/recurring
Authorization: Bearer YOUR_PARENT_TOKEN
Content-Type: application/json

{
  "childId": "clxxx...",
  "therapistId": "clxxx...",
  "slotTime": "14:00",
  "recurrencePattern": "DAILY",
  "startDate": "2024-12-01",
  "endDate": "2024-12-31"
}
```

**Step 3: Verify Bookings Created**
```bash
GET http://localhost:3000/api/v1/bookings/me
Authorization: Bearer YOUR_PARENT_TOKEN
```

**Step 4: Therapist Requests Leave**
```json
POST http://localhost:3000/api/v1/therapist/leaves
Authorization: Bearer YOUR_THERAPIST_TOKEN
Content-Type: application/json

{
  "date": "2024-12-15",
  "type": "CASUAL",
  "reason": "Personal work"
}
```

**Step 5: Admin Approves Leave**
```json
PUT http://localhost:3000/api/v1/admin/leaves/{leaveId}
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "action": "APPROVE",
  "adminNotes": "Approved"
}
```

**Step 6: Verify Booking Cancelled**
```bash
GET http://localhost:3000/api/v1/bookings/me
Authorization: Bearer YOUR_PARENT_TOKEN
```

**Expected:** The booking for 2024-12-15 should have status `CANCELLED_BY_THERAPIST`

---

## 🔍 Additional Helper Endpoints

### Get My Bookings (Parent/Therapist)
**Method:** `GET`  
**URL:** `http://localhost:3000/api/v1/bookings/me`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### Get Available Slots
**Method:** `GET`  
**URL:** `http://localhost:3000/api/v1/bookings/slots?therapistId=clxxx...&date=2024-12-15`

**Headers:**
```
Authorization: Bearer YOUR_PARENT_TOKEN_HERE
```

---

## 📝 Postman Environment Variables

Create a Postman Environment with:

```json
{
  "base_url": "http://localhost:3000/api/v1",
  "parent_token": "your_parent_token_here",
  "therapist_token": "your_therapist_token_here",
  "admin_token": "your_admin_token_here",
  "child_id": "clxxx...",
  "therapist_id": "clxxx...",
  "recurring_booking_id": "clxxx...",
  "leave_id": "clxxx..."
}
```

Then use in URLs:
```
{{base_url}}/bookings/recurring
Authorization: Bearer {{parent_token}}
```

---

## ✅ Testing Checklist

### Recurring Bookings
- [ ] Create daily recurring booking
- [ ] Create weekly recurring booking (MONDAY)
- [ ] Create weekly recurring booking (WEDNESDAY)
- [ ] Get all recurring bookings
- [ ] Get upcoming sessions for recurring booking
- [ ] Cancel recurring booking
- [ ] Verify individual bookings created
- [ ] Verify payments created
- [ ] Verify weekends excluded

### Leave Management
- [ ] Request CASUAL leave
- [ ] Request SICK leave
- [ ] Request FESTIVE leave
- [ ] Request OPTIONAL leave
- [ ] Get therapist leaves
- [ ] Admin views all leaves
- [ ] Admin approves leave
- [ ] Admin rejects leave
- [ ] Verify bookings cancelled on leave approval
- [ ] Verify leave balance tracking

---

## 🐛 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Start date cannot be in the past"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Child not found or does not belong to this parent"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Child already has an active recurring booking with this therapist"
}
```

### 403 Forbidden
```json
{
  "message": "Forbidden: Access denied."
}
```

---

## 📊 Sample Data for Testing

### Valid Recurring Booking (Daily)
```json
{
  "childId": "clxxx...",
  "therapistId": "clxxx...",
  "slotTime": "14:00",
  "recurrencePattern": "DAILY",
  "startDate": "2024-12-01",
  "endDate": "2024-12-31"
}
```

### Valid Recurring Booking (Weekly - Monday)
```json
{
  "childId": "clxxx...",
  "therapistId": "clxxx...",
  "slotTime": "10:00",
  "recurrencePattern": "WEEKLY",
  "dayOfWeek": "MONDAY",
  "startDate": "2024-12-01",
  "endDate": "2024-12-31"
}
```

### Valid Leave Request
```json
{
  "date": "2024-12-15",
  "type": "CASUAL",
  "reason": "Personal work"
}
```

---

## 🚀 Quick Test Commands (cURL)

### Create Daily Recurring Booking
```bash
curl -X POST http://localhost:3000/api/v1/bookings/recurring \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "childId": "clxxx...",
    "therapistId": "clxxx...",
    "slotTime": "14:00",
    "recurrencePattern": "DAILY",
    "startDate": "2024-12-01",
    "endDate": "2024-12-31"
  }'
```

### Request Leave
```bash
curl -X POST http://localhost:3000/api/v1/therapist/leaves \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "date": "2024-12-15",
    "type": "CASUAL",
    "reason": "Personal work"
  }'
```

### Get All Recurring Bookings
```bash
curl -X GET http://localhost:3000/api/v1/bookings/recurring \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📌 Important Notes

1. **Date Format**: Always use `YYYY-MM-DD` format (e.g., `2024-12-15`)
2. **Time Format**: Always use `HH:mm` format (e.g., `14:00`, `09:30`)
3. **Token**: Include `Bearer ` prefix in Authorization header
4. **Weekends**: Automatically excluded from DAILY recurring bookings
5. **Leave Impact**: Approved leaves automatically cancel bookings on that date
6. **Recurring Booking**: One child can only have ONE active recurring booking per therapist

---

## 🔗 Complete URL List

### Recurring Bookings
- `POST http://localhost:3000/api/v1/bookings/recurring`
- `GET http://localhost:3000/api/v1/bookings/recurring`
- `GET http://localhost:3000/api/v1/bookings/recurring/{recurringBookingId}/sessions`
- `DELETE http://localhost:3000/api/v1/bookings/recurring/{recurringBookingId}`

### Leave Management
- `POST http://localhost:3000/api/v1/therapist/leaves`
- `GET http://localhost:3000/api/v1/therapist/leaves`
- `GET http://localhost:3000/api/v1/admin/leaves`
- `GET http://localhost:3000/api/v1/admin/leaves/{leaveId}`
- `PUT http://localhost:3000/api/v1/admin/leaves/{leaveId}`

### Authentication
- `POST http://localhost:3000/api/v1/auth/login`
- `POST http://localhost:3000/api/v1/auth/register/parent`
- `POST http://localhost:3000/api/v1/auth/register/therapist`

---

## 🎯 Testing Tips

1. **Start with Authentication**: Always login first to get tokens
2. **Use Real IDs**: Replace `clxxx...` with actual IDs from your database
3. **Check Database**: Verify data in Prisma Studio: `npx prisma studio`
4. **Test Edge Cases**: 
   - Past dates (should fail)
   - Invalid dayOfWeek (should fail)
   - Duplicate recurring booking (should fail)
   - Leave on weekend (should work but no bookings affected)
5. **Verify Notifications**: Check if emails/notifications are sent
6. **Check Bookings**: After creating recurring booking, verify individual bookings in `/bookings/me`

