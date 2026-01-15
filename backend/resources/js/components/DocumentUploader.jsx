import { useState } from 'react';

function DocumentUploader({ label, docType, isUploaded, fileName, onUpload }) {
  const [isDrag, setIsDrag] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDrag(false);
    if (e.dataTransfer.files) {
      onUpload(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e) => {
    if (e.target.files) {
      onUpload(Array.from(e.target.files));
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label} *</label>
      <div onDragEnter={() => setIsDrag(true)} onDragLeave={() => setIsDrag(false)} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDrag ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : isUploaded ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900'}`}>
        <input type="file" id={docType} onChange={handleChange} accept="image/png,image/jpeg" className="hidden" />
        {isUploaded ? (
          <div className="text-green-600 dark:text-green-400">
            <p className="font-semibold">✓ Uploaded</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{fileName}</p>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">Drag & drop or</p>
            <label htmlFor={docType} className="inline-block px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600">
              Browse
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentUploader;
