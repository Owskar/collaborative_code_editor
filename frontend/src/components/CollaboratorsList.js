import React from 'react';

const CollaboratorsList = ({ collaborators }) => {
  if (!collaborators || collaborators.length === 0) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
          <span className="text-xs text-gray-300">You</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-400 mr-2">Active:</span>
      {collaborators.map((collaborator, index) => (
        <div
          key={`${collaborator.user?.name || 'user'}-${index}`}
          className="relative group"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
            style={{ backgroundColor: collaborator.user?.color || '#666' }}
          >
            {(collaborator.user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {collaborator.user?.name || 'Unknown User'}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CollaboratorsList;
