import React, { useState, useEffect } from 'react';
import CollaborativeEditor from './components/CollaborativeEditor';
import DocumentList from './components/DocumentList';
import Header from './components/Header';
import { documentService } from './services/api';

function App() {
  const [currentDocument, setCurrentDocument] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const docs = await documentService.getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async (title, language = 'javascript') => {
    try {
      const newDoc = await documentService.createDocument({
        title,
        language,
        content: '// Start coding...\n'
      });
      setDocuments(prev => [newDoc, ...prev]);
      setCurrentDocument(newDoc);
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  const handleSelectDocument = (doc) => {
    setCurrentDocument(doc);
  };

  const handleBackToList = () => {
    setCurrentDocument(null);
    loadDocuments();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header 
        currentDocument={currentDocument}
        onBackToList={handleBackToList}
      />
      
      {currentDocument ? (
        <CollaborativeEditor document={currentDocument} />
      ) : (
        <DocumentList
          documents={documents}
          onSelectDocument={handleSelectDocument}
          onCreateDocument={handleCreateDocument}
        />
      )}
    </div>
  );
}

export default App;
