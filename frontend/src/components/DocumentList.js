import React, { useState } from 'react';

const DocumentList = ({ documents, onSelectDocument, onCreateDocument }) => {
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocLanguage, setNewDocLanguage] = useState('javascript');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (newDocTitle.trim()) {
      onCreateDocument(newDocTitle.trim(), newDocLanguage);
      setNewDocTitle('');
      setShowCreateForm(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">My Documents</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          New Document
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-gray-800 p-6 rounded-lg mb-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Create New Document</h3>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Document Title
              </label>
              <input
                type="text"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter document title..."
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Language
              </label>
              <select
                value={newDocLanguage}
                onChange={(e) => setNewDocLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="csharp">C#</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="json">JSON</option>
                <option value="markdown">Markdown</option>
                <option value="sql">SQL</option>
              </select>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">No documents yet</div>
          <p className="text-gray-500">Create your first document to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onSelectDocument(doc)}
              className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-gray-600 cursor-pointer transition-all hover:bg-gray-750"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-semibold text-white">{doc.title}</h3>
                <span className="px-2 py-1 bg-blue-600 text-blue-100 text-xs rounded-full">
                  {doc.language}
                </span>
              </div>
              
              <div className="text-gray-400 text-sm mb-3">
                Created: {formatDate(doc.created_at)}
                {doc.updated_at !== doc.created_at && (
                  <span className="ml-4">
                    Updated: {formatDate(doc.updated_at)}
                  </span>
                )}
              </div>
              
              {doc.collaborators && doc.collaborators.length > 0 && (
                <div className="flex items-center text-sm text-gray-400">
                  <span className="mr-2">Collaborators:</span>
                  {doc.collaborators.map((collab, index) => (
                    <span key={collab.user.id} className="mr-2">
                      {collab.user.username}
                      {index < doc.collaborators.length - 1 && ','}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentList;
