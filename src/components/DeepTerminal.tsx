'use client';

import { useState, useEffect } from 'react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !user.emailVerified) {
      setFeedback(t('please_sign_in_to_make_entries'));
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
      return;
    }

    // Entry state already contains HTML from Tiptap
    if (!entry.trim() || entry.trim() === '<p></p>' || entry.trim() === '<h1></h1>') { // Check for empty Tiptap content
      setFeedback(t('entry_cannot_be_empty'));
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 2000);
      return;
    }

    setIsSubmitting(true);
    try {
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
    } catch (error) {
      console.error('Error saving entry:', error);
      setFeedback(editingEntry ? 'Failed to update entry' : t('entry_submission_failed'));
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
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

  const handleDelete = async (entryId: string) => {
    if (!window.confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'deepterminalentries', entryId));
      setFeedback('Entry deleted successfully');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 2000);
    } catch (error) {
      console.error('Error deleting entry:', error);
      setFeedback('Failed to delete entry');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
    }
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
            {t('press_enter_to_submit')} • {t('type_quick_notes_thoughts_or_reminders')}
          </div>
        )}
      </div>
      
      {/* Display saved entries */}
      {user && user.emailVerified && (
        <div className="mt-8 pt-4 border-t border-cyan-700/30">
          <h3 className="text-lg text-cyan-300 mb-4">Saved Deep Entries:</h3>
          {loading ? (
            <div className="text-gray-400 text-sm">Loading entries...</div>
          ) : entries.length === 0 ? (
            <div className="text-gray-500 text-sm">No deep entries yet. Start typing above!</div>
          ) : (
            <div className="space-y-6">
              {entries.map((item) => (
                <div key={item.id} className="relative group text-cyan-400 font-mono bg-black/20 p-4 rounded border border-cyan-700/20">
                  <div className="text-xs text-gray-500 mb-2 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <span>{formatTimestamp(item.createdAt)}</span>
                      {item.updatedAt && item.updatedAt.seconds !== item.createdAt.seconds && (
                        <span className="italic">(edited: {formatTimestamp(item.updatedAt)})</span>
                      )}
                      {/* Hover controls next to timestamp */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-cyan-400 space-x-2">
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
                      </div>
                    </div>
                  </div>
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
    </div>
  );
} 