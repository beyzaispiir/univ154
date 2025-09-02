import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { MdSearch, MdDownload, MdBookmark, MdBookmarkBorder, MdPictureAsPdf, MdSlideshow, MdLink, MdAdd } from 'react-icons/md';

export default function LectureNotes() {
  const { user, isAdmin } = useAuth()
  const [bookmarkedFiles, setBookmarkedFiles] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadData, setUploadData] = useState({
    week: '',
    title: '',
    description: '',
    file: null
  });
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Use the centralized admin check from AuthContext
  // const isAdmin = isUserAdmin(user?.email);  // Remove this line

  // Fetch materials from Supabase
  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      setLoadError('');
      
      const { data, error } = await supabase
        .from('lecture_materials')
        .select('*')
        .order('week', { ascending: true });

      if (error) throw error;

      // Group materials by week
      const groupedMaterials = data.reduce((acc, material) => {
        const week = material.week;
        if (!acc[week]) {
          acc[week] = {
            week,
            title: `Week ${week}`,
            materials: []
          };
        }
        acc[week].materials.push(material);
        return acc;
      }, {});

      setMaterials(Object.values(groupedMaterials));
    } catch (error) {
      console.error('Error fetching materials:', error);
      setLoadError('Failed to load materials. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch materials on component mount
  useEffect(() => {
    fetchMaterials();
  }, []);

  const toggleBookmark = (fileId) => {
    setBookmarkedFiles(prev => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(fileId)) {
        newBookmarks.delete(fileId);
      } else {
        newBookmarks.add(fileId);
      }
      return newBookmarks;
    });
  };

  const filteredWeeks = materials.filter(week => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      week.title.toLowerCase().includes(searchLower) ||
      week.materials.some(material => 
        material.title.toLowerCase().includes(searchLower)
      )
    );
  });

  const FileTypeIcon = ({ type }) => {
    switch (type) {
      case 'pdf':
        return <MdPictureAsPdf className="w-6 h-6 text-red-500" />;
      case 'pptx':
        return <MdSlideshow className="w-6 h-6 text-orange-500" />;
      default:
        return <MdLink className="w-6 h-6 text-blue-500" />;
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'].includes(file.type)) {
        setUploadError('Only PDF and PPTX files are allowed');
        return;
      }
      setUploadData(prev => ({ ...prev, file }));
      setUploadError('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file || !uploadData.week || !uploadData.title) {
      setUploadError('Please fill in all fields');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      // 1. Upload file to Supabase Storage
      const fileExt = uploadData.file.name.split('.').pop();
      const fileName = `${Date.now()}_${uploadData.title.replace(/\s+/g, '_')}.${fileExt}`;
      const filePath = `week${uploadData.week}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('lecture-materials')
        .upload(filePath, uploadData.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 2. Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('lecture-materials')
        .getPublicUrl(filePath);

      // 3. Save metadata to the database
      const { error: dbError } = await supabase
        .from('lecture_materials')
        .insert([
          {
            week: parseInt(uploadData.week),
            title: uploadData.title,
            type: fileExt.toLowerCase(),
            size: `${(uploadData.file.size / (1024 * 1024)).toFixed(1)} MB`,
            url: publicUrl,
            uploaded_by: user.email,
            dateUploaded: new Date().toISOString()
          }
        ]);

      if (dbError) throw dbError;

      // Reset form and close modal
      setUploadData({ week: '', title: '', file: null });
      setShowUploadModal(false);
      // You might want to refresh the materials list here
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = async (filepath) => {
    try {
      const { data: { signedUrl }, error } = await supabase.storage
        .from('lecture-materials')
        .createSignedUrl(filepath, 3600); // 1 hour expiry

      if (error) throw error;
      
      // Open the signed URL in a new tab
      window.open(signedUrl, '_blank');
    } catch (error) {
      console.error('Download error:', error);
      setLoadError('Failed to download file. Please try again later.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d1a4b] mx-auto"></div>
          <p className="mt-4 text-[#0d1a4b]">Loading materials...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">{loadError}</p>
        <button
          onClick={fetchMaterials}
          className="mt-4 px-4 py-2 bg-[#0d1a4b] text-white rounded-lg hover:bg-[#162456]"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with Upload Button for Admins */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#0d1a4b]">Lecture Materials</h1>
        {isAdmin && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#0d1a4b] text-white rounded-lg hover:bg-[#162456] transition-colors"
          >
            <MdAdd className="w-5 h-5" />
            <span>Upload Material</span>
          </button>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#0d1a4b]">Upload Material</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Week Number
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={uploadData.week}
                  onChange={(e) => setUploadData(prev => ({ ...prev, week: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fdb913] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fdb913] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File (PDF or PPTX)
                </label>
                <input
                  type="file"
                  accept=".pdf,.pptx"
                  onChange={handleFileSelect}
                  className="w-full"
                  required
                />
              </div>

              {uploadError && (
                <p className="text-red-500 text-sm">{uploadError}</p>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 bg-[#0d1a4b] text-white rounded-lg hover:bg-[#162456] disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>

              {isUploading && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#fdb913] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Existing Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search lecture materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fdb913] focus:border-transparent"
          />
          <MdSearch className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Existing Materials List */}
      <div className="space-y-6">
        {filteredWeeks.map((week) => (
          <div key={week.week} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div 
              className="px-6 py-4 border-b border-gray-200 cursor-pointer"
              onClick={() => setSelectedWeek(selectedWeek === week.week ? null : week.week)}
            >
              <h2 className="text-lg font-semibold text-[#0d1a4b]">
                Week {week.week}: {week.title}
              </h2>
            </div>

            {selectedWeek === week.week && (
              <div className="divide-y divide-gray-100">
                {week.materials.map((material) => (
                  <div 
                    key={material.id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <FileTypeIcon type={material.type} />
                      <div>
                        <h3 className="text-[#0d1a4b] font-medium">{material.title}</h3>
                        <p className="text-sm text-gray-500">
                          {material.size} • Uploaded on {new Date(material.dateUploaded).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleBookmark(material.id)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        {bookmarkedFiles.has(material.id) ? (
                          <MdBookmark className="w-5 h-5 text-[#fdb913]" />
                        ) : (
                          <MdBookmarkBorder className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => window.open(material.url, '_blank')}
                        className="flex items-center space-x-2 px-4 py-2 bg-[#0d1a4b] text-white rounded-lg hover:bg-[#162456] transition-colors"
                      >
                        <MdDownload className="w-5 h-5" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 