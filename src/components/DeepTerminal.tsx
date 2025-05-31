'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, where, orderBy, onSnapshot, Timestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';

interface Entry {
  id: string;
  userId: string;
  content: string; // Can be plain text (old) or HTML (new)
  entryType?: string; // To distinguish entry types if needed in future
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  customTimestamp?: Timestamp | Date | null; // Can be either Firebase Timestamp or Date
}

const TiptapEditor = dynamic(() => import('./TiptapEditor'), { ssr: false });

// Helper to check if content is likely HTML
const isHtml = (str: string): boolean => {
  if (!str) return false;
  const trimmed = str.trim();
  return trimmed.startsWith('<') && trimmed.endsWith('>');
};

// Helper to convert plain text to basic HTML
const plainTextToHtml = (text: string): string => {
  return text
    .split('\n')
    .map(line => `<p>${line}</p>`)
    .join('');
};

export default function DeepTerminal({ inputPlaceholder }: { inputPlaceholder?: string }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [entry, setEntry] = useState(''); // This will be HTML from Tiptap
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customTimestamp, setCustomTimestamp] = useState<Date | null>(null);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [editorKey, setEditorKey] = useState<string>('new-entry');
  const [showCyberAnimation, setShowCyberAnimation] = useState(false);
  const [progress, setProgress] = useState(0); // For block loading bar
  const blockCount = 15;
  const animationDuration = 2000; // ms
  const [showDeleteModal, setShowDeleteModal] = useState<{ id: string | null, batch?: boolean }>( { id: null, batch: false });
  const [selectMode, setSelectMode] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);

  useEffect(() => {
    if (!user || !user.emailVerified) {
      setLoading(false);
      setEntries([]);
      return;
    }

    const q = query(
      collection(db, 'deepterminalentries'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const entriesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Entry[];
        setEntries(entriesData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching deep terminal entries:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Animate progress for blocky loading bar
  useEffect(() => {
    if (showCyberAnimation) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < blockCount) {
            return prev + 1;
          } else {
            clearInterval(interval);
            return prev;
          }
        });
      }, animationDuration / blockCount);
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [showCyberAnimation]);

  useEffect(() => {
    if (!user || !user.emailVerified) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isSubmitting) {
          // Use a synthetic event for handleSubmit
          const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
          handleSubmit(fakeEvent);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user, isSubmitting, entry, editingEntry, customTimestamp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !user.emailVerified) {
      setFeedback(t('please_sign_in_to_make_entries'));
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
      return;
    }

    // Entry state already contains HTML from TiptapEditor
    if (!entry.trim() || entry.trim() === '<p></p>' || entry.trim() === '<h1></h1>') { // Check for empty Tiptap content
      setFeedback(t('entry_cannot_be_empty'));
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 2000);
      return;
    }

    setIsSubmitting(true);
    try {
      setShowCyberAnimation(true); // Show cyber animation
      if (editingEntry) {
        // Update existing entry
        const entryRef = doc(db, 'deepterminalentries', editingEntry.id);
        await updateDoc(entryRef, {
          content: entry,
          updatedAt: new Date(),
          customTimestamp: customTimestamp ? customTimestamp : editingEntry.customTimestamp
        });
        setFeedback('Entry updated successfully');
        setEditingEntry(null);
      } else {
        // Create new entry
        const timestamp = customTimestamp || new Date();
        await addDoc(collection(db, 'deepterminalentries'), {
          userId: user.uid,
          content: entry, // Save HTML directly
          entryType: 'deep_tiptap', // Mark as new Tiptap entry
          createdAt: timestamp,
          updatedAt: timestamp,
          customTimestamp: customTimestamp ? timestamp : null // Store custom timestamp if set
        });
        setFeedback(t('entry_submitted_successfully'));
      }

      setShowFeedback(true);
      setEntry(''); // Clear the Tiptap editor (it will reset via its content prop)
      setCustomTimestamp(null); // Reset custom timestamp
      setTimeout(() => setShowFeedback(false), 2000);
      setTimeout(() => setShowCyberAnimation(false), 2000); // Hide cyber animation after 2s
    } catch (error) {
      console.error('Error saving entry:', error);
      setFeedback(editingEntry ? 'Failed to update entry' : t('entry_submission_failed'));
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
      setShowCyberAnimation(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (entryToEdit: Entry) => {
    setEditingEntry(entryToEdit);
    setEntry(entryToEdit.content);
    // Convert Firebase Timestamp to JavaScript Date if it exists
    if (entryToEdit.customTimestamp) {
      // Check if it's a Firebase Timestamp object
      if (entryToEdit.customTimestamp && 'toDate' in entryToEdit.customTimestamp && typeof entryToEdit.customTimestamp.toDate === 'function') {
        setCustomTimestamp((entryToEdit.customTimestamp as Timestamp).toDate());
      } else if (entryToEdit.customTimestamp instanceof Date) {
        setCustomTimestamp(entryToEdit.customTimestamp);
      } else {
        // Fallback: try to create a Date from the value
        setCustomTimestamp(new Date(entryToEdit.customTimestamp as any));
      }
    } else {
      setCustomTimestamp(null);
    }
    // Force editor re-initialization with new key
    setEditorKey(`edit-${entryToEdit.id}-${Date.now()}`);
    // Scroll to top of the form
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setEntry('');
    setCustomTimestamp(null);
    // Reset editor key to force fresh initialization
    setEditorKey(`new-entry-${Date.now()}`);
  };

  const handleDelete = (entryId: string) => {
    setShowDeleteModal({ id: entryId, batch: false });
  };

  const handleBatchDelete = () => {
    setShowDeleteModal({ id: null, batch: true });
  };

  const confirmDelete = async () => {
    if (showDeleteModal.batch) {
      // Batch delete
      const batchIds = [...selectedEntries];
      setShowDeleteModal({ id: null, batch: false });
      setSelectMode(false);
      setSelectedEntries([]);
      try {
        await Promise.all(batchIds.map(id => deleteDoc(doc(db, 'deepterminalentries', id))));
        setFeedback('Selected entries deleted successfully');
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 2000);
      } catch (error) {
        setFeedback('Failed to delete selected entries');
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 3000);
      }
      return;
    }
    if (!showDeleteModal.id) return;
    try {
      await deleteDoc(doc(db, 'deepterminalentries', showDeleteModal.id));
      setFeedback('Entry deleted successfully');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 2000);
    } catch (error) {
      setFeedback('Failed to delete entry');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
    } finally {
      setShowDeleteModal({ id: null, batch: false });
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal({ id: null, batch: false });
  };

  const toggleSelectMode = () => {
    setSelectMode((prev) => !prev);
    setSelectedEntries([]);
  };

  const handleSelectEntry = (id: string) => {
    setSelectedEntries((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
    );
  };

  const cancelSelection = () => {
    setSelectMode(false);
    setSelectedEntries([]);
  };

  const handleCopy = async (content: string) => {
    try {
      // Strip HTML tags for cleaner clipboard content
      const plainText = content.replace(/<[^>]*>/g, '').trim();
      await navigator.clipboard.writeText(plainText);
      setFeedback('Entry copied to clipboard');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 1500);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      setFeedback('Failed to copy to clipboard');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 2000);
    }
  };

  const formatTimestamp = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return 'Unknown time';
    return timestamp.toDate().toLocaleString();
  };

  const getDisplayContent = (content: string, entryType?: string): string => {
    // If it's explicitly marked as a Tiptap entry or looks like HTML, use as is.
    if (entryType === 'deep_tiptap' || isHtml(content)) {
      return content;
    }
    // Otherwise, assume it's old plain text and convert to basic HTML.
    return plainTextToHtml(content);
  };

  return (
    <div className="space-y-4">
      {/* Deep Terminal Section */}
      <div className="text-cyan-400">
        {editingEntry && (
          <div className="mb-4 p-3 bg-cyan-900/20 border border-cyan-700/40 rounded text-sm">
            <div className="flex items-center justify-between">
              <span className="text-cyan-300">✏️ Editing entry from {formatTimestamp(editingEntry.createdAt)}</span>
              <button 
                onClick={handleCancelEdit}
                className="text-xs text-gray-400 hover:text-cyan-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2" onClick={(e) => e.stopPropagation()}>
          <TiptapEditor
            key={editorKey} // Force re-initialization when key changes
            content={editingEntry ? editingEntry.content : entry} // Pass editing content or current entry
            placeholder={user && user.emailVerified ? (inputPlaceholder || t('typeEntry')) : t('entry_field_disabled')}
            onChange={setEntry} // onChange provides HTML output from Tiptap
            onTimestampChange={setCustomTimestamp} // Handle custom timestamp changes
            defaultTimestamp={customTimestamp || new Date()} // Use custom timestamp or current time
          />
          {isSubmitting && (
            <span className="text-yellow-400 text-sm pt-2">{t('saving')}</span>
          )}
          <button 
            type="submit" 
            disabled={isSubmitting || !user || !user.emailVerified}
            className="mt-2 px-4 py-2 border border-cyan-500 text-cyan-300 hover:bg-cyan-500/10 disabled:opacity-50 font-mono text-sm"
          >
            {isSubmitting ? t('saving') : (editingEntry ? 'Update Entry' : "Submit Entry")}
          </button>
        </form>

        {/* Authentication message for non-authenticated users */}
        {(!user || !user.emailVerified) && (
          <div className="mt-2 text-gray-400 text-sm font-mono">
            &gt;&gt; {t('entry_field_disabled')}
          </div>
        )}

        {/* Feedback messages */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 text-green-400 text-sm font-mono"
            >
              {feedback}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        {user && user.emailVerified && (
          <div className="mt-3 text-gray-500 text-xs">
            Press Cmd+Enter (Ctrl+Enter) to submit long form entry records
          </div>
        )}

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
                <div className="text-green-400 animate-spin text-3xl">▲</div>
                <div className="text-cyan-400 animate-pulse text-2xl">sending entry</div>
                <div className="flex space-x-1">
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                  >.</motion.span>
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                  >.</motion.span>
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: 0.4 }}
                  >.</motion.span>
                </div>
              </div>
              {/* Loading Bar - Blocky Style */}
              <div className="mt-4 w-full h-2 bg-cyan-900/40 border border-cyan-700/40 flex">
                {Array.from({ length: blockCount }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-full mx-[1px]"
                    style={{
                      backgroundColor: i < progress ? '#22d3ee' : 'transparent',
                      boxShadow: i < progress ? '0 0 6px #22d3ee, 0 0 12px #22d3ee40' : undefined,
                      transition: 'background-color 0.2s, box-shadow 0.2s',
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Display saved entries */}
      {user && user.emailVerified && (
        <div className="mt-8 pt-4 border-t border-cyan-700/30 relative">
          {/* Top controls and title in a flex row */}
          <div className="flex items-center gap-4 mb-4">
            {selectMode && (
              <>
                <button
                  onClick={cancelSelection}
                  className="text-green-400 hover:text-cyan-400 text-2xl font-bold bg-black/70 rounded-full w-8 h-8 flex items-center justify-center border border-green-400 hover:border-cyan-400 transition-colors"
                  title="Cancel selection mode"
                >
                  ×
                </button>
                {selectedEntries.length > 0 && (
                  <button
                    onClick={handleBatchDelete}
                    className="px-3 py-1 border border-cyan-400 text-cyan-300 font-mono text-xs rounded hover:bg-cyan-400/10 transition-colors"
                  >
                    Delete Selected ({selectedEntries.length})
                  </button>
                )}
              </>
            )}
            <h3 className="text-lg text-cyan-300">Saved Deep Entries:</h3>
          </div>
          {loading ? (
            <div className="text-gray-400 text-sm">Loading entries...</div>
          ) : entries.length === 0 ? (
            <div className="text-gray-500 text-sm">No deep entries yet. Start typing above!</div>
          ) : (
            <div className="space-y-6">
              {entries.map((item) => (
                <div key={item.id} className="relative group text-cyan-400 font-mono bg-black/20 p-4 rounded border border-cyan-700/20">
                  {/* Checkbox and timestamp layout for select mode */}
                  {selectMode ? (
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                      <input
                        type="checkbox"
                        checked={selectedEntries.includes(item.id)}
                        onChange={() => handleSelectEntry(item.id)}
                        className="w-4 h-4 accent-green-400 border-green-400 bg-black ring-1 ring-green-400 focus:ring-2 focus:ring-green-300 transition-shadow duration-150 rounded-none"
                      />
                      <span>{formatTimestamp(item.createdAt)}</span>
                      {item.updatedAt && item.updatedAt.seconds !== item.createdAt.seconds && (
                        <span className="italic">(edited: {formatTimestamp(item.updatedAt)})</span>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 mb-2 flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <span>{formatTimestamp(item.createdAt)}</span>
                        {item.updatedAt && item.updatedAt.seconds !== item.createdAt.seconds && (
                          <span className="italic">(edited: {formatTimestamp(item.updatedAt)})</span>
                        )}
                        {/* Hover controls next to timestamp */}
                        {!selectMode && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-cyan-400 space-x-2 flex items-center">
                            <button 
                              onClick={() => handleCopy(item.content)}
                              className="hover:text-cyan-200 transition-colors"
                              title="Copy to clipboard"
                            >
                              Copy
                            </button>
                            <button 
                              onClick={() => handleEdit(item)}
                              className="hover:text-cyan-200 transition-colors"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="hover:text-red-400 transition-colors"
                            >
                              Delete
                            </button>
                            <span
                              onClick={toggleSelectMode}
                              className="ml-2 cursor-pointer text-cyan-400 hover:text-cyan-200"
                              title="Select Multiple Entries"
                            >
                              Select Multiple
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Render processed content using dangerouslySetInnerHTML */}
                  <div 
                    className="prose prose-sm prose-invert max-w-none text-cyan-200 tiptap-rendered-content"
                    dangerouslySetInnerHTML={{ __html: getDisplayContent(item.content, item.entryType) }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal.id || showDeleteModal.batch ? (
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
              transition={{ type: 'spring', damping: 20 }}
              className="bg-black border border-green-400 shadow-lg shadow-green-400/20 p-6 max-w-md w-full mx-4 font-mono relative"
            >
              {/* Scanning line */}
              <motion.div
                className="absolute top-0 left-0 w-full h-0.5 bg-green-400"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
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
                    <div className="text-green-400 mb-2">$ rm --confirm {showDeleteModal.batch ? 'selected' : 'entry'}</div>
                    <div className="text-cyan-400">
                      {showDeleteModal.batch
                        ? `Are you sure you want to delete ${selectedEntries.length} selected entries?`
                        : 'Are you sure you want to delete this entry?'}
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
        ) : null}
      </AnimatePresence>
    </div>
  );
} 