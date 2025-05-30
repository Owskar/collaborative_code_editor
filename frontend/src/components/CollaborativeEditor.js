import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import CollaboratorsList from './CollaboratorsList';
import LanguageSelector from './LanguageSelector';



const CollaborativeEditor = ({ document }) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const yjsDocRef = useRef(null);
  const providerRef = useRef(null);
  const bindingRef = useRef(null);
  const [collaborators, setCollaborators] = useState([]);
  const [currentLanguage, setCurrentLanguage] = useState(document?.language || 'javascript');

  // Generate a user name (you might want to get this from props, context, or user auth)
  const userName = `User_${Math.random().toString(36).substr(2, 5)}`;

  useEffect(() => {
    if (!document) return;

    // Initialize Yjs document
    yjsDocRef.current = new Y.Doc();
    const yText = yjsDocRef.current.getText('monaco');

    // WebSocket URL for the document
    const wsUrl = "ws://localhost:8000/ws/document/";
    
    // Initialize WebSocket provider
    providerRef.current = new WebsocketProvider(wsUrl, document.id, yjsDocRef.current);

    // Handle awareness (collaborators)
    providerRef.current.awareness.on('change', () => {
      const states = Array.from(providerRef.current.awareness.getStates().values());
      setCollaborators(states.filter(state => state.user));
    });

    // Set initial content if document has content
    if (document.content && yText.length === 0) {
      yText.insert(0, document.content);
    }

    return () => {
      if (bindingRef.current) {
        bindingRef.current.destroy();
      }
      if (providerRef.current) {
        providerRef.current.destroy();
      }
      if (yjsDocRef.current) {
        yjsDocRef.current.destroy();
      }
    };
  }, [document]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    if (yjsDocRef.current) {
      const yText = yjsDocRef.current.getText('monaco');
      
      // Bind Monaco editor to Yjs
      bindingRef.current = new MonacoBinding(
        yText,
        editor.getModel(),
        new Set([editor]),
        providerRef.current.awareness
      );

      // Set user awareness info
      providerRef.current.awareness.setLocalStateField('user', {
        name: userName,
        color: generateRandomColor(),
      });
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    if (editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel();
      monacoRef.current.editor.setModelLanguage(model, newLanguage);
    }
  };

  const generateRandomColor = () => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  if (!document) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white">Loading document...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-white text-lg font-semibold">{document.title}</h2>
          <LanguageSelector 
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
          />
        </div>
        <CollaboratorsList collaborators={collaborators} />
      </div>
      
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage={currentLanguage}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{
            fontSize: 14,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            lineNumbers: 'on',
            glyphMargin: true,
            folding: true,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
          }}
        />
      </div>
    </div>
  );
};

// Monaco Binding for Yjs (simplified version)
class MonacoBinding {
  constructor(ytext, monacoModel, editors, awareness) {
    this.ytext = ytext;
    this.monacoModel = monacoModel;
    this.editors = editors;
    this.awareness = awareness;
    this._suppressMonacoChanges = false;
    
    // Sync initial content
    this.monacoModel.setValue(this.ytext.toString());
    
    // Listen to Yjs changes
    this._yTextObserver = this.yTextObserver.bind(this);
    this.ytext.observe(this._yTextObserver);
    
    // Listen to Monaco changes
    this._monacoChangeHandler = this.monacoChangeHandler.bind(this);
    this.monacoModel.onDidChangeContent(this._monacoChangeHandler);
  }
  
  yTextObserver(event) {
    if (this._suppressMonacoChanges) return;
    
    // Apply Yjs changes to Monaco
    this._suppressMonacoChanges = true;
    
    try {
      event.changes.forEach(change => {
        if (change.retain) return;
        
        const startPos = this.monacoModel.getPositionAt(change.index || 0);
        const endPos = change.delete 
          ? this.monacoModel.getPositionAt((change.index || 0) + change.delete)
          : startPos;
        
        if (change.insert) {
          this.monacoModel.applyEdits([{
            range: {
              startLineNumber: startPos.lineNumber,
              startColumn: startPos.column,
              endLineNumber: endPos.lineNumber,
              endColumn: endPos.column,
            },
            text: change.insert,
          }]);
        } else if (change.delete) {
          this.monacoModel.applyEdits([{
            range: {
              startLineNumber: startPos.lineNumber,
              startColumn: startPos.column,
              endLineNumber: endPos.lineNumber,
              endColumn: endPos.column,
            },
            text: '',
          }]);
        }
      });
    } finally {
      this._suppressMonacoChanges = false;
    }
  }
  
  monacoChangeHandler(event) {
    if (this._suppressMonacoChanges) return;
    
    // Apply Monaco changes to Yjs
    event.changes.forEach(change => {
      const startOffset = this.monacoModel.getOffsetAt({
        lineNumber: change.range.startLineNumber,
        column: change.range.startColumn,
      });
      
      if (change.rangeLength > 0) {
        this.ytext.delete(startOffset, change.rangeLength);
      }
      
      if (change.text) {
        this.ytext.insert(startOffset, change.text);
      }
    });
  }
  
  destroy() {
    if (this._yTextObserver) {
      this.ytext.unobserve(this._yTextObserver);
    }
  }
}

export default CollaborativeEditor;