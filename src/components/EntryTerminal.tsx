'use client';

import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';

export default function EntryTerminal({ inputPlaceholder }: { inputPlaceholder?: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [entry, setEntry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Auto-focus on load
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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
      await addDoc(collection(db, 'entryterminalentries'), {
        userId: user.uid,
        content: entry.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setFeedback(t('entry_submitted_successfully'));
      setShowFeedback(true);
      setEntry(''); // Clear the input field
      
      // Auto-hide feedback after 2 seconds
      setTimeout(() => setShowFeedback(false), 2000);
    } catch (error) {
      console.error('Error saving entry:', error);
      setFeedback(t('entry_submission_failed'));
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
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="space-y-4">
      {/* Entry Terminal Section */}
      <div className="border border-cyan-500 text-cyan-400 p-4 bg-black/10 rounded">
        <div className="text-cyan-400 mb-3 text-lg">{t('quick_entry_terminal')}:</div>
        
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-cyan-400 font-mono">&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={user && user.emailVerified ? (inputPlaceholder || t('typeEntry')) : t('entry_field_disabled')}
              disabled={!user || !user.emailVerified || isSubmitting}
              className="flex-1 bg-transparent border-none outline-none text-cyan-400 placeholder-cyan-600 font-mono"
            />
            {isSubmitting && (
              <span className="text-yellow-400 text-sm">{t('saving')}</span>
            )}
          </div>
        </form>

        {/* Authentication message for non-authenticated users */}
        {(!user || !user.emailVerified) && (
          <div className="mt-2 text-gray-400 text-sm font-mono">
            &gt; {t('entry_field_disabled')}
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
    </div>
  );
} 