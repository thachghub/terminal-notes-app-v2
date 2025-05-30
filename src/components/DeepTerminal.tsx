'use client';

import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import dynamic from 'next/dynamic';

interface Entry {
  id: string;
  userId: string;
  content: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

const TiptapEditor = dynamic(() => import('./TiptapEditor'), { ssr: false });

export default function DeepTerminal({ inputPlaceholder }: { inputPlaceholder?: string }) {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [entry, setEntry] = useState('');
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

    if (!entry.trim()) {
      setFeedback(t('entry_cannot_be_empty'));
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 2000);
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'deepterminalentries'), {
        userId: user.uid,
        content: entry.trim(),
        entryType: 'deep',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setFeedback(t('entry_submitted_successfully'));
      setShowFeedback(true);
      setEntry(''); // Clear the textarea
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

  const formatTimestamp = (timestamp: Timestamp) => {
    if (!timestamp) return 'Unknown time';
    return timestamp.toDate().toLocaleString();
  };

  return (
    <div className="space-y-4">
      {/* Deep Terminal Section */}
      <div className="text-cyan-400">
        {/* TODO: Add markdown toolbar here */}
        <form onSubmit={handleSubmit} className="space-y-2" onClick={(e) => e.stopPropagation()}>
          <TiptapEditor
            content={entry}
            placeholder={user && user.emailVerified ? (inputPlaceholder || t('typeEntry')) : t('entry_field_disabled')}
            onChange={setEntry}
          />
          {isSubmitting && (
            <span className="text-yellow-400 text-sm pt-2">{t('saving')}</span>
          )}
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
        <div className="mt-6">
          {loading ? (
            <div className="text-gray-400 text-sm">Loading entries...</div>
          ) : entries.length === 0 ? (
            <div className="text-gray-500 text-sm">No entries yet. Start typing above!</div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => (
                <div key={entry.id} className="text-cyan-400 font-mono">
                  <div className="text-xs text-gray-500 mb-1">
                    {formatTimestamp(entry.createdAt)}
                  </div>
                  <div className="text-sm whitespace-pre-wrap">
                    {entry.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Markdown preview should be outside the bordered box */}
      <div className="mt-4 text-cyan-200 text-sm font-mono min-h-[3rem]">
        {/* Markdown preview will render here */}
        <span className="opacity-60">[Markdown preview coming soon]</span>
      </div>
    </div>
  );
} 