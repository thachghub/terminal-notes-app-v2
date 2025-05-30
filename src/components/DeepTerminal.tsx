'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import dynamic from 'next/dynamic';

interface Entry {
  id: string;
  userId: string;
  content: string; // Can be plain text (old) or HTML (new)
  entryType?: string; // To distinguish entry types if needed in future
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

const TiptapEditor = dynamic(() => import('./TiptapEditor'), { ssr: false });

// Helper to check if content is likely HTML
const isHtml = (str: string): boolean => {
  if (!str) return false;
  const trimmed = str.trim();
  return trimmed.startsWith('<') && trimmed.endsWith('>');
};

// Helper to convert plain text to basic HTML paragraphs
const plainTextToHtml = (text: string): string => {
  if (!text) return '<p></p>';
  return text
    .split(/\n\s*\n/) // Split by double newlines (paragraph breaks)
    .map(paragraph => paragraph.trim())
    .filter(paragraph => paragraph.length > 0)
    .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
    .join('');
};

export default function DeepTerminal({ inputPlaceholder }: { inputPlaceholder?: string }) {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [entry, setEntry] = useState(''); // This will be HTML from Tiptap
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

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

    // Entry state already contains HTML from TiptapEditor
    if (!entry.trim() || entry.trim() === '<p></p>') { // Check for empty Tiptap content
      setFeedback(t('entry_cannot_be_empty'));
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 2000);
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'deepterminalentries'), {
        userId: user.uid,
        content: entry, // Save HTML directly
        entryType: 'deep_tiptap', // Mark as new Tiptap entry
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setFeedback(t('entry_submitted_successfully'));
      setShowFeedback(true);
      setEntry(''); // Clear the Tiptap editor (it will reset via its content prop)
      setTimeout(() => setShowFeedback(false), 2000);
    } catch (error) {
      console.error('Error saving entry:', error);
      setFeedback(t('entry_submission_failed'));
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
    } finally {
      setIsSubmitting(false);
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
        <form onSubmit={handleSubmit} className="space-y-2" onClick={(e) => e.stopPropagation()}>
          <TiptapEditor
            content={entry} // Pass current HTML state to Tiptap
            placeholder={user && user.emailVerified ? (inputPlaceholder || t('typeEntry')) : t('entry_field_disabled')}
            onChange={setEntry} // onChange provides HTML output from Tiptap
          />
          {isSubmitting && (
            <span className="text-yellow-400 text-sm pt-2">{t('saving')}</span>
          )}
           <button 
              type="submit" 
              disabled={isSubmitting || !user || !user.emailVerified}
              className="mt-2 px-4 py-2 border border-cyan-500 text-cyan-300 hover:bg-cyan-500/10 disabled:opacity-50 font-mono text-sm"
            >
              {isSubmitting ? t('saving') : "Submit Entry" /* TODO: Replace with t('submit_entry') after adding to en.json */}
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
                <div key={item.id} className="text-cyan-400 font-mono bg-black/20 p-4 rounded border border-cyan-700/20">
                  <div className="text-xs text-gray-500 mb-2 flex justify-between">
                    <span>{formatTimestamp(item.createdAt)}</span>
                    {item.updatedAt && item.updatedAt.seconds !== item.createdAt.seconds && (
                      <span className="italic">(edited: {formatTimestamp(item.updatedAt)})</span>
                    )}
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

      {/* Markdown preview removed as Tiptap is WYSIWYG */}
    </div>
  );
} 