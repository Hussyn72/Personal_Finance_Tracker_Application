# Personal Finance Tracker

A comprehensive, full-stack personal finance management platform with user authentication, real-time notifications, cloud data synchronization, and advanced analytics for better financial tracking and decision-making.

## 🚀 Features

### Core Financial Management
- **Dashboard Overview** - Real-time financial statistics and visual insights
- **Transaction Management** - Add, edit, and categorize income/expenses
- **Budget Tracking** - Set monthly budgets with progress monitoring
- **Advanced Reports** - Interactive charts and data visualization
- **Category Management** - Custom categories with color coding
- **Data Export** - CSV export functionality for external analysis

### Advanced Features
- **User Authentication** - Secure login/logout with JWT token-based authentication
- **Multi-User Support** - Individual accounts for family members
- **Cloud Data Sync** - Access your financial data from any device
- **Smart Notifications** - Personalized alerts for budget limits, bill reminders, and savings goals
- **Predictive Analytics** - AI-powered spending predictions and financial insights
- **Recurring Transactions** - Automated tracking of regular income/expenses
- **Financial Goals** - Set and track savings targets with progress monitoring
- **Bill Reminders** - Never miss a payment with smart notification system
- **Historical Analysis** - Long-term financial trend analysis and pattern recognition
- **Data Security** - Encrypted data storage with secure backup and recovery
- **Real-time Updates** - Live synchronization across all connected devices
- **Smart Categorization** - AI-assisted transaction categorization suggestions
- **Monthly Reports** - Automated financial summaries delivered via email
- **Responsive Design** - Seamless experience across desktop, tablet, and mobile devices

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (JavaScript)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Build Tool**: Vite
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Authentication**: JWT tokens with secure storage

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcrypt for password hashing
- **File Upload**: Multer for document handling
- **Email Service**: Nodemailer for notifications
- **Validation**: Joi for data validation
- **Security**: Helmet, CORS, rate limiting

### Infrastructure & DevOps
- **Database Hosting**: MongoDB Atlas
- **File Storage**: Cloudinary for document storage
- **Deployment**: Vercel (Frontend) + Railway/Heroku (Backend)
- **Environment Management**: dotenv
- **API Documentation**: Swagger/OpenAPI

## 📱 Screenshots

### Dashboard
- Monthly financial overview with interactive charts
- Budget status indicators and recent transactions
- 6-month trend analysis

### Reports
- Comprehensive financial reports with multiple chart types
- Category-wise expense breakdown
- Monthly/yearly comparison views

### Authentication & User Management
- Secure user registration and login system
- Password reset and account recovery
- User profile management with preferences

### Smart Notifications & Alerts
- Real-time budget limit warnings
- Bill payment reminders
- Savings goal progress updates
- Monthly financial summary reports

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/personal-finance-tracker.git
cd personal-finance-tracker
```

2. Install dependencies
```bash
npm install
cd backend
npm install
cd ..
```

3. Environment Setup
```bash
# Frontend (.env)
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Personal Finance Tracker

# Backend (.env)
MONGODB_URI=mongodb://localhost:27017/finance-tracker
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

4. Start the development servers
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 📊 Usage

1. **Create Account**: Register with email and secure password
2. **Dashboard Overview**: View your financial summary and recent activities
3. **Add Transactions**: Record income and expenses with smart categorization
4. **Set Budgets**: Create monthly spending limits with automatic alerts
5. **Track Goals**: Set savings targets and monitor progress
6. **View Reports**: Analyze spending patterns with interactive charts
7. **Manage Categories**: Customize transaction categories and colors
8. **Set Notifications**: Configure alerts for budgets, bills, and goals
9. **Export Data**: Download financial reports in multiple formats
10. **Sync Devices**: Access your data from anywhere with cloud synchronization

### Mobile App Features
- Push notifications for important financial alerts
- Offline mode with automatic sync when connected
- Quick expense entry with camera receipt scanning

## 🎨 Features in Detail

### Dashboard
- Monthly income, expenses, and net balance
- Visual expense breakdown by category
- Budget progress indicators
- Recent transaction history with quick actions
- Financial goal progress tracking
- Upcoming bill reminders

### Transaction Management
- Easy income/expense entry
- Category-based organization
- Date selection and descriptions
- Form validation and error handling
- Recurring transaction setup
- Receipt attachment and storage
- Smart category suggestions based on description

### Budget Tracking
- Monthly budget creation by category
- Visual progress bars with color-coded warnings
- Overspending alerts and notifications
- Budget vs actual spending comparisons
- Automatic budget rollover options
- Category-wise spending limits
- Real-time budget utilization tracking

### Smart Notifications
- Customizable alert preferences
- Email and push notification support
- Budget limit warnings (80%, 90%, 100%+)
- Bill payment reminders
- Savings goal milestone celebrations
- Monthly financial summary reports

### Reports & Analytics
- Multiple chart types (line, area, bar, pie)
- Monthly and yearly reporting periods
- Category expense analysis
- Data export capabilities
- Predictive spending analysis
- Financial health score calculation
- Comparative analysis with previous periods
- Custom date range reporting

### Security & Privacy
- End-to-end data encryption
- Secure authentication with JWT tokens
- Password strength requirements
- Two-factor authentication support
- Regular security audits and updates
- GDPR compliance for data protection

## 🔧 Build for Production

```bash
# Build frontend
npm run build

# Build and deploy backend
cd backend
npm run build
npm start
```

## 🧪 Testing

```bash
# Run frontend tests
npm test

# Run backend tests
cd backend
npm test

# Run end-to-end tests
npm run test:e2e
```

## 📚 API Documentation

The API documentation is available at `/api/docs` when running the backend server. It includes:
- Authentication endpoints
- User management
- Transaction CRUD operations
- Budget management
- Notification settings
- Report generation

## 🔐 Security Features

- **Authentication**: JWT-based secure login system
- **Authorization**: Role-based access control
- **Data Encryption**: Sensitive data encrypted at rest
- **Input Validation**: Comprehensive server-side validation
- **Rate Limiting**: API endpoint protection
- **CORS**: Cross-origin request security
- **Helmet**: Security headers implementation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Bug Reports & Feature Requests

Please use the GitHub Issues tab to report bugs or request new features. Include:
- Detailed description of the issue
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots if applicable

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React and modern web technologies
- Backend powered by Node.js and Express
- Database management with MongoDB
- Charts powered by Recharts
- Icons by Lucide React
- Styled with Tailwind CSS
- Authentication system inspired by industry best practices
- UI/UX design following modern financial app standards

## 🚀 Roadmap

- [ ] Mobile app development (React Native)
- [ ] Advanced AI-powered financial insights
- [ ] Integration with banking APIs
- [ ] Cryptocurrency tracking
- [ ] Investment portfolio management
- [ ] Tax calculation and reporting
- [ ] Multi-currency support
- [ ] Family account sharing features
- [ ] Financial advisor chat integration
- [ ] Automated expense categorization using ML

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

**Made with ❤️ for smarter financial management**

### 📊 Project Stats
- **Version**: 2.0.0
- **Last Updated**: 2024
- **Contributors**: Open for contributions
- **License**: MIT