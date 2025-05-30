'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import React, { useEffect } from 'react';

interface TiptapEditorProps {
  content?: string;
  placeholder?: string;
  onChange?: (content: string) => void;
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

export default function TiptapEditor({ content = '', placeholder = 'Start typing...', onChange }: TiptapEditorProps) {
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