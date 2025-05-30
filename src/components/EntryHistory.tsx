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
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  // Entry input states
  const [entry, setEntry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [showCyberAnimation, setShowCyberAnimation] = useState(false);
  const [showDeleteAnimation, setShowDeleteAnimation] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Delete confirmation states
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Navigation states
  const [selectedIndex, setSelectedIndex] = useState(-1); // -1 means no selection (input field)
  const [accomplishedEntries, setAccomplishedEntries] = useState<Set<string>>(new Set()); // Track accomplished entry IDs
  const [timestampsCollapsed, setTimestampsCollapsed] = useState(false); // Global timestamp collapse state
  const [hoveredIndex, setHoveredIndex] = useState(-1); // Track which entry is being hovered
  const [isMouseActive, setIsMouseActive] = useState(false); // Track if mouse is actively being used

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

  // Global click handler to clear highlighting when clicking outside entries
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if click is inside any entry-related element
      const isInsideEntry = target.closest('.entry-container') || 
                           target.closest('[data-entry-content]') ||
                           target.closest('[data-editing-area]') ||
                           target.closest('button') ||
                           target.closest('textarea') ||
                           target.closest('input');
      
      // If clicked outside any entry-related element, clear states
      if (!isInsideEntry) {
        setSelectedIndex(-1);
        setHoveredIndex(-1);
        setIsMouseActive(false);
        setEditingId(null); // Exit edit mode
        setEditContent(''); // Clear edit content
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  useEffect(() => {
    if (!user || !user.emailVerified) {
      setEntries([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Set up real-time listener for user's entries
    // Order by createdAt DESC to get most recent first (terminal-style)
    const q = query(
      collection(db, 'entryterminalentries'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
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
        setError(null);
      } catch (error) {
        console.error('Error processing snapshot:', error);
        setError('Error processing entries data');
        setLoading(false);
      }
    }, (error) => {
      console.error('Error fetching entries:', error);
      setLoading(false);
      
      // Handle specific Firebase errors
      if (error.code === 'permission-denied') {
        setError('Permission denied. Please check Firestore security rules or try signing out and back in.');
        console.error('Permission denied - check Firestore security rules');
      } else if (error.code === 'unauthenticated') {
        setError('Authentication required. Please sign in again.');
        console.error('User not authenticated');
      } else if (error.code === 'unavailable') {
        setError('Firebase service unavailable. Please check your internet connection.');
      } else {
        setError(`Firebase error: ${error.message || 'Unknown error'}`);
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
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
      
      // Trigger cyber animation
      setShowCyberAnimation(true);
      setTimeout(() => {
        setShowCyberAnimation(false);
        // Ensure input is focused after animation ends
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 2000);
      
      // Auto-hide feedback after 2 seconds
      setTimeout(() => setShowFeedback(false), 2000);
    } catch (error) {
      console.error('Error saving entry:', error);
      setFeedback('> Error saving entry. Please try again.');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
    } finally {
      setIsSubmitting(false);
      // Refocus input after submission with a small delay to ensure proper focus
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      // Completely clear mouse state when keyboard is used
      setIsMouseActive(false);
      setHoveredIndex(-1);
      
      if (selectedIndex === -1) {
        if (entries.length > 0) {
          setSelectedIndex(0);
        }
      } else if (selectedIndex < entries.length - 1) {
        const newIndex = selectedIndex + 1;
        setSelectedIndex(newIndex);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      // Completely clear mouse state when keyboard is used
      setIsMouseActive(false);
      setHoveredIndex(-1);
      
      if (selectedIndex > 0) {
        const newIndex = selectedIndex - 1;
        setSelectedIndex(newIndex);
      } else if (selectedIndex === 0) {
        setSelectedIndex(-1);
        // Scroll input area into view when navigating back to input
        if (inputRef.current) {
          inputRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
        }
      }
    } else if (e.key === 'Delete' && selectedIndex !== -1) {
      e.preventDefault();
      const currentEntry = entries[selectedIndex];
      if (accomplishedEntries.has(currentEntry.id)) {
        // Second delete: prompt for deletion
        setDeleteConfirmId(currentEntry.id);
      } else {
        // First delete: mark as accomplished (strikethrough)
        setAccomplishedEntries(prev => new Set([...prev, currentEntry.id]));
      }
    } else if (e.key === 'Backspace' && selectedIndex !== -1) {
      e.preventDefault();
      const currentEntry = entries[selectedIndex];
      if (accomplishedEntries.has(currentEntry.id)) {
        // Second backspace: prompt for deletion
        setDeleteConfirmId(currentEntry.id);
      } else {
        // First backspace: mark as accomplished (strikethrough)
        setAccomplishedEntries(prev => new Set([...prev, currentEntry.id]));
      }
    } else if (e.key === 'Enter' && selectedIndex !== -1) {
      e.preventDefault();
      // Start editing the selected entry
      const currentEntry = entries[selectedIndex];
      setEditingId(currentEntry.id);
      setEditContent(currentEntry.content);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setSelectedIndex(-1);
      setIsMouseActive(false);
      setHoveredIndex(-1);
    }
  };

  // Reset navigation when entry changes (user types)
  const handleEntryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEntry(e.target.value);
    // Reset navigation states when user starts typing
    setSelectedIndex(-1);
    setIsMouseActive(false);
    setHoveredIndex(-1);
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
      // Store the entry ID for deletion
      const entryToDelete = deleteConfirmId;
      
      // Clear modal immediately and trigger delete animation
      setDeleteConfirmId(null);
      setShowDeleteAnimation(true);
      
      // Wait for animation to play for a bit, then delete
      setTimeout(async () => {
        await deleteDoc(doc(db, 'entryterminalentries', entryToDelete));
        setShowDeleteAnimation(false);
      }, 1500);
    } catch (error) {
      console.error('Error deleting entry:', error);
      setDeleteConfirmId(null);
      setShowDeleteAnimation(false);
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
        e.preventDefault();
        e.stopPropagation();
        confirmDelete();
      } else if (e.key.toLowerCase() === 'n' || e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        cancelDelete();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [deleteConfirmId]);

  // Auto-scroll to keep selected entry in view
  useEffect(() => {
    if (selectedIndex >= 0 && selectedIndex < entries.length) {
      // Find the selected entry element and scroll it into view
      const selectedEntry = document.querySelector(`[data-entry-index="${selectedIndex}"]`);
      if (selectedEntry) {
        selectedEntry.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      }
    }
  }, [selectedIndex, entries.length]);

  const formatTimestamp = (timestamp: Timestamp) => {
    if (!timestamp) return 'Unknown time';
    return timestamp.toDate().toLocaleString();
  };

  const handleEditKeyPress = (e: React.KeyboardEvent, entryId: string) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSaveEdit(entryId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const handleToggleTimestamps = () => {
    setTimestampsCollapsed(prev => !prev);
  };

  const handleTimestampToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleToggleTimestamps();
  };

  // Handle direct click on entry content to start inline editing
  const handleContentClick = (e: React.MouseEvent, entry: Entry, index: number) => {
    e.stopPropagation();
    
    // If this entry is already selected, enter edit mode
    if (selectedIndex === index) {
      setEditingId(entry.id);
      setEditContent(entry.content);
    } else {
      // First click: clear any existing states and select the entry
      setHoveredIndex(-1); // Clear any hover state
      setIsMouseActive(false); // Use keyboard-style highlighting initially
      setSelectedIndex(index);
      
      // Ensure input field has focus so Delete key works
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Handle mouse enter with priority over keyboard
  const handleMouseEnter = (index: number) => {
    // Completely ignore mouse hover when keyboard selection is active
    // Mouse can only take control via explicit clicks, not hover
    if (selectedIndex !== -1) {
      return;
    }
    
    setHoveredIndex(index);
    setIsMouseActive(true);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    // Only clear hover if keyboard selection is not active
    if (selectedIndex === -1) {
      setHoveredIndex(-1);
    }
  };

  // Handle click on input area to clear entry highlighting
  const handleInputClick = () => {
    setSelectedIndex(-1);
    setHoveredIndex(-1);
    setIsMouseActive(false);
    setEditingId(null); // Exit edit mode
    setEditContent(''); // Clear edit content
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
      <form onSubmit={handleSubmit} className="mb-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start">
          <textarea
            ref={inputRef}
            value={entry}
            onChange={handleEntryChange}
            onKeyDown={handleKeyPress}
            placeholder="Type entry, press Cmd+Enter to submit..."
            disabled={isSubmitting}
            className={`flex-1 bg-transparent border-none outline-none text-cyan-400 placeholder-cyan-600 font-mono resize-none min-h-[1.5rem] scrollbar-hide ${!entry ? 'animate-pulse' : ''} focus:animate-none cursor-text`}
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
            onClick={handleInputClick}
          />
          {isSubmitting && (
            <span className="text-yellow-400 text-sm ml-2 mt-1">saving...</span>
          )}
        </div>
      </form>

      {/* Cyber Animation */}
      <AnimatePresence>
        {showCyberAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mb-4 p-4 border border-cyan-400 bg-black/80 rounded font-mono text-cyan-400"
          >
            <div className="flex items-center space-x-2">
              <div className="text-green-400 animate-spin">▲</div>
              <div className="text-cyan-400 animate-pulse">sending entry</div>
              <div className="flex space-x-1">
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                >
                  .
                </motion.span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                >
                  .
                </motion.span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: 0.4 }}
                >
                  .
                </motion.span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 font-mono">
              <div className="flex items-center space-x-1">
                <span>[</span>
                <motion.div
                  className="flex space-x-0"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5 }}
                >
                  {Array.from({ length: 20 }).map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.075, duration: 0.1 }}
                      className="text-cyan-400"
                    >
                      ▓
                    </motion.span>
                  ))}
                </motion.div>
                <span>]</span>
              </div>
              <div className="mt-1 text-cyan-600">
                ► transmission protocol: SECURE
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Cyber Animation */}
      <AnimatePresence>
        {showDeleteAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mb-4 p-4 border border-green-400 bg-black/80 rounded font-mono text-green-400"
          >
            <div className="flex items-center space-x-2">
              <div className="text-green-400 animate-spin">▼</div>
              <div className="text-green-400 animate-pulse">deleting entry</div>
              <div className="flex space-x-1">
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.4, repeat: Infinity, delay: 0 }}
                >
                  .
                </motion.span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.4, repeat: Infinity, delay: 0.15 }}
                >
                  .
                </motion.span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.4, repeat: Infinity, delay: 0.3 }}
                >
                  .
                </motion.span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 font-mono">
              <div className="flex items-center space-x-1">
                <span>[</span>
                <motion.div
                  className="flex space-x-0"
                  initial={{ width: "100%" }}
                  animate={{ width: 0 }}
                  transition={{ duration: 1.2 }}
                >
                  {Array.from({ length: 15 }).map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.1 }}
                      className="text-green-400"
                    >
                      ▓
                    </motion.span>
                  ))}
                </motion.div>
                <span>]</span>
              </div>
              <div className="mt-1 text-green-600">
                ► termination protocol: CONFIRMED
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-black border border-green-400 shadow-lg shadow-green-400/20 p-6 max-w-md w-full mx-4 font-mono relative"
            >
              {/* Simple scanning line */}
              <motion.div
                className="absolute top-0 left-0 w-full h-0.5 bg-green-400"
                animate={{ 
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              <div className="relative z-10">
                {/* Header */}
                <div className="text-green-400 mb-4 text-center">
                  <div className="text-sm font-bold">DELETION PROTOCOL</div>
                </div>

                {/* Main content */}
                <div className="text-center mb-6">
                  <motion.div 
                    className="text-yellow-400 text-xs mb-3"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ⚠️ WARNING: IRREVERSIBLE OPERATION
                  </motion.div>
                  
                  <div className="text-gray-300 mb-4 text-sm">
                    <div className="text-green-400 mb-2">$ rm --confirm entry</div>
                    <div className="text-cyan-400">
                      Are you sure you want to{" "}
                      <span className="text-green-400 font-bold">delete</span>
                      {" "}this entry?
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex space-x-3 justify-center">
                  <motion.button
                    onClick={confirmDelete}
                    className="bg-green-900/30 text-green-400 border border-green-400 hover:bg-green-400 hover:text-black px-4 py-2 transition-all duration-200 font-bold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    [Y] DELETE
                  </motion.button>
                  
                  <motion.button
                    onClick={cancelDelete}
                    className="bg-gray-900/30 text-cyan-400 border border-cyan-400 hover:bg-cyan-400 hover:text-black px-4 py-2 transition-all duration-200 font-bold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    [N] CANCEL
                  </motion.button>
                </div>

                {/* Minimal footer */}
                <div className="text-xs text-gray-500 mt-4 text-center opacity-60">
                  SECURITY LEVEL: HIGH
                </div>
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

      {/* Error state */}
      {error && (
        <div className="text-sm mb-2 text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 p-2 rounded">
          &gt; ERROR: {error}
          <div className="text-xs text-gray-400 mt-1">
            Tip: Try refreshing the page or check the console for more details.
          </div>
        </div>
      )}

      {/* Entries - Pure terminal output style */}
      {!loading && !error && (
        <div className="space-y-1">
          {entries.length === 0 ? (
            <div className="text-gray-500 text-sm">
              &gt; No entries yet. Start typing above!
            </div>
          ) : (
            <>
              {/* Timestamp toggle control */}
              <div className="flex justify-end mb-2">
                <button
                  onClick={handleTimestampToggleClick}
                  className="text-gray-400 hover:text-yellow-400 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 bg-transparent border-none p-1 font-mono"
                  title={timestampsCollapsed ? "Show timestamps" : "Hide timestamps"}
                >
                  --time
                </button>
              </div>
              
              <AnimatePresence mode="popLayout">
                {entries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`group transition-all duration-200 entry-container ${
                      // Only show mouse hover if no keyboard selection is active
                      selectedIndex === -1 && isMouseActive && hoveredIndex === index
                        ? 'bg-cyan-400/5 shadow-lg shadow-cyan-400/10'
                        : selectedIndex === index 
                        ? 'bg-cyan-400/10 border-l-2 border-cyan-400 pl-2' 
                        : ''
                    }`}
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={handleMouseLeave}
                    onClick={(e) => e.stopPropagation()}
                    data-entry-index={index}
                  >
                    {editingId === entry.id ? (
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500">
                          {formatTimestamp(entry.createdAt)} (editing)
                        </div>
                        <div className="flex items-center">
                          <span className="text-cyan-400 mr-2">&gt;</span>
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            onKeyDown={(e) => handleEditKeyPress(e, entry.id)}
                            className="flex-1 bg-transparent border-none outline-none text-cyan-400 font-mono cursor-text resize-none min-h-[1.5rem] scrollbar-hide"
                            autoFocus
                            rows={1}
                            data-editing-area="true"
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
                        </div>
                        <div className="text-xs text-gray-500 ml-4">
                          Press Cmd+Enter to save • Press Escape to cancel • 
                          <button
                            onClick={() => handleSaveEdit(entry.id)}
                            className="text-green-400 hover:text-green-300 ml-2 underline cursor-pointer"
                          >
                            save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-400 hover:text-gray-300 ml-2 underline cursor-pointer"
                          >
                            cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="py-1">
                          <div className="flex flex-wrap items-start gap-2">
                            {!timestampsCollapsed && (
                              <div 
                                className={`font-mono text-base text-gray-500 shrink-0 mr-4 flex items-center cursor-pointer transition-colors ${selectedIndex === -1 ? 'hover:text-yellow-400' : ''}`}
                                onClick={handleTimestampToggleClick}
                                title={timestampsCollapsed ? "Show timestamps" : "Hide timestamps"}
                              >
                                {formatTimestamp(entry.createdAt)}
                              </div>
                            )}
                            <div 
                              className={`font-mono text-base text-cyan-400 flex-1 min-w-0 break-words cursor-text hover:bg-cyan-400/5 hover:text-cyan-300 transition-all duration-200 rounded px-1 py-0.5 ${accomplishedEntries.has(entry.id) ? 'line-through text-gray-500 opacity-60' : ''}`}
                              onClick={(e) => handleContentClick(e, entry, index)}
                              title="Click to edit"
                              data-entry-content="true"
                            >
                              {entry.content}
                              {accomplishedEntries.has(entry.id) && <span className="ml-2 text-green-400 text-xs">✓ accomplished</span>}
                            </div>
                            <div className="flex space-x-1 shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleContentClick(e, entry, index);
                                }}
                                className="text-cyan-400 hover:text-yellow-400 text-xs cursor-pointer transition-colors"
                              >
                                [E]
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(entry.id);
                                }}
                                className="text-cyan-400 hover:text-yellow-400 text-xs cursor-pointer transition-colors"
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
            </>
          )}
        </div>
      )}
    </div>
  );
} 