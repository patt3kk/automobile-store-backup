# Automobile Admin Panel

A production-ready admin system with role-based access control for managing posts and administrators.

## Features

- **Role-based Access Control**:
  - Super-admin: Can create admins, delete admins, create posts, delete posts
  - Admin: Can create posts, edit posts, delete posts

- **Secure Authentication**:
  - JWT-based login system
  - Bcrypt-hashed passwords
  - Auto-generated secure passwords for new admins
  - Forced password change on first login

- **Admin Management**:
  - Create new admins with auto-generated passwords
  - Delete existing admins (super-admin only)
  - View all admins in the system

- **Post Management**:
  - Create, edit, and delete posts
  - Upload images with posts
  - Posts automatically displayed on garage page

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local instance or Atlas connection)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example` and configure your environment variables:
   - `DB_URI`: Your MongoDB connection string
   - `ACCESS_TOKEN_SECRET`: JWT access token secret
   - `REFRESH_TOKEN_SECRET`: JWT refresh token secret
   - `APPNAME`: Application name
   - `PORT`: Server port (default: 8001)

4. Run the seed script to create initial super-admins:
   ```bash
   node seedSuperAdmins.js
   ```
   
   This will create 3 super-admin accounts with auto-generated passwords. **Copy the generated passwords immediately** as they will only be shown once.

5. Start the backend server:
   ```bash
   npm run dev  # for development with nodemon
   # or
   npm start    # for production
   ```

### Frontend Usage

1. The frontend files are located in the `frontend` directory
2. Access the admin panel at `http://localhost:3000/frontend/admin/login.html` (or serve via your preferred method)
3. The garage page showing posts is available at `frontend/garage/garage.html`

## Admin Credentials

After running the seed script, you'll have 3 super-admin accounts:
- `superadmin1@example.com`
- `superadmin2@example.com` 
- `superadmin3@example.com`

Use the passwords generated during the seed script execution. New admins created through the dashboard will have auto-generated passwords that are logged to the console.

## API Endpoints

### Admin Authentication
- `POST /api/v1/admin/login` - Admin login
- `POST /api/v1/admin/change-password` - Change password (required on first login)
- `POST /api/v1/admin/admins` - Create new admin (super-admin only)
- `GET /api/v1/admin/admins` - Get all admins (super-admin only)
- `DELETE /api/v1/admin/admins/:id` - Delete admin (super-admin only)

### Posts Management
- `GET /api/v1/posts` - Get all posts (public)
- `GET /api/v1/posts/:id` - Get single post (public)
- `POST /api/v1/posts` - Create post (admin+)
- `PUT /api/v1/posts/:id` - Update post (admin+)
- `DELETE /api/v1/posts/:id` - Delete post (admin+)

## Security Features

- All admin routes are protected with JWT authentication
- Role-based access control prevents unauthorized actions
- Passwords are bcrypt-hashed before storage
- Auto-generated passwords are secure and complex
- Password change is enforced on first login
- No public registration - all admins must be created by super-admins

## Emergency Recovery

If you need to reset admin accounts, run the seed script again:
```bash
node seedSuperAdmins.js
```

The script will skip creation if super-admins already exist.