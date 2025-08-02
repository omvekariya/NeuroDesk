# API Endpoints Documentation

## Base URL
```
http://localhost:5000/api/v1
```

## Environment Variables

The following environment variables are required for the API to function properly:

```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=task_manager
DB_DIALECT=mysql
AI_BACKEND_URL=http://localhost:5001
```

**AI Backend Integration:**
- `AI_BACKEND_URL`: URL of the Flask AI backend for automatic ticket assignment
- If not set, AI assignment will be skipped
- If set, tickets without `assigned_technician_id` will be automatically assigned by AI

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
- `debug` (optional): Enable debug mode (true/false) - shows additional logging

**Examples:**
1. Get technicians with JavaScript or Python skills: `/technicians/by-skills?skills=1,2`
2. With pagination: `/technicians/by-skills?skills=1,2,3&page=1&limit=5`
3. With debug mode: `/technicians/by-skills?skills=50,60&debug=true`

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

### 4. Debug Technicians Skills
**GET** `/technicians/debug-skills`

**Description:** Debug endpoint to see all active technicians and their skills structure. Useful for troubleshooting skills filtering issues.

**Response:**
```json
{
  "success": true,
  "message": "Debug information for technicians and their skills",
  "data": {
    "technicians": [
      {
        "id": 16,
        "name": "Isla Fernandes",
        "skills": [
          {"id": 50, "percentage": 92},
          {"id": 51, "percentage": 95},
          {"id": 52, "percentage": 90},
          {"id": 53, "percentage": 94}
        ],
        "availability_status": "busy",
        "user": {
          "id": 9,
          "name": "Isla Fernandes",
          "email": "isla@company.com"
        }
      },
      {
        "id": 17,
        "name": "Jatin Reddy",
        "skills": [
          {"id": 60, "percentage": 80},
          {"id": 61, "percentage": 85}
        ],
        "availability_status": "available",
        "user": {
          "id": 3,
          "name": "Jatin Reddy",
          "email": "jatin@company.com"
        }
      }
    ],
    "total": 2,
    "skillsStructureExample": "Skills should be in format: [{id: 50, percentage: 85}, {id: 60, percentage: 70}]"
  }
}
```

### 5. Get Technician by ID
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

### 6. Create Technician
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

### 7. Update Technician
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

### 8. Soft Delete Technician (Deactivate)
**DELETE** `/technicians/:id`

**Response:**
```json
{
  "success": true,
  "message": "Technician deactivated successfully"
}
```

### 9. Permanently Delete Technician
**DELETE** `/technicians/:id/permanent`

**Response:**
```json
{
  "success": true,
  "message": "Technician permanently deleted"
}
```

### 10. Reactivate Technician
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

### 11. Get Average Performance of All Technicians
**GET** `/technicians/avg_performance/all_technician`

**Description:** Calculate and return the average performance of all technicians based on their solved tickets' scores. This endpoint provides comprehensive performance analytics including individual technician performance, overall statistics, and performance distribution.

**Response:**
```json
{
  "success": true,
  "message": "Average technician performance calculated successfully",
  "data": {
    "overall_statistics": {
      "total_technicians": 15,
      "technicians_with_solved_tickets": 12,
      "total_solved_tickets": 45,
      "overall_average_score": "7.85",
      "min_average_score": "5.20",
      "max_average_score": "9.60",
      "overall_performance_rating": "Good"
    },
    "performance_distribution": {
      "excellent": 3,
      "good": 5,
      "average": 2,
      "below_average": 1,
      "poor": 1,
      "no_tickets": 3
    },
    "technicians": [
      {
        "id": 1,
        "name": "John Tech",
        "skill_level": "senior",
        "specialization": "Network Infrastructure",
        "workload": 70,
        "availability_status": "available",
        "user": {
          "id": 2,
          "name": "John Tech",
          "email": "john.tech@company.com",
          "department": "IT Support"
        },
        "performance": {
          "total_solved_tickets": 8,
          "average_score": "8.75",
          "total_score": "70.00",
          "min_score": "7.50",
          "max_score": "9.50",
          "performance_rating": "Good"
        }
      }
    ],
    "summary": {
      "top_performers": [
        {
          "id": 1,
          "name": "John Tech",
          "average_score": "8.75",
          "total_solved_tickets": 8
        }
      ],
      "technicians_needing_improvement": [
        {
          "id": 5,
          "name": "Mike Junior",
          "average_score": "5.20",
          "total_solved_tickets": 3
        }
      ]
    }
  }
}
```

**Performance Rating Scale:**
- **Excellent**: 9.0 - 10.0
- **Good**: 8.0 - 8.9
- **Average**: 7.0 - 7.9
- **Below Average**: 6.0 - 6.9
- **Poor**: 0.0 - 5.9

**Notes:**
- Only considers tickets with status 'resolved' and non-null scores
- Technicians with no solved tickets are included but marked as "No tickets"
- Performance is calculated based on the average score of all solved tickets per technician
- Top performers and technicians needing improvement are automatically identified

## Tickets Management Endpoints

### 1. Get All Tickets (Simple - No Pagination)
**GET** `/tickets/all`

**Query Parameters:**
- `status` (optional): Filter by status (new, assigned, in_progress, on_hold, resolved, closed, cancelled)
- `priority` (optional): Filter by priority (low, normal, high, critical)
- `urgency` (optional): Filter by urgency (low, normal, high, critical)
- `impact` (optional): Filter by impact (low, medium, high, critical)
- `sla_violated` (optional): Filter by SLA violation (true/false)
- `assigned_technician_id` (optional): Filter by assigned technician ID
- `requester_id` (optional): Filter by requester user ID
- `required_skills` (optional): Filter by required skill IDs (comma-separated or array) - returns tickets requiring ANY of these skills
- `sort_by` (optional): Sort by field (id, subject, status, priority, urgency, impact, sla_violated, escalation_count, satisfaction_rating, score, created_at, updated_at, resolution_due) (default: created_at)
- `sort_order` (optional): Sort order (ASC, DESC) (default: DESC)

**Examples:**
1. Get all open tickets: `/tickets/all?status=new,assigned,in_progress`
2. Get high priority tickets: `/tickets/all?priority=high,critical&sort_by=priority&sort_order=DESC`
3. Get tickets requiring specific skills: `/tickets/all?required_skills=1,2,3`
4. Get SLA violated tickets: `/tickets/all?sla_violated=true&sort_by=resolution_due&sort_order=ASC`

**Response:**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": 1,
        "subject": "Unable to access email",
        "description": "User cannot log into their email account",
        "status": "new",
        "priority": "normal",
        "urgency": "normal",
        "impact": "medium",
        "sla_violated": false,
        "resolution_due": "2024-01-02T09:00:00.000Z",
        "escalation_count": 0,
        "required_skills": [1, 2],
        "tags": ["email", "access"],
        "created_at": "2024-01-01T09:00:00.000Z",
        "updated_at": "2024-01-01T09:00:00.000Z",
        "requester": {
          "id": 3,
          "name": "John User",
          "email": "john.user@company.com",
          "department": "Sales"
        },
        "assigned_technician": {
          "id": 1,
          "name": "Jane Tech",
          "skill_level": "senior",
          "availability_status": "available",
          "user": {
            "id": 2,
            "name": "Jane Tech",
            "email": "jane.tech@company.com"
          }
        }
      }
    ],
    "total": 1,
    "filters": {
      "status": "new",
      "priority": null,
      "urgency": null,
      "impact": null,
      "sla_violated": null,
      "assigned_technician_id": null,
      "requester_id": null,
      "required_skills": null,
      "sort_by": "created_at",
      "sort_order": "DESC"
    }
  }
}
```

### 2. Get All Tickets (With Pagination)
**GET** `/tickets`

**Query Parameters:**

**Pagination:**
- `page` (optional): Page number (default: 1, min: 1)
- `limit` (optional): Items per page (default: 10, min: 1, max: 100)

**Filters:**
- `subject` (optional): Filter by subject (partial match)
- `description` (optional): Filter by description (partial match)
- `status` (optional): Filter by status
- `priority` (optional): Filter by priority
- `urgency` (optional): Filter by urgency
- `impact` (optional): Filter by impact
- `sla_violated` (optional): Filter by SLA violation (true/false)
- `assigned_technician_id` (optional): Filter by assigned technician ID
- `requester_id` (optional): Filter by requester user ID
- `required_skills` (optional): Filter by required skill IDs (union filter - ANY of these skills)
- `escalation_count_min` (optional): Filter by minimum escalation count
- `escalation_count_max` (optional): Filter by maximum escalation count
- `satisfaction_rating_min` (optional): Filter by minimum satisfaction rating (1-5)
- `satisfaction_rating_max` (optional): Filter by maximum satisfaction rating (1-5)
- `score_min` (optional): Filter by minimum score (0.0-10.0)
- `score_max` (optional): Filter by maximum score (0.0-10.0)
- `created_from` (optional): Filter by creation date from (ISO8601 format)
- `created_to` (optional): Filter by creation date to (ISO8601 format)
- `updated_from` (optional): Filter by update date from (ISO8601 format)
- `updated_to` (optional): Filter by update date to (ISO8601 format)
- `resolution_due_from` (optional): Filter by resolution due date from (ISO8601 format)
- `resolution_due_to` (optional): Filter by resolution due date to (ISO8601 format)
- `search` (optional): Global search across subject and description

**Sorting:**
- `sort_by` (optional): Sort by field (id, subject, status, priority, urgency, impact, sla_violated, escalation_count, satisfaction_rating, score, created_at, updated_at, resolution_due) (default: created_at)
- `sort_order` (optional): Sort order (ASC, DESC) (default: DESC)

**Examples:**
1. Basic pagination: `/tickets?page=1&limit=5`
2. Filter high priority unresolved: `/tickets?priority=high,critical&status=new,assigned,in_progress`
3. Search tickets: `/tickets?search=email`
4. Filter by date range: `/tickets?created_from=2024-01-01&created_to=2024-01-31`
5. Filter by skills and technician: `/tickets?required_skills=1,2&assigned_technician_id=1`
6. Filter by score range: `/tickets?score_min=7.0&score_max=10.0&sort_by=score&sort_order=DESC`

**Response:**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": 1,
        "subject": "Unable to access email",
        "description": "User cannot log into their email account",
        "status": "assigned",
        "priority": "normal",
        "urgency": "normal",
        "impact": "medium",
        "sla_violated": false,
        "resolution_due": "2024-01-02T09:00:00.000Z",
        "escalation_count": 0,
        "satisfaction_rating": null,
        "score": null,
        "feedback": null,
        "required_skills": [1, 2],
        "tags": ["email", "access"],
        "tasks": [],
        "created_at": "2024-01-01T09:00:00.000Z",
        "updated_at": "2024-01-01T09:30:00.000Z",
        "requester": {
          "id": 3,
          "name": "John User",
          "email": "john.user@company.com",
          "department": "Sales"
        },
        "assigned_technician": {
          "id": 1,
          "name": "Jane Tech",
          "skill_level": "senior",
          "availability_status": "busy",
          "user": {
            "id": 2,
            "name": "Jane Tech",
            "email": "jane.tech@company.com"
          }
        }
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
      "subject": null,
      "description": null,
      "status": "assigned",
      "priority": "normal",
      "urgency": null,
      "impact": null,
      "sla_violated": null,
      "assigned_technician_id": null,
      "requester_id": null,
      "required_skills": null,
      "search": null,
      "sort_by": "created_at",
      "sort_order": "DESC"
    }
  }
}
```

### 3. Get Tickets by Required Skills (Union Filter)
**GET** `/tickets/by-skills`

**Query Parameters:**
- `skills` (required): Skill IDs (comma-separated or array) - returns tickets requiring ANY of these skills
- `page` (optional): Page number (default: 1, min: 1)
- `limit` (optional): Items per page (default: 10, min: 1, max: 100)
- `status` (optional): Filter by status

**Examples:**
1. Get tickets requiring JavaScript or Python skills: `/tickets/by-skills?skills=1,2`
2. With status filter: `/tickets/by-skills?skills=1,2,3&status=new,assigned&page=1&limit=5`

**Response:**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": 1,
        "subject": "Website debugging needed",
        "description": "Frontend issues with user interface",
        "status": "new",
        "priority": "high",
        "required_skills": [1, 3],
        "requester": {
          "id": 3,
          "name": "John User",
          "email": "john.user@company.com",
          "department": "Sales"
        },
        "assigned_technician": null
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
      "required_skills": ["1", "2"],
      "status": null
    }
  }
}
```

### 4. Get Tickets by User ID (Requester)
**GET** `/tickets/user/:userId`

**Query Parameters:**
- `page` (optional): Page number (default: 1, min: 1)
- `limit` (optional): Items per page (default: 10, min: 1, max: 100)
- `status` (optional): Filter by status
- `priority` (optional): Filter by priority

**Examples:**
1. Get all tickets for user 3: `/tickets/user/3`
2. Get open tickets for user 3: `/tickets/user/3?status=new,assigned,in_progress`

**Response:**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": 1,
        "subject": "Unable to access email",
        "status": "assigned",
        "priority": "normal",
        "created_at": "2024-01-01T09:00:00.000Z",
        "assigned_technician": {
          "id": 1,
          "name": "Jane Tech",
          "skill_level": "senior",
          "user": {
            "id": 2,
            "name": "Jane Tech",
            "email": "jane.tech@company.com"
          }
        }
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false,
      "nextPage": null,
      "prevPage": null
    },
    "filters": {
      "requester_id": "3",
      "status": null,
      "priority": null
    }
  }
}
```

### 5. Get Tickets by Technician ID (Assigned)
**GET** `/tickets/technician/:technicianId`

**Query Parameters:**
- `page` (optional): Page number (default: 1, min: 1)
- `limit` (optional): Items per page (default: 10, min: 1, max: 100)
- `status` (optional): Filter by status
- `priority` (optional): Filter by priority

**Examples:**
1. Get all tickets for technician 1: `/tickets/technician/1`
2. Get active tickets for technician 1: `/tickets/technician/1?status=assigned,in_progress`

**Response:**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": 1,
        "subject": "Unable to access email",
        "status": "in_progress",
        "priority": "normal",
        "created_at": "2024-01-01T09:00:00.000Z",
        "requester": {
          "id": 3,
          "name": "John User",
          "email": "john.user@company.com",
          "department": "Sales"
        }
      }
    ],
    "pagination": {
      "total": 3,
      "page": 1,
      "limit": 10,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false,
      "nextPage": null,
      "prevPage": null
    },
    "filters": {
      "assigned_technician_id": "1",
      "status": null,
      "priority": null
    }
  }
}
```

### 6. Get Ticket by ID
**GET** `/tickets/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "subject": "Unable to access email",
    "description": "User cannot log into their email account. Error message shows 'Authentication failed'.",
    "status": "in_progress",
    "priority": "normal",
    "urgency": "normal",
    "impact": "medium",
    "sla_violated": false,
    "resolution_due": "2024-01-02T09:00:00.000Z",
    "resolution_date": null,
    "first_response_time": 15,
    "response_time": 15,
    "resolution_time": null,
    "escalation_count": 0,
    "required_skills": [1, 2],
    "tags": ["email", "access", "authentication"],
    "tasks": [
      {
        "sub": "Check user credentials",
        "status": "completed",
        "description": "Verified user credentials are correct"
      },
      {
        "sub": "Check email server",
        "status": "in_progress",
        "description": "Investigating server connectivity"
      }
    ],
    "work_logs": [
      {
        "timestamp": "2024-01-01T09:15:00.000Z",
        "technician_id": 1,
        "notes": "Initial assessment completed",
        "time_spent": 15
      }
    ],
    "audit_trail": [
      {
        "action": "created",
        "timestamp": "2024-01-01T09:00:00.000Z",
        "user_id": 3,
        "details": "Ticket created"
      },
      {
        "action": "assigned",
        "timestamp": "2024-01-01T09:05:00.000Z",
        "user_id": 1,
        "details": "Assigned to technician"
      }
    ],
    "first_response_at": "2024-01-01T09:15:00.000Z",
    "resolved_at": null,
    "closed_at": null,
    "reopened_count": 0,
    "satisfaction_rating": null,
    "feedback": null,
    "created_at": "2024-01-01T09:00:00.000Z",
    "updated_at": "2024-01-01T10:00:00.000Z",
    "requester": {
      "id": 3,
      "name": "John User",
      "email": "john.user@company.com",
      "department": "Sales",
      "contact_no": "1234567890"
    },
    "assigned_technician": {
      "id": 1,
      "name": "Jane Tech",
      "skill_level": "senior",
      "availability_status": "busy",
      "specialization": "Email Systems",
      "user": {
        "id": 2,
        "name": "Jane Tech",
        "email": "jane.tech@company.com",
        "contact_no": "0987654321"
      }
    }
  }
}
```

### 7. Create Ticket
**POST** `/tickets`

**Request Body:**
```json
{
  "subject": "Unable to access email",
  "description": "User cannot log into their email account. Error shows authentication failed.",
  "priority": "normal",
  "impact": "medium",
  "urgency": "normal",
  "requester_id": 3,
  "assigned_technician_id": 1,
  "required_skills": [1, 2],
  "tags": ["email", "access"],
  "resolution_due": "2024-01-02T09:00:00.000Z",
  "score": 7.5,
  "justification": "Standard email access issue requiring basic troubleshooting skills"
}
```

**Field Notes:**
- `justification`: TEXT field for storing detailed justification text (no length limit)
```

**AI Integration:**
- If `assigned_technician_id` is not provided and `AI_BACKEND_URL` environment variable is set, the system will automatically call the AI backend for ticket assignment
- The AI backend will receive ticket data and return an `assigned_technician_id` and `justification`
- The ticket will be automatically updated with the AI-assigned technician and justification
- If AI assignment fails, the ticket will still be created but remain unassigned
- AI assignment attempts are logged in the ticket's audit trail

**Response:**
```json
{
  "success": true,
  "message": "Ticket created successfully",
  "data": {
    "id": 1,
    "subject": "Unable to access email",
    "description": "User cannot log into their email account. Error shows authentication failed.",
    "status": "assigned",
    "priority": "normal",
    "impact": "medium",
    "urgency": "normal",
    "sla_violated": false,
    "resolution_due": "2024-01-02T09:00:00.000Z",
    "escalation_count": 0,
    "required_skills": [1, 2],
    "tags": ["email", "access"],
    "score": 7.5,
    "justification": "Standard email access issue requiring basic troubleshooting skills",
    "tasks": [],
    "work_logs": [],
    "audit_trail": [
      {
        "action": "created",
        "timestamp": "2024-01-01T09:00:00.000Z",
        "user_id": 3,
        "details": "Ticket created"
      },
      {
        "action": "ai_assigned",
        "timestamp": "2024-01-01T09:00:05.000Z",
        "user_id": 3,
        "details": "Ticket automatically assigned to technician 1 by AI",
        "ai_justification": "Technician has 95% match with required skills for email troubleshooting"
      }
    ],
    "created_at": "2024-01-01T09:00:00.000Z",
    "updated_at": "2024-01-01T09:00:00.000Z",
    "requester": {
      "id": 3,
      "name": "John User",
      "email": "john.user@company.com",
      "department": "Sales"
    },
    "assigned_technician": {
      "id": 1,
      "name": "Jane Tech",
      "skill_level": "senior",
      "user": {
        "id": 2,
        "name": "Jane Tech",
        "email": "jane.tech@company.com"
      }
    }
  }
}
```

### 8. Update Ticket
**PUT** `/tickets/:id`

**Request Body (all fields optional):**
```json
{
  "subject": "Email access issue - RESOLVED",
  "description": "User cannot log into their email account. Issue was with server configuration.",
  "status": "resolved",
  "priority": "normal",
  "assigned_technician_id": 1,
  "required_skills": [1, 2],
  "tags": ["email", "access", "resolved"],
  "tasks": [
    {
      "sub": "Check user credentials",
      "status": "completed",
      "description": "Verified user credentials are correct"
    },
    {
      "sub": "Fix server configuration",
      "status": "completed",
      "description": "Updated email server settings"
    }
  ],
  "work_logs": [
    {
      "timestamp": "2024-01-01T10:30:00.000Z",
      "technician_id": 1,
      "notes": "Fixed server configuration issue",
      "time_spent": 30
    }
  ],
  "satisfaction_rating": 5,
  "score": 9.2,
  "justification": "Issue resolved through server configuration update",
  "feedback": "Excellent service, very quick resolution"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ticket updated successfully",
  "data": {
    "id": 1,
    "subject": "Email access issue - RESOLVED",
    "description": "User cannot log into their email account. Issue was with server configuration.",
    "status": "resolved",
    "priority": "normal",
    "resolved_at": "2024-01-01T10:30:00.000Z",
    "satisfaction_rating": 5,
    "score": 9.2,
    "justification": "Issue resolved through server configuration update",
    "feedback": "Excellent service, very quick resolution",
    "created_at": "2024-01-01T09:00:00.000Z",
    "updated_at": "2024-01-01T10:30:00.000Z",
    "requester": {
      "id": 3,
      "name": "John User",
      "email": "john.user@company.com",
      "department": "Sales"
    },
    "assigned_technician": {
      "id": 1,
      "name": "Jane Tech",
      "skill_level": "senior",
      "user": {
        "id": 2,
        "name": "Jane Tech",
        "email": "jane.tech@company.com"
      }
    }
  }
}
```

### 9. Soft Delete Ticket (Cancel)
**DELETE** `/tickets/:id`

**Response:**
```json
{
  "success": true,
  "message": "Ticket cancelled successfully"
}
```

### 10. Permanently Delete Ticket
**DELETE** `/tickets/:id/permanent`

**Response:**
```json
{
  "success": true,
  "message": "Ticket permanently deleted"
}
```

### 11. Reactivate Ticket
**PATCH** `/tickets/:id/reactivate`

**Response:**
```json
{
  "success": true,
  "message": "Ticket reactivated successfully",
  "data": {
    "id": 1,
    "subject": "Unable to access email",
    "status": "new",
    "priority": "normal",
    "created_at": "2024-01-01T09:00:00.000Z",
    "updated_at": "2024-01-01T11:00:00.000Z",
    "requester": {
      "id": 3,
      "name": "John User",
      "email": "john.user@company.com",
      "department": "Sales"
    },
    "assigned_technician": {
      "id": 1,
      "name": "Jane Tech",
      "skill_level": "senior",
      "user": {
        "id": 2,
        "name": "Jane Tech",
        "email": "jane.tech@company.com"
      }
    }
  }
}
```

### 12. Process Skills and Update Ticket
**POST** `/tickets/process-skills`

**Description:** This endpoint processes an array of skill objects from the AI backend. For skills with an `id`, it updates the existing skill. For skills without an `id`, it creates new skills. After processing all skills, it updates the specified ticket with all the skill IDs.

**Request Body:**
```json
{
  "ticket_id": 1,
  "skills": [
    {
      "id": 1,
      "name": "JavaScript",
      "description": "JavaScript programming language",
      "is_active": true
    },
    {
      "id": 2,
      "name": "Python",
      "description": "Python programming language",
      "is_active": true
    },
    {
      "name": "Machine Learning",
      "description": "Machine learning and AI skills",
      "is_active": true
    },
    {
      "name": "Data Analysis",
      "description": "Data analysis and visualization"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Skills processed and ticket updated successfully",
  "data": {
    "ticket": {
      "id": 1,
      "subject": "Unable to access email",
      "description": "User cannot log into their email account.",
      "status": "assigned",
      "priority": "normal",
      "impact": "medium",
      "urgency": "normal",
      "required_skills": [1, 2, 15, 16],
      "score": 7.5,
      "justification": "Standard email access issue",
      "created_at": "2024-01-01T09:00:00.000Z",
      "updated_at": "2024-01-01T12:00:00.000Z",
      "requester": {
        "id": 3,
        "name": "John User",
        "email": "john.user@company.com",
        "department": "Sales"
      },
      "assigned_technician": {
        "id": 1,
        "name": "Jane Tech",
        "skill_level": "senior",
        "user": {
          "id": 2,
          "name": "Jane Tech",
          "email": "jane.tech@company.com"
        }
      }
    },
    "processed_skills": {
      "total": 4,
      "new_skills": [
        {
          "id": 15,
          "name": "Machine Learning"
        },
        {
          "id": 16,
          "name": "Data Analysis"
        }
      ],
      "updated_skills": [
        {
          "id": 1,
          "name": "JavaScript"
        },
        {
          "id": 2,
          "name": "Python"
        }
      ],
      "all_skill_ids": [1, 2, 15, 16]
    }
  }
}
```

**Notes:**
- Skills with `id` will be updated using the existing skill update logic
- Skills without `id` will be created as new skills
- If a skill with the same name already exists, it will use the existing skill instead of creating a duplicate
- All processed skill IDs are added to the ticket's `required_skills` array
- The operation is logged in the ticket's audit trail

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

**With debug mode:**
```bash
curl -X GET "http://localhost:5000/api/v1/technicians/by-skills?skills=50,60&debug=true"
```

**Debug endpoint to see all technicians skills:**
```bash
curl -X GET "http://localhost:5000/api/v1/technicians/debug-skills"
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

21. **Get All Tickets (Simple):**
```bash
curl -X GET http://localhost:5000/api/v1/tickets/all
```

22. **Get High Priority Tickets:**
```bash
curl -X GET "http://localhost:5000/api/v1/tickets/all?priority=high,critical&sort_by=priority&sort_order=DESC"
```

23. **Get Tickets by Skills (Union Filter):**
```bash
curl -X GET "http://localhost:5000/api/v1/tickets/by-skills?skills=1,2,3&page=1&limit=10"
```

24. **Get User's Tickets:**
```bash
curl -X GET "http://localhost:5000/api/v1/tickets/user/3?status=new,assigned,in_progress"
```

25. **Get Technician's Tickets:**
```bash
curl -X GET "http://localhost:5000/api/v1/tickets/technician/1?status=assigned,in_progress"
```

26. **Get All Tickets (With Pagination):**
```bash
curl -X GET "http://localhost:5000/api/v1/tickets?page=1&limit=10&priority=high&status=new,assigned&sort_by=created_at&sort_order=DESC"
```

27. **Create Ticket:**
```bash
curl -X POST http://localhost:5000/api/v1/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Unable to access email",
    "description": "User cannot log into their email account",
    "priority": "normal",
    "impact": "medium",
    "urgency": "normal",
    "requester_id": 3,
    "assigned_technician_id": 1,
    "required_skills": [1, 2],
    "tags": ["email", "access"],
    "resolution_due": "2024-01-02T09:00:00.000Z",
    "score": 7.5,
    "justification": "Standard email access issue requiring basic troubleshooting skills"
  }'
```

28. **Update Ticket:**
```bash
curl -X PUT http://localhost:5000/api/v1/tickets/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "resolved",
    "satisfaction_rating": 5,
    "score": 9.2,
    "justification": "Issue resolved through server configuration update",
    "feedback": "Excellent service, very quick resolution",
    "tasks": [
      {
        "sub": "Check user credentials",
        "status": "completed",
        "description": "Verified user credentials are correct"
      }
    ]
  }'
```

29. **Search Tickets:**
```bash
curl -X GET "http://localhost:5000/api/v1/tickets?search=email&page=1&limit=5"
```

30. **Filter Tickets by SLA and Date:**
```bash
curl -X GET "http://localhost:5000/api/v1/tickets?sla_violated=true&created_from=2024-01-01&resolution_due_to=2024-01-31"
```

31. **Filter Tickets by Score Range:**
```bash
curl -X GET "http://localhost:5000/api/v1/tickets?score_min=7.0&score_max=10.0&sort_by=score&sort_order=DESC"
```

32. **Process Skills and Update Ticket:**
```bash
curl -X POST http://localhost:5000/api/v1/tickets/process-skills \
  -H "Content-Type: application/json" \
  -d '{
    "ticket_id": 1,
    "skills": [
      {
        "id": 1,
        "name": "JavaScript",
        "description": "JavaScript programming language",
        "is_active": true
      },
      {
        "id": 2,
        "name": "Python",
        "description": "Python programming language",
        "is_active": true
      },
      {
        "name": "Machine Learning",
        "description": "Machine learning and AI skills",
        "is_active": true
      },
      {
        "name": "Data Analysis",
        "description": "Data analysis and visualization"
      }
    ]
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

## Ticket Endpoints

### GET `/tickets/debug-ai`
Debug AI backend connection and test ticket assignment functionality.

**Description:** Tests the connection to the AI backend and verifies the ticket assignment API is working correctly.

**Response:**
```json
{
  "success": true,
  "message": "AI backend debug test completed",
  "ai_backend_url": "http://localhost:5001",
  "sample_response": {
    "success": true,
    "selected_technician_id": 15,
    "justification": "Technician has relevant skills for network issues",
    "extracted_skills": [...],
    "assignment_timestamp": "2024-01-15T10:30:00Z"
  },
  "response_fields": {
    "success": true,
    "selected_technician_id": 15,
    "assigned_technician_id": null,
    "justification": "Technician has relevant skills for network issues",
    "error_message": null
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "AI backend assignment test failed",
  "ai_backend_url": "http://localhost:5001",
  "error": "Request timeout",
  "error_details": {
    "code": "ECONNABORTED",
    "status": null,
    "statusText": null,
    "data": null
  }
}
```

**Usage:**
```bash
curl -X GET http://localhost:5000/api/v1/tickets/debug-ai
```

### GET `/tickets/all`

// ... existing code ...