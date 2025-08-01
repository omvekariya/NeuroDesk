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

## Skills Management Endpoints

### 1. Get All Skills (Simple - No Pagination)
**GET** `/skills/all`

**Query Parameters:**
- `is_active` (optional): Filter by active status (true/false) (default: true)
- `sort_by` (optional): Sort by field (id, name, description, is_active, created_at, updated_at) (default: name)
- `sort_order` (optional): Sort order (ASC, DESC) (default: ASC)

**Examples:**
1. Get all active skills: `/skills/all`
2. Get all skills (including inactive): `/skills/all?is_active=false`
3. Sort by creation date: `/skills/all?sort_by=created_at&sort_order=DESC`

**Response:**
```json
{
  "success": true,
  "data": {
    "skills": [
      {
        "id": 1,
        "name": "JavaScript",
        "description": "Frontend and backend JavaScript programming",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": 2,
        "name": "MySQL",
        "description": "Database management and optimization",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 2,
    "filters": {
      "is_active": "true",
      "sort_by": "name",
      "sort_order": "ASC"
    }
  }
}
```

### 2. Get All Skills (With Pagination)
**GET** `/skills`

**Query Parameters:**

**Pagination:**
- `page` (optional): Page number (default: 1, min: 1)
- `limit` (optional): Items per page (default: 10, min: 1, max: 100)

**Filters:**
- `name` (optional): Filter by name (partial match)
- `description` (optional): Filter by description (partial match)
- `is_active` (optional): Filter by active status (true/false)
- `created_from` (optional): Filter by creation date from (ISO8601 format)
- `created_to` (optional): Filter by creation date to (ISO8601 format)
- `updated_from` (optional): Filter by update date from (ISO8601 format)
- `updated_to` (optional): Filter by update date to (ISO8601 format)
- `search` (optional): Global search across name and description

**Sorting:**
- `sort_by` (optional): Sort by field (id, name, description, is_active, created_at, updated_at) (default: created_at)
- `sort_order` (optional): Sort order (ASC, DESC) (default: DESC)

**Examples:**
1. Basic pagination: `/skills?page=1&limit=5`
2. Filter active skills: `/skills?is_active=true&sort_by=name&sort_order=ASC`
3. Search skills: `/skills?search=javascript`
4. Date range filter: `/skills?created_from=2024-01-01&created_to=2024-12-31`

**Response:**
```json
{
  "success": true,
  "data": {
    "skills": [
      {
        "id": 1,
        "name": "JavaScript",
        "description": "Frontend and backend JavaScript programming",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPrevPage": false,
      "nextPage": 2,
      "prevPage": null
    },
    "filters": {
      "name": null,
      "description": null,
      "is_active": "true",
      "search": null,
      "sort_by": "created_at",
      "sort_order": "DESC"
    }
  }
}
```

### 3. Get Skill by ID
**GET** `/skills/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "JavaScript",
    "description": "Frontend and backend JavaScript programming",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Create Skill
**POST** `/skills`

**Request Body:**
```json
{
  "name": "React.js",
  "description": "Modern frontend library for building user interfaces",
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Skill created successfully",
  "data": {
    "id": 3,
    "name": "React.js",
    "description": "Modern frontend library for building user interfaces",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5. Update Skill
**PUT** `/skills/:id`

**Request Body (all fields optional):**
```json
{
  "name": "React.js Advanced",
  "description": "Advanced React.js concepts and patterns",
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Skill updated successfully",
  "data": {
    "id": 3,
    "name": "React.js Advanced",
    "description": "Advanced React.js concepts and patterns",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T01:00:00.000Z"
  }
}
```

### 6. Soft Delete Skill (Deactivate)
**DELETE** `/skills/:id`

**Response:**
```json
{
  "success": true,
  "message": "Skill deactivated successfully"
}
```

### 7. Permanently Delete Skill
**DELETE** `/skills/:id/permanent`

**Response:**
```json
{
  "success": true,
  "message": "Skill permanently deleted"
}
```

### 8. Reactivate Skill
**PATCH** `/skills/:id/reactivate`

**Response:**
```json
{
  "success": true,
  "message": "Skill reactivated successfully",
  "data": {
    "id": 3,
    "name": "React.js",
    "description": "Modern frontend library for building user interfaces",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T02:00:00.000Z"
  }
}
```

## Technicians Management Endpoints

### 1. Get All Technicians (Simple - No Pagination)
**GET** `/technicians/all`

**Query Parameters:**
- `is_active` (optional): Filter by active status (true/false) (default: true)
- `availability_status` (optional): Filter by availability (available, busy, in_meeting, on_break, end_of_shift, focus_mode)
- `skill_level` (optional): Filter by skill level (junior, mid, senior, expert)
- `skills` (optional): Filter by skill IDs (comma-separated or array) - returns technicians with ANY of these skills
- `sort_by` (optional): Sort by field (id, name, workload, availability_status, skill_level, specialization, is_active, created_at, updated_at) (default: name)
- `sort_order` (optional): Sort order (ASC, DESC) (default: ASC)

**Examples:**
1. Get all active technicians: `/technicians/all`
2. Get available technicians: `/technicians/all?availability_status=available`
3. Get technicians with specific skills: `/technicians/all?skills=1,2,3`
4. Get senior level technicians: `/technicians/all?skill_level=senior&sort_by=workload&sort_order=ASC`

**Response:**
```json
{
  "success": true,
  "data": {
    "technicians": [
      {
        "id": 1,
        "name": "John Tech",
        "user_id": 2,
        "assigned_tickets_total": 5,
        "assigned_tickets": [1, 3, 5, 7, 9],
        "skills": [
          {"id": 1, "percentage": 85},
          {"id": 2, "percentage": 90}
        ],
        "workload": 70,
        "availability_status": "available",
        "skill_level": "senior",
        "specialization": "Network Infrastructure",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z",
        "user": {
          "id": 2,
          "name": "John Tech",
          "email": "john.tech@company.com",
          "role": "technician",
          "department": "IT Support"
        }
      }
    ],
    "total": 1,
    "filters": {
      "is_active": "true",
      "availability_status": "available",
      "skill_level": null,
      "skills": null,
      "sort_by": "name",
      "sort_order": "ASC"
    }
  }
}
```

### 2. Get All Technicians (With Pagination)
**GET** `/technicians`

**Query Parameters:**

**Pagination:**
- `page` (optional): Page number (default: 1, min: 1)
- `limit` (optional): Items per page (default: 10, min: 1, max: 100)

**Filters:**
- `name` (optional): Filter by name (partial match)
- `user_id` (optional): Filter by user ID
- `availability_status` (optional): Filter by availability status
- `skill_level` (optional): Filter by skill level
- `specialization` (optional): Filter by specialization (partial match)
- `workload_min` (optional): Filter by minimum workload (0-100)
- `workload_max` (optional): Filter by maximum workload (0-100)
- `is_active` (optional): Filter by active status (true/false)
- `skills` (optional): Filter by skill IDs (union filter - ANY of these skills)
- `created_from` (optional): Filter by creation date from (ISO8601 format)
- `created_to` (optional): Filter by creation date to (ISO8601 format)
- `updated_from` (optional): Filter by update date from (ISO8601 format)
- `updated_to` (optional): Filter by update date to (ISO8601 format)
- `search` (optional): Global search across name and specialization

**Sorting:**
- `sort_by` (optional): Sort by field (id, name, workload, availability_status, skill_level, specialization, is_active, created_at, updated_at) (default: created_at)
- `sort_order` (optional): Sort order (ASC, DESC) (default: DESC)

**Examples:**
1. Basic pagination: `/technicians?page=1&limit=5`
2. Filter available senior technicians: `/technicians?availability_status=available&skill_level=senior`
3. Search technicians: `/technicians?search=network`
4. Filter by workload range: `/technicians?workload_min=0&workload_max=50`
5. Filter by skills: `/technicians?skills=1,2,3&page=1&limit=10`

**Response:**
```json
{
  "success": true,
  "data": {
    "technicians": [
      {
        "id": 1,
        "name": "John Tech",
        "user_id": 2,
        "assigned_tickets_total": 5,
        "assigned_tickets": [1, 3, 5, 7, 9],
        "skills": [
          {"id": 1, "percentage": 85},
          {"id": 2, "percentage": 90}
        ],
        "workload": 70,
        "availability_status": "available",
        "skill_level": "senior",
        "specialization": "Network Infrastructure",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z",
        "user": {
          "id": 2,
          "name": "John Tech",
          "email": "john.tech@company.com",
          "role": "technician",
          "department": "IT Support"
        }
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 10,
      "totalPages": 2,
      "hasNextPage": true,
      "hasPrevPage": false,
      "nextPage": 2,
      "prevPage": null
    },
    "filters": {
      "name": null,
      "user_id": null,
      "availability_status": "available",
      "skill_level": "senior",
      "specialization": null,
      "workload_min": null,
      "workload_max": null,
      "is_active": null,
      "skills": null,
      "search": null,
      "sort_by": "created_at",
      "sort_order": "DESC"
    }
  }
}
```

### 3. Get Technicians by Skills (Union Filter)
**GET** `/technicians/by-skills`

**Query Parameters:**
- `skills` (required): Skill IDs (comma-separated or array) - returns technicians with ANY of these skills
- `page` (optional): Page number (default: 1, min: 1)
- `limit` (optional): Items per page (default: 10, min: 1, max: 100)

**Examples:**
1. Get technicians with JavaScript or Python skills: `/technicians/by-skills?skills=1,2`
2. With pagination: `/technicians/by-skills?skills=1,2,3&page=1&limit=5`

**Response:**
```json
{
  "success": true,
  "data": {
    "technicians": [
      {
        "id": 1,
        "name": "John Tech",
        "user_id": 2,
        "skills": [
          {"id": 1, "percentage": 85},
          {"id": 3, "percentage": 75}
        ],
        "workload": 70,
        "availability_status": "available",
        "skill_level": "senior",
        "user": {
          "id": 2,
          "name": "John Tech",
          "email": "john.tech@company.com",
          "role": "technician",
          "department": "IT Support"
        }
      }
    ],
    "pagination": {
      "total": 8,
      "page": 1,
      "limit": 10,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false,
      "nextPage": null,
      "prevPage": null
    },
    "filters": {
      "skills": ["1", "2"]
    }
  }
}
```

### 4. Get Technician by ID
**GET** `/technicians/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Tech",
    "user_id": 2,
    "assigned_tickets_total": 5,
    "assigned_tickets": [1, 3, 5, 7, 9],
    "skills": [
      {"id": 1, "percentage": 85},
      {"id": 2, "percentage": 90}
    ],
    "workload": 70,
    "availability_status": "available",
    "skill_level": "senior",
    "specialization": "Network Infrastructure",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "user": {
      "id": 2,
      "name": "John Tech",
      "email": "john.tech@company.com",
      "role": "technician",
      "department": "IT Support"
    },
    "tickets": [
      {
        "id": 1,
        "subject": "Network issue",
        "status": "in_progress",
        "priority": "high",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### 5. Create Technician
**POST** `/technicians`

**Request Body:**
```json
{
  "name": "Jane Tech",
  "user_id": 3,
  "skills": [
    {"id": 1, "percentage": 90},
    {"id": 2, "percentage": 85}
  ],
  "availability_status": "available",
  "skill_level": "senior",
  "specialization": "Database Administration",
  "workload": 0,
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Technician created successfully",
  "data": {
    "id": 2,
    "name": "Jane Tech",
    "user_id": 3,
    "assigned_tickets_total": 0,
    "assigned_tickets": [],
    "skills": [
      {"id": 1, "percentage": 90},
      {"id": 2, "percentage": 85}
    ],
    "workload": 0,
    "availability_status": "available",
    "skill_level": "senior",
    "specialization": "Database Administration",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "user": {
      "id": 3,
      "name": "Jane Tech",
      "email": "jane.tech@company.com",
      "role": "technician",
      "department": "IT Support"
    }
  }
}
```

### 6. Update Technician
**PUT** `/technicians/:id`

**Request Body (all fields optional):**
```json
{
  "name": "Jane Senior Tech",
  "skills": [
    {"id": 1, "percentage": 95},
    {"id": 2, "percentage": 90},
    {"id": 3, "percentage": 80}
  ],
  "assigned_tickets": [1, 2, 3],
  "availability_status": "busy",
  "skill_level": "expert",
  "specialization": "Advanced Database Administration",
  "workload": 85,
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Technician updated successfully",
  "data": {
    "id": 2,
    "name": "Jane Senior Tech",
    "user_id": 3,
    "assigned_tickets_total": 3,
    "assigned_tickets": [1, 2, 3],
    "skills": [
      {"id": 1, "percentage": 95},
      {"id": 2, "percentage": 90},
      {"id": 3, "percentage": 80}
    ],
    "workload": 85,
    "availability_status": "busy",
    "skill_level": "expert",
    "specialization": "Advanced Database Administration",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T01:00:00.000Z",
    "user": {
      "id": 3,
      "name": "Jane Tech",
      "email": "jane.tech@company.com",
      "role": "technician",
      "department": "IT Support"
    }
  }
}
```

### 7. Soft Delete Technician (Deactivate)
**DELETE** `/technicians/:id`

**Response:**
```json
{
  "success": true,
  "message": "Technician deactivated successfully"
}
```

### 8. Permanently Delete Technician
**DELETE** `/technicians/:id/permanent`

**Response:**
```json
{
  "success": true,
  "message": "Technician permanently deleted"
}
```

### 9. Reactivate Technician
**PATCH** `/technicians/:id/reactivate`

**Response:**
```json
{
  "success": true,
  "message": "Technician reactivated successfully",
  "data": {
    "id": 2,
    "name": "Jane Tech",
    "user_id": 3,
    "assigned_tickets_total": 3,
    "assigned_tickets": [1, 2, 3],
    "skills": [
      {"id": 1, "percentage": 90},
      {"id": 2, "percentage": 85}
    ],
    "workload": 85,
    "availability_status": "available",
    "skill_level": "senior",
    "specialization": "Database Administration",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T02:00:00.000Z",
    "user": {
      "id": 3,
      "name": "Jane Tech",
      "email": "jane.tech@company.com",
      "role": "technician",
      "department": "IT Support"
    }
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

8. **Get All Skills (Simple):**
```bash
curl -X GET http://localhost:5000/api/v1/skills/all
```

9. **Get All Skills (With Pagination):**
```bash
curl -X GET "http://localhost:5000/api/v1/skills?page=1&limit=10&is_active=true&sort_by=name&sort_order=ASC"
```

10. **Create Skill:**
```bash
curl -X POST http://localhost:5000/api/v1/skills \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Node.js",
    "description": "Backend JavaScript runtime environment",
    "is_active": true
  }'
```

11. **Update Skill:**
```bash
curl -X PUT http://localhost:5000/api/v1/skills/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Advanced Node.js",
    "description": "Advanced backend development with Node.js"
  }'
```

12. **Search Skills:**
```bash
curl -X GET "http://localhost:5000/api/v1/skills?search=javascript&page=1&limit=5"
```

13. **Get All Technicians (Simple):**
```bash
curl -X GET http://localhost:5000/api/v1/technicians/all
```

14. **Get Available Technicians:**
```bash
curl -X GET "http://localhost:5000/api/v1/technicians/all?availability_status=available&skill_level=senior"
```

15. **Get Technicians by Skills (Union Filter):**
```bash
curl -X GET "http://localhost:5000/api/v1/technicians/by-skills?skills=1,2,3&page=1&limit=10"
```

16. **Get All Technicians (With Pagination):**
```bash
curl -X GET "http://localhost:5000/api/v1/technicians?page=1&limit=10&availability_status=available&sort_by=workload&sort_order=ASC"
```

17. **Create Technician:**
```bash
curl -X POST http://localhost:5000/api/v1/technicians \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Tech",
    "user_id": 3,
    "skills": [
      {"id": 1, "percentage": 90},
      {"id": 2, "percentage": 85}
    ],
    "availability_status": "available",
    "skill_level": "senior",
    "specialization": "Database Administration"
  }'
```

18. **Update Technician:**
```bash
curl -X PUT http://localhost:5000/api/v1/technicians/1 \
  -H "Content-Type: application/json" \
  -d '{
    "skills": [
      {"id": 1, "percentage": 95},
      {"id": 3, "percentage": 80}
    ],
    "availability_status": "busy",
    "workload": 85
  }'
```

19. **Search Technicians:**
```bash
curl -X GET "http://localhost:5000/api/v1/technicians?search=network&page=1&limit=5"
```

20. **Filter Technicians by Workload:**
```bash
curl -X GET "http://localhost:5000/api/v1/technicians?workload_min=0&workload_max=50&availability_status=available"
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