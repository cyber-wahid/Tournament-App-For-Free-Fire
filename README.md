# 🔥 FF Clash - Free Fire Tournament Management System

A comprehensive tournament management system built for Free Fire esports tournaments. This application provides a complete solution for organizing, managing, and tracking Free Fire tournaments with user authentication, admin panels, and automated prize distribution.

## ✨ Features

### 🎮 Tournament Management
- **Multiple Game Modes**: Battle Royale (48-50 players), Clash Squad (8 players), Lone Wolf (2v2/1v1)
- **Real-time Tournament Tracking**: Live updates and participant management
- **Prize Distribution**: Automated winner verification and prize allocation
- **Tournament History**: Complete records of past tournaments

### 👤 User Features
- **User Registration & Authentication**: Secure signup with Free Fire UID validation
- **Profile Management**: Update personal information and Free Fire UID
- **Tournament Participation**: Join tournaments with automatic UID tracking
- **Balance Management**: Add money and withdraw winnings
- **Password Reset**: Secure email-based password recovery

### 🔐 Admin Panel
- **User Management**: View, search, and manage all users
- **Tournament Administration**: Create, edit, and manage tournaments
- **Request Management**: Handle balance and withdrawal requests
- **System Settings**: Configure application settings
- **UID Change Tracking**: Monitor and log Free Fire UID changes

### 🛡️ Security Features
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt password encryption
- **Email Verification**: SMTP-based password reset system
- **Input Validation**: Comprehensive data validation with Zod
- **SQL Injection Protection**: Drizzle ORM with parameterized queries

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Hook Form** with Zod validation
- **React Query** for data fetching and caching
- **Wouter** for routing
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Drizzle ORM** with MySQL
- **JWT** for authentication
- **bcrypt** for password hashing
- **Nodemailer** for email services

### Database
- **MySQL** with MariaDB compatibility
- **Drizzle ORM** for type-safe database operations
- **Database migrations** for schema management

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MySQL database
- SMTP email service (for password reset)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/cyber-wahid/Tournament-App-For-Free-Fire.git
   cd Tournament-App-For-Free-Fire
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/ffclash"
   JWT_SECRET="your-super-secret-jwt-key"
   NODE_ENV="development"
   ```

4. **Database Setup**
   ```bash
   # Run database migrations
   npx drizzle-kit push
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production build
   npm run build
   npm start
   ```

## 🗄️ Database Schema

The application uses the following main tables:
- `users` - User accounts with Free Fire UID
- `admins` - Admin user accounts
- `tournaments` - Tournament information
- `tournament_participants` - Tournament participation records
- `password_reset_tokens` - Password reset token management
- `uid_change_logs` - Free Fire UID change tracking
- `balance_requests` - User balance addition requests
- `withdraw_requests` - User withdrawal requests

## 🔧 Configuration

### SMTP Configuration
For password reset functionality, configure your SMTP settings in `server/email.ts`:
```typescript
const smtpConfig = {
  host: 'your-smtp-host',
  port: 465,
  secure: true,
  auth: {
    user: 'your-email@domain.com',
    pass: 'your-app-password'
  }
};
```

### Admin Account Creation
Create an admin account using the provided script:
```bash
node create-admin.js
```

## 📱 Usage

### For Users
1. **Register**: Create an account with your Free Fire UID
2. **Join Tournaments**: Browse and join available tournaments
3. **Manage Profile**: Update your information and Free Fire UID
4. **Track Winnings**: View your tournament history and balance

### For Admins
1. **Access Admin Panel**: Login at `/admin/superuserz`
2. **Manage Tournaments**: Create and manage tournaments
3. **User Management**: View and manage user accounts
4. **System Administration**: Configure system settings

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation for new features
- Follow the existing code style

## 📄 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/cyber-wahid/Tournament-App-For-Free-Fire/issues) page
2. Create a new issue with detailed information
3. Contact the maintainer

## 🎯 Roadmap

- [ ] Real-time tournament updates with WebSockets
- [ ] Mobile app development
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Tournament streaming integration
- [ ] Advanced admin tools

## 🙏 Acknowledgments

- Free Fire community for inspiration
- Open source contributors
- All tournament organizers and players

## 📞 Contact

**Developer**: cyber-wahid
**Email**: [Contact through GitHub](https://github.com/cyber-wahid)
**Project Link**: [https://github.com/cyber-wahid/Tournament-App-For-Free-Fire](https://github.com/cyber-wahid/Tournament-App-For-Free-Fire)

---

⭐ **Star this repository if you find it helpful!**

Made with ❤️ for the Free Fire community