'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import React from 'react';

interface TiptapEditorProps {
  content?: string;
  placeholder?: string;
  onChange?: (content: string) => void;
}

export default function TiptapEditor({ content = '', placeholder = 'Start typing...', onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
        showOnlyCurrent: false,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-invert bg-transparent outline-none min-h-[8rem] text-cyan-200 font-mono w-full',
        spellCheck: 'true',
        style: 'resize: vertical;'
      },
    },
    onUpdate({ editor }) {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
  });

  return (
    <div className="w-full border border-cyan-700/40 rounded bg-black/10 p-2 focus-within:border-cyan-400 transition-all">
      <EditorContent editor={editor} />
    </div>
  );
} 