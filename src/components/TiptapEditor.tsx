'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import React, { useEffect, useState } from 'react';

interface TiptapEditorProps {
  content?: string;
  placeholder?: string;
  onChange?: (content: string) => void;
  onTimestampChange?: (timestamp: Date) => void;
  defaultTimestamp?: Date;
}

const ensureFirstBlockIsH1 = (editor: Editor) => {
  if (!editor.isEditable) return;

  const { doc } = editor.state;
  if (doc.childCount === 0) {
    // Document is empty, insert an H1
    editor.commands.setContent('<h1></h1>', false); // false to not trigger onUpdate recursively
    return;
  }

  const firstNode = doc.firstChild;
  if (firstNode) {
    if (firstNode.type.name !== 'heading' || firstNode.attrs.level !== 1) {
      // First node is not an H1, try to set it to H1
      // This might be too aggressive if user explicitly changes it. 
      // We need a way to detect user intent vs. programmatic changes or empty states.
      // For now, let's just try to set it if it's a paragraph.
      if (firstNode.type.name === 'paragraph') {
         // Check if it's the only node and it's empty, then replace with H1
        if (doc.childCount === 1 && firstNode.content.size === 0) {
            editor.chain().focus().clearContent().setHeading({ level: 1 }).run();
        } else {
            // Select the first node's content range and apply H1
            // from: 1 (after the opening tag of the first node)
            // to: 1 + firstNode.content.size
            // However, it's safer to set the node type for the node's current position.
            editor.chain().focus().setTextSelection({ from: 0, to: firstNode.nodeSize }).setHeading({ level: 1 }).run();
        }
      }
    } else if (firstNode.type.name === 'heading' && firstNode.attrs.level === 1 && firstNode.content.size === 0 && doc.childCount > 1) {
      // First node is an empty H1, and there's more content. This can happen if user deletes H1 content.
      // Potentially do nothing, or ensure focus stays, or remove it if truly empty and other content exists?
      // For now, let's leave it. The placeholder should show.
    }
  }
};

// Helper function to count words and characters
const getTextStats = (text: string) => {
  const plainText = text.replace(/<[^>]*>/g, '').trim(); // Strip HTML tags
  const words = plainText ? plainText.split(/\s+/).length : 0;
  const characters = plainText.length;
  return { words, characters };
};

export default function TiptapEditor({ 
  content = '', 
  placeholder = 'Start typing...', 
  onChange,
  onTimestampChange,
  defaultTimestamp = new Date()
}: TiptapEditorProps) {
  const [customTimestamp, setCustomTimestamp] = useState<Date>(defaultTimestamp);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [textStats, setTextStats] = useState({ words: 0, characters: 0 });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable other markdown-like input for now to simplify
        heading: { levels: [1, 2, 3, 4, 5, 6] }, // Ensure H1 is available
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading' && node.attrs.level === 1 && node.content.size === 0) {
            return 'Enter title...';
          }
          return placeholder; // Default placeholder for other situations
        },
        showOnlyWhenEditable: true,
        showOnlyCurrent: true, // Show placeholder on the current empty node
      }),
    ],
    content: content || '<h1></h1>', // Start with an H1 if content is empty
    editorProps: {
      attributes: {
        class: 'bg-transparent outline-none min-h-[8rem] text-cyan-200 font-mono w-full tiptap-editor',
        spellCheck: 'true',
        style: 'resize: vertical;'
      },
    },
    onCreate({ editor }) {
      ensureFirstBlockIsH1(editor);
      // Initialize text stats
      const htmlContent = editor.getHTML();
      setTextStats(getTextStats(htmlContent));
    },
    onUpdate({ editor }) {
      // More refined logic will be needed here to prevent loops and respect user overrides.
      // For now, this might be too aggressive or insufficient.
      const firstNode = editor.state.doc.firstChild;
      if (firstNode && (firstNode.type.name !== 'heading' || firstNode.attrs.level !== 1)) {
        // If the first node is a paragraph and empty, convert it to H1
        if (firstNode.type.name === 'paragraph' && firstNode.content.size === 0 && editor.state.doc.childCount === 1) {
            editor.chain().clearContent().setHeading({ level: 1 }).run();
        }
      } else if (firstNode && firstNode.type.name === 'heading' && firstNode.attrs.level === 1 && editor.state.doc.childCount === 0) {
        // This case means the H1 is there but the document became empty, perhaps due to clearing after H1.
        // This might conflict with the initial onCreate if not careful.
        // Let's ensure an empty H1 if doc is empty.
        if(editor.isEmpty) {
            editor.chain().focus().clearContent().setHeading({ level: 1 }).run();
        }
      }
      
      const htmlContent = editor.getHTML();
      
      // Update text stats
      setTextStats(getTextStats(htmlContent));
      
      if (onChange) {
        onChange(htmlContent);
      }
    },
  });

  // Watch for content prop changes and update editor content
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentContent = editor.getHTML();
      // Only update if the content is actually different to avoid infinite loops
      if (currentContent !== content) {
        editor.commands.setContent(content || '<h1></h1>', false);
        // Focus the editor and scroll to it
        setTimeout(() => {
          editor.commands.focus('start');
          // Scroll the editor into view
          const editorElement = editor.view.dom;
          if (editorElement) {
            editorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  }, [editor, content]);

  // Handle timestamp changes
  const handleTimestampChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    setCustomTimestamp(newDate);
    if (onTimestampChange) {
      onTimestampChange(newDate);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="space-y-2">
      {/* Date Picker Section */}
      <div className="flex items-center justify-between text-xs text-cyan-400/80">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="px-2 py-1 border border-cyan-700/40 rounded hover:border-cyan-400/60 transition-colors"
          >
            {formatDate(customTimestamp)}
          </button>
          {showDatePicker && (
            <input
              type="datetime-local"
              value={customTimestamp.toISOString().slice(0, 16)}
              onChange={handleTimestampChange}
              className="px-2 py-1 border border-cyan-700/40 rounded hover:border-cyan-400/60 transition-colors text-white bg-transparent focus:border-cyan-400/60 focus:outline-none cursor-pointer"
              style={{
                colorScheme: 'dark'
              }}
            />
          )}
        </div>
      </div>

      {/* Editor Section */}
      <div className="relative w-full border border-cyan-700/40 rounded bg-black/10 p-2 focus-within:border-cyan-400 transition-all">
        <EditorContent editor={editor} />
        
        {/* Word/Character Counter */}
        <div className="absolute bottom-2 right-2 text-sm text-gray-500 font-mono opacity-60">
          {textStats.words} words • {textStats.characters} chars
        </div>
      </div>
    </div>
  );
} 