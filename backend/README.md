# AI Legal CA — Backend

> Personal Management System for Chartered Accountants and Lawyers with AI Assistant

---

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + Bcrypt
- **Email**: Nodemailer (Gmail)
- **File Upload**: Multer + Cloudinary
- **AI**: Groq (Llama 3.3)

---

## 📁 Folder Structure

```
backend/
├── config/
│   ├── db.js                 # MongoDB connection
│   └── cloudinary.js         # Cloudinary setup
├── constants/
│   └── roles.js              # CA, Lawyer, Hybrid roles
├── controllers/
│   ├── auth/
│   │   └── authController.js
│   ├── ca/
│   │   ├── taxController.js
│   │   ├── gstController.js
│   │   └── auditController.js
│   ├── lawyer/
│   │   ├── caseController.js
│   │   └── draftController.js
│   ├── common/
│   │   ├── clientController.js
│   │   ├── invoiceController.js
│   │   └── documentController.js
│   └── ai/
│       └── aiController.js
├── middlewares/
│   ├── authMiddleware.js      # JWT verification
│   ├── roleMiddleware.js      # Role-based access
│   └── uploadMiddleware.js    # Multer file upload
├── models/
│   ├── userModel.js
│   ├── otpModel.js
│   ├── ca/
│   │   ├── taxModel.js
│   │   ├── gstModel.js
│   │   └── auditModel.js
│   ├── lawyer/
│   │   ├── caseModel.js
│   │   └── draftModel.js
│   └── common/
│       ├── clientModel.js
│       ├── invoiceModel.js
│       ├── documentModel.js
│       └── subscriptionModel.js
├── routes/
│   ├── authRoutes.js
│   ├── ca/
│   │   └── caRoutes.js
│   ├── lawyer/
│   │   └── lawyerRoutes.js
│   ├── common/
│   │   └── commonRoutes.js
│   └── ai/
│       └── aiRoutes.js
├── services/
│   ├── email/
│   │   └── emailService.js
│   └── ai/
│       └── aiService.js
├── utils/
│   ├── generateOtp.js
│   └── responseHandler.js
├── .env
├── .gitignore
├── app.js
└── package.json
```

---

## ⚙️ Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/AI_Legal_CA.git
cd AI_Legal_CA/backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create `.env` file
```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/ai_legal_ca
JWT_SECRET=your_jwt_secret_key
MAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GROQ_API_KEY=your_groq_api_key
```

### 4. Run the server
```bash
# Development
node --watch app.js

# Production
node app.js
```

---

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 8000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `MAIL_USER` | Gmail address for OTP emails |
| `EMAIL_PASS` | Gmail App Password |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `GROQ_API_KEY` | Groq AI API key |

---

## 📡 API Endpoints

### 🔐 Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/verify-otp` | Verify OTP |
| POST | `/api/auth/login` | Login user |

### 👥 Clients (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/clients` | Add client |
| GET | `/api/clients` | Get all clients |
| GET | `/api/clients/:id` | Get single client |
| PATCH | `/api/clients/:id` | Update client |
| DELETE | `/api/clients/:id` | Delete client |

### 📊 CA Module (CA + Hybrid Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ca/tax` | Create tax record |
| GET | `/api/ca/tax` | Get all tax records |
| GET | `/api/ca/tax/:id` | Get single tax record |
| PATCH | `/api/ca/tax/:id` | Update tax record |
| DELETE | `/api/ca/tax/:id` | Delete tax record |
| POST | `/api/ca/gst` | Create GST record |
| GET | `/api/ca/gst` | Get all GST records |
| PATCH | `/api/ca/gst/:id` | Update GST record |
| DELETE | `/api/ca/gst/:id` | Delete GST record |
| POST | `/api/ca/audit` | Create audit record |
| GET | `/api/ca/audit` | Get all audit records |
| PATCH | `/api/ca/audit/:id` | Update audit record |
| DELETE | `/api/ca/audit/:id` | Delete audit record |

### ⚖️ Lawyer Module (Lawyer + Hybrid Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/lawyer/cases` | Create case |
| GET | `/api/lawyer/cases` | Get all cases |
| GET | `/api/lawyer/cases/:id` | Get single case |
| PATCH | `/api/lawyer/cases/:id` | Update case |
| DELETE | `/api/lawyer/cases/:id` | Delete case |
| POST | `/api/lawyer/cases/:id/hearing` | Add hearing |
| POST | `/api/lawyer/drafts` | Create draft |
| GET | `/api/lawyer/drafts` | Get all drafts |
| PATCH | `/api/lawyer/drafts/:id` | Update draft |
| DELETE | `/api/lawyer/drafts/:id` | Delete draft |

### 🧾 Invoices (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/invoices` | Create invoice |
| GET | `/api/invoices` | Get all invoices |
| GET | `/api/invoices/:id` | Get single invoice |
| PATCH | `/api/invoices/:id` | Update invoice |
| DELETE | `/api/invoices/:id` | Delete invoice |

### 📄 Documents (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/documents/upload` | Upload document |
| GET | `/api/documents` | Get all documents |
| GET | `/api/documents/:id` | Get single document |
| DELETE | `/api/documents/:id` | Delete document |

### 🤖 AI Assistant (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/chat` | Chat with AI |

---

## 🔒 Roles & Access

| Role | CA Module | Lawyer Module | Common | AI |
|------|-----------|---------------|--------|-----|
| `ca` | ✅ | ❌ | ✅ | ✅ |
| `lawyer` | ❌ | ✅ | ✅ | ✅ |
| `hybrid` | ✅ | ✅ | ✅ | ✅ |

---

## 🤖 AI Features

- Chat with AI using natural language
- AI has access to your data (clients, cases, tax, invoices)
- Role-based data access (CA sees CA data, Lawyer sees Lawyer data)
- Responds in same language as user

---

## 📦 Dependencies

```json
{
  "express": "^4.x",
  "mongoose": "^8.x",
  "jsonwebtoken": "^9.x",
  "bcryptjs": "^2.x",
  "nodemailer": "^6.x",
  "multer": "^1.x",
  "cloudinary": "^2.x",
  "groq-sdk": "^0.x",
  "dotenv": "^16.x"
}
```

---

## 👨‍💻 Developer

**Lokesh Choudhary**
- GitHub: [@lokeshchoudhary](https://github.com/CodebyLokesh-code)

---

*Built with ❤️ for CA and Lawyer community*