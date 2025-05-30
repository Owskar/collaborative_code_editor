import { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export const useYjs = (documentId, initialContent = '') => {
  const [isConnected, setIsConnected] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const yjsDocRef = useRef(null);
  const providerRef = useRef(null);

  useEffect(() => {
    if (!documentId) return;

    // Create Yjs document
    yjsDocRef.current = new Y.Doc();
    
    // Create WebSocket provider
    const wsUrl = ws://localhost:8000/ws/document//;
    providerRef.current = new WebsocketProvider(wsUrl, documentId, yjsDocRef.current);

    // Handle connection status
    providerRef.current.on('status', (event) => {
      setIsConnected(event.status === 'connected');
    });

    // Handle awareness (collaborators)
    providerRef.current.awareness.on('change', () => {
      const states = Array.from(providerRef.current.awareness.getStates().values());
      setCollaborators(states.filter(state => state.user));
    });

    // Set initial content if provided
    const yText = yjsDocRef.current.getText('monaco');
    if (initialContent && yText.length === 0) {
      yText.insert(0, initialContent);
    }

    return () => {
      if (providerRef.current) {
        providerRef.current.destroy();
      }
      if (yjsDocRef.current) {
        yjsDocRef.current.destroy();
      }
    };
  }, [documentId, initialContent]);

  const setAwareness = (user) => {
    if (providerRef.current) {
      providerRef.current.awareness.setLocalStateField('user', user);
    }
  };

  const getText = () => {
    return yjsDocRef.current?.getText('monaco');
  };

  return {
    yjsDoc: yjsDocRef.current,
    provider: providerRef.current,
    isConnected,
    collaborators,
    setAwareness,
    getText,
  };
};
