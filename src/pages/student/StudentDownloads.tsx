import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface DownloadItem {
  id: number;
  title: string;
  description: string;
  type: 'report' | 'circular' | 'note';
  fileSize: string;
  uploadDate: string;
  uploader: string;
}

export const StudentDownloads: React.FC = () => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // In a real implementation, this would fetch from the database
    // For now, we'll use mock data
    setTimeout(() => {
      setDownloads([
        {
          id: 1,
          title: 'Term 1 Report Sheet',
          description: 'Your complete academic report for the first term',
          type: 'report',
          fileSize: '2.4 MB',
          uploadDate: '2025-04-01',
          uploader: 'Admin Office'
        },
        {
          id: 2,
          title: 'School Calendar 2025/2026',
          description: 'Academic calendar for the current academic year',
          type: 'circular',
          fileSize: '1.1 MB',
          uploadDate: '2025-03-15',
          uploader: 'Admin Office'
        },
        {
          id: 3,
          title: 'Physics Lab Manual',
          description: 'Laboratory procedures and safety guidelines',
          type: 'note',
          fileSize: '3.7 MB',
          uploadDate: '2025-03-10',
          uploader: 'Mr. Johnson'
        },
        {
          id: 4,
          title: 'Term 2 Report Sheet',
          description: 'Your complete academic report for the second term',
          type: 'report',
          fileSize: '2.6 MB',
          uploadDate: '2025-07-15',
          uploader: 'Admin Office'
        },
        {
          id: 5,
          title: 'Examination Guidelines',
          description: 'Rules and regulations for upcoming examinations',
          type: 'circular',
          fileSize: '0.8 MB',
          uploadDate: '2025-06-20',
          uploader: 'Admin Office'
        }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'report': return 'bg-green-100 text-green-800';
      case 'circular': return 'bg-blue-100 text-blue-800';
      case 'note': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'report':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'circular':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7H4l5-5v5zm6 10V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2z" />
          </svg>
        );
      case 'note':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const filteredDownloads = filter === 'all' 
    ? downloads 
    : downloads.filter(item => item.type === filter);

  const handleDownload = (id: number, title: string) => {
    // In a real implementation, this would download the actual file
    toast.success(`Downloading ${title}...`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <h2 className="text-xl font-bold text-gray-900">Downloads</h2>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('report')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'report' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Reports
            </button>
            <button
              onClick={() => setFilter('circular')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'circular' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Circulars
            </button>
            <button
              onClick={() => setFilter('note')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'note' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Notes
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
          </div>
        </div>
      ) : filteredDownloads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDownloads.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>
                  {getTypeIcon(item.type)}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(item.type)}`}>
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </span>
              </div>
              
              <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{item.description}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>{item.fileSize}</span>
                <span>{item.uploadDate}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">By {item.uploader}</span>
                <button
                  onClick={() => handleDownload(item.id, item.title)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm flex items-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-3">📄</div>
            <p className="text-gray-500 font-medium">No downloads found</p>
            <p className="text-gray-400 text-sm">Check back later for new downloads</p>
          </div>
        </div>
      )}
    </div>
  );
};