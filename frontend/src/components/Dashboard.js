'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, uploadFile, getUserFiles, deleteFile, downloadFile } from '@/utils/api';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [sortBy, setSortBy] = useState('date'); // 'date', 'name', 'size'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [filterType, setFilterType] = useState('all'); // 'all', 'image', 'document', 'other'
  const [previewFile, setPreviewFile] = useState(null);
  const fileInputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndFiles = async () => {
      try {
        const [userData, filesData] = await Promise.all([
          getCurrentUser(),
          getUserFiles()
        ]);
        setUser(userData);
        setFiles(filesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndFiles();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setUploading(true);
      setUploadProgress(0);

      await uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });

      // Refresh the file list
      const updatedFiles = await getUserFiles();
      setFiles(updatedFiles);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileDelete = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      await deleteFile(fileId);
      setFiles(files.filter(file => file.id !== fileId));
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  const handleFileDownload = async (fileId, filename) => {
    try {
      await downloadFile(fileId, filename);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      case 'mp3':
      case 'wav':
        return '🎵';
      case 'mp4':
      case 'mov':
        return '🎥';
      default:
        return '📁';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePreview = (file) => {
    const extension = file.filename.split('.').pop().toLowerCase();
    const isPreviewable = ['jpg', 'jpeg', 'png', 'gif', 'pdf'].includes(extension);
    
    if (isPreviewable) {
      setPreviewFile(file);
    } else {
      alert('Preview not available for this file type');
    }
  };

  const sortFiles = (files) => {
    return [...files].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return sortOrder === 'asc' 
            ? a.filename.localeCompare(b.filename)
            : b.filename.localeCompare(a.filename);
        case 'size':
          return sortOrder === 'asc' 
            ? a.size - b.size
            : b.size - a.size;
        case 'date':
        default:
          return sortOrder === 'asc'
            ? new Date(a.uploadDate) - new Date(b.uploadDate)
            : new Date(b.uploadDate) - new Date(a.uploadDate);
      }
    });
  };

  const filterFiles = (files) => {
    if (filterType === 'all') return files;

    return files.filter(file => {
      const extension = file.filename.split('.').pop().toLowerCase();
      switch (filterType) {
        case 'image':
          return ['jpg', 'jpeg', 'png', 'gif'].includes(extension);
        case 'document':
          return ['pdf', 'doc', 'docx', 'txt'].includes(extension);
        case 'other':
          return !['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt'].includes(extension);
        default:
          return true;
      }
    });
  };

  const displayedFiles = filterFiles(sortFiles(files));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-800">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-black shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-white text-xl font-semibold">FileUploader</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-4 text-black">Welcome, {user?.username || 'User'}</h1>
            
            {/* File Upload Section */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-800">Upload Files</h3>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <p className="text-gray-800 mb-2">
                  {dragActive
                    ? 'Drop your file here'
                    : 'Drag and drop your files here, or click to select files'}
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="mt-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  Select Files
                </button>
                {uploading && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-700 mt-2">
                      Uploading... {Math.round(uploadProgress)}%
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* File Controls */}
            <div className="mb-4 flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-800">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm font-medium text-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="date">Date</option>
                  <option value="name">Name</option>
                  <option value="size">Size</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 rounded-md hover:bg-gray-100"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-800">Filter:</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="text-sm font-medium text-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">All Files</option>
                  <option value="image">Images</option>
                  <option value="document">Documents</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Recent Files Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-800">Recent Files</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {displayedFiles.length > 0 ? (
                  <div className="space-y-2">
                    {displayedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between bg-white p-4 rounded-md shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl" role="img" aria-label="file type">
                            {getFileIcon(file.filename)}
                          </span>
                          <div>
                            <p className="text-gray-900 font-medium">{file.filename}</p>
                            <p className="text-gray-700 text-sm">
                              {formatFileSize(file.size)} • {new Date(file.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {['jpg', 'jpeg', 'png', 'gif', 'pdf'].includes(
                            file.filename.split('.').pop().toLowerCase()
                          ) && (
                            <button
                              onClick={() => handlePreview(file)}
                              className="text-green-700 hover:text-green-900 px-3 py-1 rounded-md hover:bg-green-50"
                              title="Preview"
                            >
                              👁️
                            </button>
                          )}
                          <button
                            onClick={() => handleFileDownload(file.id, file.filename)}
                            className="text-blue-700 hover:text-blue-900 px-3 py-1 rounded-md hover:bg-blue-50"
                            title="Download"
                          >
                            ⬇️
                          </button>
                          <button
                            onClick={() => handleFileDelete(file.id)}
                            className="text-red-700 hover:text-red-900 px-3 py-1 rounded-md hover:bg-red-50"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-800 text-center">No files found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">{previewFile.filename}</h3>
              <button
                onClick={() => setPreviewFile(null)}
                className="text-gray-700 hover:text-gray-900"
              >
                ✕
              </button>
            </div>
            <div className="p-4 flex items-center justify-center">
              {previewFile.filename.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}/files/${previewFile.id}/preview`}
                  alt={previewFile.filename}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              ) : (
                <iframe
                  src={`${process.env.NEXT_PUBLIC_API_URL}/files/${previewFile.id}/preview`}
                  className="w-full h-[70vh]"
                  title={previewFile.filename}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 