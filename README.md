# FileUploader

A modern, secure file management web application built with Next.js and Node.js. This application provides a user-friendly interface for file uploads, downloads, and management with a clean, responsive design.

## 🌟 Features

- **User Authentication**
  - Secure login and registration system
  - Protected dashboard routes
  - Session management

- **File Management**
  - Drag and drop file uploads
  - File preview support for images and PDFs
  - Download functionality
  - Secure file deletion
  - Upload progress tracking

- **Organization**
  - Sort files by date, name, or size
  - Filter files by type (All, Images, Documents, Other)
  - Clean and intuitive user interface

- **Modern UI**
  - Responsive design
  - Tailwind CSS styling
  - Interactive feedback
  - Loading states and progress indicators

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MySQL

### Installation

1. Clone the repository:
```bash
git clone https://github.com/elmadaniabdelhamid/FileUploadAPP.git
cd FileUploader
```

2. Install dependencies for both frontend and backend:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables:

Create a `.env` file in the frontend directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. Start the development servers:

For the backend:
```bash
cd backend
npm run dev
```

For the frontend:
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:3000`

## 🛠️ Tech Stack

- **Frontend**
  - Next.js
  - React
  - Tailwind CSS
  - Axios for API calls

- **Backend**
  - Node.js
  - Express.js
  - MongoDB
  - JWT for authentication

## 📱 Usage

1. **Registration/Login**
   - Create a new account or login with existing credentials
   - Access the secure dashboard

2. **File Upload**
   - Drag and drop files or click to select
   - Monitor upload progress
   - View upload completion status

3. **File Management**
   - Preview supported files (images, PDFs)
   - Download files
   - Delete unwanted files
   - Sort and filter your files

## 🔒 Security Features

- Password hashing
- JWT authentication
- Protected API routes
- Secure file handling
- Input validation and sanitization

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

Your Name - [your-email@example.com]
Project Link: [https://github.com/yourusername/FileUploader]

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- The open-source community for inspiration and tools 
