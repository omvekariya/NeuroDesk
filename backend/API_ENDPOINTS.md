# API Endpoints Documentation

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "contact_no": "1234567890",
  "role": "user",
  "department": "IT"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "contact_no": "1234567890",
    "role": "user",
    "department": "IT",
    "status": true,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Login User
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "contact_no": "1234567890",
    "role": "user",
    "department": "IT",
    "status": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Get User Profile
**GET** `/auth/profile/:userId`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "contact_no": "1234567890",
    "role": "user",
    "department": "IT",
    "status": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

## User Management Endpoints

### 1. Get All Users
**GET** `/users`

**Query Parameters:**

**Pagination:**
- `page` (optional): Page number (default: 1, min: 1)
- `limit` (optional): Items per page (default: 10, min: 1, max: 100)

**Filters:**
- `role` (optional): Filter by role (admin, technician, user)
- `status` (optional): Filter by status (true/false)
- `name` (optional): Filter by name (partial match)
- `email` (optional): Filter by email (partial match)
- `contact_no` (optional): Filter by contact number (partial match)
- `department` (optional): Filter by department (partial match)
- `created_from` (optional): Filter by creation date from (ISO8601 format)
- `created_to` (optional): Filter by creation date to (ISO8601 format)
- `updated_from` (optional): Filter by update date from (ISO8601 format)
- `updated_to` (optional): Filter by update date to (ISO8601 format)
- `search` (optional): Global search across name, email, contact_no, department

**Sorting:**
- `sort_by` (optional): Sort by field (id, name, email, role, department, status, created_at, updated_at) (default: created_at)
- `sort_order` (optional): Sort order (ASC, DESC) (default: DESC)

**Examples:**
1. Basic pagination: `/users?page=1&limit=5`
2. Filter by role: `/users?role=technician&status=true`
3. Search users: `/users?search=john`
4. Date range filter: `/users?created_from=2024-01-01&created_to=2024-12-31`
5. Sort by name: `/users?sort_by=name&sort_order=ASC`
6. Complex query: `/users?page=2&limit=20&role=admin&department=IT&sort_by=email&sort_order=ASC`

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "contact_no": "1234567890",
        "role": "user",
        "department": "IT",
        "status": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPrevPage": false,
      "nextPage": 2,
      "prevPage": null
    },
    "filters": {
      "role": "user",
      "status": "true",
      "name": null,
      "email": null,
      "contact_no": null,
      "department": "IT",
      "created_from": null,
      "created_to": null,
      "updated_from": null,
      "updated_to": null,
      "search": null,
      "sort_by": "created_at",
      "sort_order": "DESC"
    }
  }
}
```

### 2. Get User by ID
**GET** `/users/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "contact_no": "1234567890",
    "role": "user",
    "department": "IT",
    "status": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "requested_tickets": [
      {
        "id": 1,
        "subject": "Issue with login",
        "status": "new",
        "priority": "normal",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### 3. Create User
**POST** `/users`

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "contact_no": "0987654321",
  "role": "technician",
  "department": "Support"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "contact_no": "0987654321",
    "role": "technician",
    "department": "Support",
    "status": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Update User
**PUT** `/users/:id`

**Request Body (all fields optional):**
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com",
  "contact_no": "1111111111",
  "role": "admin",
  "department": "Management",
  "status": true,
  "password": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "name": "John Updated",
    "email": "john.updated@example.com",
    "contact_no": "1111111111",
    "role": "admin",
    "department": "Management",
    "status": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T01:00:00.000Z"
  }
}
```

### 5. Soft Delete User (Deactivate)
**DELETE** `/users/:id`

**Response:**
```json
{
  "success": true,
  "message": "User deactivated successfully"
}
```

### 6. Permanently Delete User
**DELETE** `/users/:id/permanent`

**Response:**
```json
{
  "success": true,
  "message": "User permanently deleted"
}
```

### 7. Reactivate User
**PATCH** `/users/:id/reactivate`

**Response:**
```json
{
  "success": true,
  "message": "User reactivated successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "contact_no": "1234567890",
    "role": "user",
    "department": "IT",
    "status": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T02:00:00.000Z"
  }
}
```

## System Endpoints

### Health Check
**GET** `/health`

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development",
  "database": "Connected"
}
```

### Models Info
**GET** `/models`

**Response:**
```json
{
  "message": "Available models",
  "models": ["User", "Skill", "Technician", "Ticket"],
  "database": {
    "host": "localhost",
    "database": "ticket_management",
    "dialect": "mysql"
  }
}
```

## Error Responses

### Validation Error
```json
{
  "success": false,
  "message": "Validation errors",
  "errors": [
    {
      "type": "field",
      "value": "",
      "msg": "Name is required",
      "path": "name",
      "location": "body"
    }
  ]
}
```

### General Error
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

### Not Found Error
```json
{
  "success": false,
  "message": "User not found"
}
```

## Testing with Postman/curl

### Example curl commands:

1. **Register User:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user"
  }'
```

2. **Login User:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

3. **Get All Users (Basic):**
```bash
curl -X GET http://localhost:5000/api/v1/users?page=1&limit=10
```

4. **Get Users with Filters:**
```bash
curl -X GET "http://localhost:5000/api/v1/users?role=technician&status=true&department=IT&sort_by=name&sort_order=ASC"
```

5. **Search Users:**
```bash
curl -X GET "http://localhost:5000/api/v1/users?search=john&page=1&limit=5"
```

6. **Get Users by Date Range:**
```bash
curl -X GET "http://localhost:5000/api/v1/users?created_from=2024-01-01&created_to=2024-12-31&sort_by=created_at&sort_order=DESC"
```

7. **Update User:**
```bash
curl -X PUT http://localhost:5000/api/v1/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "department": "Management"
  }'
```

## Advanced Filtering Guide

### Filter Capabilities

1. **Partial Text Matching**: `name`, `email`, `contact_no`, `department` support partial matching
   - Example: `name=john` will match "John Doe", "Johnny", "johnson"

2. **Date Range Filtering**: Use ISO8601 format for date filters
   - Format: `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ss.sssZ`
   - Example: `created_from=2024-01-01T00:00:00.000Z&created_to=2024-12-31T23:59:59.999Z`

3. **Global Search**: The `search` parameter searches across multiple fields simultaneously
   - Searches: `name`, `email`, `contact_no`, `department`
   - Example: `search=tech` might match users with "technician" role, "Technical" department, or "tech@company.com" email

4. **Multiple Role Filtering**: You can filter by multiple roles (in query string, repeat the parameter)
   - Example: `role=admin&role=technician` (if supported by your frontend)

5. **Sorting Options**: 
   - Available fields: `id`, `name`, `email`, `role`, `department`, `status`, `created_at`, `updated_at`
   - Default: `sort_by=created_at&sort_order=DESC` (newest first)

### Best Practices

1. **Pagination**: Always use reasonable `limit` values (max 100) to avoid performance issues
2. **Indexing**: The following fields are indexed for better performance:
   - `email` (unique)
   - `status`
   - `role`
3. **Date Filtering**: Use specific date ranges rather than open-ended queries
4. **Search**: Keep search terms concise for better performance

### Example Complex Queries

1. **Find all active technicians in IT department, sorted by name:**
   ```
   /users?role=technician&status=true&department=IT&sort_by=name&sort_order=ASC
   ```

2. **Find users created this year with pagination:**
   ```
   /users?created_from=2024-01-01&created_to=2024-12-31&page=1&limit=20
   ```

3. **Search for users with "admin" in any field:**
   ```
   /users?search=admin&page=1&limit=10
   ```

4. **Get recently updated users:**
   ```
   /users?sort_by=updated_at&sort_order=DESC&limit=10
   ```