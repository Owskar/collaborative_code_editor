import React from 'react';

const Header = ({ currentDocument, onBackToList }) => {
  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {currentDocument && (
              <button
                onClick={onBackToList}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Back to Documents
              </button>
            )}
            <h1 className="text-xl font-bold text-white">
              {currentDocument ? currentDocument.title : 'Collaborative Code Editor'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              Real-time collaboration enabled
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
