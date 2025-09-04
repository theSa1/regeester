"use client";

import { Button } from "@/components/ui/button";
import { cn, proseClasses } from "@/lib/utils";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import {
  Bold,
  Heading1,
  Heading2,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo,
} from "lucide-react";
import React, { useCallback } from "react";

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

export const RichTextEditor = ({
  content = "",
  onChange,
  placeholder = "Start typing...",
  className,
  editable = true,
}: RichTextEditorProps) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextStyle,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-main underline font-base",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: proseClasses,
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title?: string;
  }) => (
    <Button
      type="button"
      variant={isActive ? "default" : "neutral"}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-8 w-8 p-0 text-xs",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      title={title}
    >
      {children}
    </Button>
  );

  return (
    <div className={cn("w-full", className)}>
      {editable && (
        <div className="border-2 border-border bg-secondary-background p-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Text formatting */}
            <div className="flex items-center gap-2 border-r-2 border-border pr-2">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive("bold")}
                title="Bold"
              >
                <Bold className="h-3 w-3" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive("italic")}
                title="Italic"
              >
                <Italic className="h-3 w-3" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive("underline")}
                title="Underline"
              >
                <UnderlineIcon className="h-3 w-3" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive("strike")}
                title="Strikethrough"
              >
                <Strikethrough className="h-3 w-3" />
              </ToolbarButton>
            </div>

            {/* Headings */}
            <div className="flex items-center gap-2 border-r-2 border-border pr-2">
              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                isActive={editor.isActive("heading", { level: 1 })}
                title="Heading 1"
              >
                <Heading1 className="h-3 w-3" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                isActive={editor.isActive("heading", { level: 2 })}
                title="Heading 2"
              >
                <Heading2 className="h-3 w-3" />
              </ToolbarButton>
            </div>

            {/* Lists */}
            <div className="flex items-center gap-2 border-r-2 border-border pr-2">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive("bulletList")}
                title="Bullet List"
              >
                <List className="h-3 w-3" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive("orderedList")}
                title="Numbered List"
              >
                <ListOrdered className="h-3 w-3" />
              </ToolbarButton>
            </div>

            {/* Other formatting */}
            <div className="flex items-center gap-2 border-r-2 border-border pr-2">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive("blockquote")}
                title="Quote"
              >
                <Quote className="h-3 w-3" />
              </ToolbarButton>
              <ToolbarButton
                onClick={setLink}
                isActive={editor.isActive("link")}
                title="Link"
              >
                <LinkIcon className="h-3 w-3" />
              </ToolbarButton>
            </div>

            {/* Undo/Redo */}
            <div className="flex items-center gap-2">
              <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                title="Undo"
              >
                <Undo className="h-3 w-3" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                title="Redo"
              >
                <Redo className="h-3 w-3" />
              </ToolbarButton>
            </div>
          </div>
        </div>
      )}

      <div
        className={cn(
          "min-h-[200px] border-2 border-border bg-secondary-background p-4 cursor-text",
          editable && "border-t-0",
          !editable && "shadow-shadow"
        )}
        onClick={() => {
          if (editable) {
            editor.commands.focus();
          }
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;
