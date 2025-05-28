'use client';

import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  addDoc,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { auth, db } from '@/firebase/firebase';
import { motion, AnimatePresence } from 'framer-motion';

interface Entry {
  id: string;
  userId: string;
  content: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export default function EntryHistory() {
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  // Entry input states
  const [entry, setEntry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Delete confirmation states
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Auto-focus on load
    if (inputRef.current && user && user.emailVerified) {
      inputRef.current.focus();
    }
  }, [user]);

  useEffect(() => {
    if (!user || !user.emailVerified) {
      setEntries([]);
      setLoading(false);
      return;
    }

    // Set up real-time listener for user's entries
    // Order by createdAt DESC to get most recent first (terminal-style)
    const q = query(
      collection(db, 'entryterminalentries'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entriesData: Entry[] = [];
      snapshot.forEach((doc) => {
        entriesData.push({
          id: doc.id,
          ...doc.data()
        } as Entry);
      });
      // Entries are already ordered by createdAt DESC from Firestore
      setEntries(entriesData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching entries:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !user.emailVerified) {
      setFeedback('> Please sign in to make entries.');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
      return;
    }

    if (!entry.trim()) {
      setFeedback('> Entry cannot be empty.');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 2000);
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'entryterminalentries'), {
        userId: user.uid,
        content: entry.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setFeedback(`> Entry saved: "${entry.trim()}"`);
      setShowFeedback(true);
      setEntry(''); // Clear the input field
      
      // Auto-hide feedback after 2 seconds
      setTimeout(() => setShowFeedback(false), 2000);
    } catch (error) {
      console.error('Error saving entry:', error);
      setFeedback('> Error saving entry. Please try again.');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
    } finally {
      setIsSubmitting(false);
      // Refocus input after submission
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEdit = (entry: Entry) => {
    setEditingId(entry.id);
    setEditContent(entry.content);
  };

  const handleSaveEdit = async (entryId: string) => {
    if (!editContent.trim()) return;

    try {
      await updateDoc(doc(db, 'entryterminalentries', entryId), {
        content: editContent.trim(),
        updatedAt: serverTimestamp()
      });
      setEditingId(null);
      setEditContent('');
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleDelete = async (entryId: string) => {
    setDeleteConfirmId(entryId);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      await deleteDoc(doc(db, 'entryterminalentries', deleteConfirmId));
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Error deleting entry:', error);
      setDeleteConfirmId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  // Handle keyboard events for delete confirmation
  useEffect(() => {
    if (!deleteConfirmId) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'y') {
        confirmDelete();
      } else if (e.key.toLowerCase() === 'n' || e.key === 'Escape') {
        cancelDelete();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [deleteConfirmId]);

  const formatTimestamp = (timestamp: Timestamp) => {
    if (!timestamp) return 'Unknown time';
    return timestamp.toDate().toLocaleString();
  };

  const handleEditKeyPress = (e: React.KeyboardEvent, entryId: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(entryId);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  if (!user || !user.emailVerified) {
    return (
      <div className="text-gray-400 font-mono">
        <div className="text-cyan-400 mb-2">$ terminal --entry</div>
        <div className="text-sm">
          &gt; Please sign in to make entries.
        </div>
      </div>
    );
  }

  return (
    <div className="text-cyan-400 font-mono">
      
      {/* Entry Input - Pure terminal style */}
      <form onSubmit={handleSubmit} className="mb-2">
        <div className="flex items-start">
          <textarea
            ref={inputRef}
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type entry, press Cmd+Enter to submit..."
            disabled={isSubmitting}
            className="flex-1 bg-transparent border-none outline-none text-cyan-400 placeholder-cyan-600 font-mono resize-none min-h-[1.5rem] scrollbar-hide animate-pulse focus:animate-none"
            rows={1}
            style={{ 
              height: 'auto',
              minHeight: '1.5rem',
              backgroundColor: 'transparent',
              resize: 'none',
              overflow: 'hidden'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = target.scrollHeight + 'px';
            }}
          />
          {isSubmitting && (
            <span className="text-yellow-400 text-sm ml-2 mt-1">saving...</span>
          )}
        </div>
      </form>

      {/* Feedback messages */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-2 text-green-400 text-sm"
          >
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black border border-cyan-400 p-6 max-w-md w-full mx-4 font-mono"
            >
              <div className="text-cyan-400 mb-4">
                $ rm --confirm entry
              </div>
              <div className="text-gray-300 mb-6">
                &gt; Are you sure you want to delete this entry?
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={confirmDelete}
                  className="text-red-400 hover:text-red-300 border border-red-400 hover:border-red-300 px-4 py-2 transition-colors"
                >
                  [Y] Delete
                </button>
                <button
                  onClick={cancelDelete}
                  className="text-cyan-400 hover:text-cyan-300 border border-cyan-400 hover:border-cyan-300 px-4 py-2 transition-colors"
                >
                  [N] Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state */}
      {loading && (
        <div className="text-sm animate-pulse mb-2 text-gray-400">
          &gt; Loading terminal history...
        </div>
      )}

      {/* Entries - Pure terminal output style */}
      {!loading && (
        <div className="space-y-1">
          {entries.length === 0 ? (
            <div className="text-gray-500 text-sm">
              &gt; No entries yet. Start typing above!
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {entries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="group"
                >
                  {editingId === entry.id ? (
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">
                        {formatTimestamp(entry.createdAt)} (editing)
                      </div>
                      <div className="flex items-center">
                        <span className="text-cyan-400 mr-2">&gt;</span>
                        <input
                          type="text"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          onKeyPress={(e) => handleEditKeyPress(e, entry.id)}
                          className="flex-1 bg-transparent border-none outline-none text-cyan-400 font-mono"
                          autoFocus
                        />
                      </div>
                      <div className="text-xs text-gray-500 ml-4">
                        Press Enter to save • Press Escape to cancel • 
                        <button
                          onClick={() => handleSaveEdit(entry.id)}
                          className="text-green-400 hover:text-green-300 ml-2 underline"
                        >
                          save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-400 hover:text-gray-300 ml-2 underline"
                        >
                          cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="py-1">
                        <div className="flex flex-wrap items-start gap-2">
                          <div className="text-xs text-gray-500 shrink-0">
                            {formatTimestamp(entry.createdAt)}
                          </div>
                          <div className="text-gray-300 flex-1 min-w-0 break-words">
                            {entry.content}
                          </div>
                          <div className="flex space-x-1 shrink-0">
                            <button
                              onClick={() => handleEdit(entry)}
                              className="text-cyan-400 hover:text-cyan-300 text-xs"
                            >
                              [E]
                            </button>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="text-cyan-400 hover:text-cyan-300 text-xs"
                            >
                              [X]
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      )}
    </div>
  );
} 