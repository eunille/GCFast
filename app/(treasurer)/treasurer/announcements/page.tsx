// app/(treasurer)/treasurer/announcements/page.tsx
// Layer 4 — PRESENTATIONAL: Treasurer announcements page (create/edit/delete, mock state)

"use client";

import { useRef, useState } from "react";
import {
  Megaphone,
  Calendar,
  Pin,
  PinOff,
  MoreVertical,
  ImagePlus,
  X,
  Pencil,
  Trash2,
  Check,
  Bold,
  Italic,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// ── Types ────────────────────────────────────────────────────────────────

interface AnnouncementImage {
  id: string;
  url: string; // object URL for now — swap for Supabase Storage URL later
}

interface Announcement {
  id: number;
  title: string;
  category: string;
  date: string;
  isPinned: boolean;
  content: string;
  images: AnnouncementImage[];
}

const categories = ["GCFAS", "Policy", "Academic", "Campus Life", "Reminder"];

// Category → color mapping (mirrors the badge language used on the Budget page)
const categoryStyles: Record<string, string> = {
  GCFAS: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Policy: "bg-rose-50 text-rose-700 border-rose-200",
  Academic: "bg-blue-50 text-blue-700 border-blue-200",
  "Campus Life": "bg-violet-50 text-violet-700 border-violet-200",
  Reminder: "bg-amber-50 text-amber-700 border-amber-200",
};

function categoryClass(category: string) {
  return categoryStyles[category] ?? "bg-muted text-muted-foreground border-border";
}

// ── Lightweight markdown formatting (bold / italic) ────────────────────
// Wraps the current selection in a textarea with `wrapper` chars (e.g. "**"),
// mirroring how Twitter/Discord-style composers apply formatting.
function applyFormatting(
  textarea: HTMLTextAreaElement | null,
  value: string,
  setValue: (v: string) => void,
  wrapper: string
) {
  if (!textarea) return;
  const start = textarea.selectionStart ?? value.length;
  const end = textarea.selectionEnd ?? value.length;
  const selected = value.slice(start, end) || "text";
  const before = value.slice(0, start);
  const after = value.slice(end);
  const next = `${before}${wrapper}${selected}${wrapper}${after}`;
  setValue(next);

  // restore focus + select the wrapped text so the user can keep typing
  requestAnimationFrame(() => {
    textarea.focus();
    const from = start + wrapper.length;
    const to = from + selected.length;
    textarea.setSelectionRange(from, to);
  });
}

// Renders **bold** and *italic* markdown-lite syntax as actual <strong>/<em>.
function renderFormattedText(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      nodes.push(<strong key={key++}>{match[1]}</strong>);
    } else if (match[2] !== undefined) {
      nodes.push(<em key={key++}>{match[2]}</em>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

// Small toolbar shown above a Textarea for applying bold/italic to the selection.
function FormattingToolbar({
  textareaRef,
  value,
  onChange,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 pb-1">
      <button
        type="button"
        title="Bold (Ctrl/Cmd+B)"
        onClick={() => applyFormatting(textareaRef.current, value, onChange, "**")}
        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <Bold className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        title="Italic (Ctrl/Cmd+I)"
        onClick={() => applyFormatting(textareaRef.current, value, onChange, "*")}
        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors italic"
      >
        <Italic className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// Keyboard shortcuts (Ctrl/Cmd+B, Ctrl/Cmd+I) for a formatting-enabled textarea.
function handleFormattingKeyDown(
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  value: string,
  onChange: (v: string) => void
) {
  const isMeta = e.metaKey || e.ctrlKey;
  if (!isMeta) return;
  if (e.key.toLowerCase() === "b") {
    e.preventDefault();
    applyFormatting(e.currentTarget, value, onChange, "**");
  } else if (e.key.toLowerCase() === "i") {
    e.preventDefault();
    applyFormatting(e.currentTarget, value, onChange, "*");
  }
}

// ── Mock initial data ───────────────────────────────────────────────────

const initialAnnouncements: Announcement[] = [
  {
    id: 1,
    title: "DUES COLLECTION FOR 2ND SEM AY 2025-2026",
    category: "Policy",
    date: "July 10, 2026",
    isPinned: true,
    content:
      "Reminder po sa lahat ng members, ang deadline ng dues payment for this semester ay sa July 31, 2026. Pakisettle po sa pinaka-maagang panahon para sa smooth processing ng records.",
    images: [],
  },
];

export default function TreasurerAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);

  // ── Composer state ──────────────────────────────────────────────────
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState(categories[0]);
  const [newImages, setNewImages] = useState<AnnouncementImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const composerTextareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Edit state ──────────────────────────────────────────────────────
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  function handleImageSelect(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<AnnouncementImage[]>>
  ) {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string; // data: URI — CSP-safe
        setter((prev) => [...prev, { id: crypto.randomUUID(), url: dataUrl }]);
      };
      reader.readAsDataURL(file); // TODO: replace with Supabase Storage upload
    });

    e.target.value = "";
  }

  function removeNewImage(id: string) {
    setNewImages((prev) => prev.filter((img) => img.id !== id));
  }

  function handlePost() {
    if (!newContent.trim()) return;
    const newAnnouncement: Announcement = {
      id: Date.now(),
      title: newContent.trim().slice(0, 60),
      category: newCategory,
      date: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      isPinned: false,
      content: newContent.trim(),
      images: newImages,
    };
    setAnnouncements((prev) => [newAnnouncement, ...prev]);
    setNewContent("");
    setNewImages([]);
  }

  function togglePin(id: number) {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isPinned: !a.isPinned } : a))
    );
  }

  function deleteAnnouncement(id: number) {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  }

  function startEdit(a: Announcement) {
    setEditingId(a.id);
    setEditContent(a.content);
  }

  function saveEdit(id: number) {
    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, content: editContent, title: editContent.trim().slice(0, 60) }
          : a
      )
    );
    setEditingId(null);
    setEditContent("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditContent("");
  }

  const pinned = announcements.filter((a) => a.isPinned);
  const regular = announcements.filter((a) => !a.isPinned);

  return (
    <div className="flex flex-col gap-8 w-full pb-12">
      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100">
            <Megaphone className="h-5 w-5 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Announcements
            </h1>
            <p className="text-sm mt-0.5 text-muted-foreground">
              Post updates that will be visible to all members
            </p>
          </div>
        </div>
      </div>

      {/* ── Composer ─────────────────────────────────────────────────── */}
      <Card className="border-border/70 shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <div>
            <FormattingToolbar
              textareaRef={composerTextareaRef}
              value={newContent}
              onChange={setNewContent}
            />
            <Textarea
              ref={composerTextareaRef}
              placeholder="Write an announcement..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              onKeyDown={(e) => handleFormattingKeyDown(e, newContent, setNewContent)}
              rows={4}
              className="resize-none border-border/70 focus-visible:ring-emerald-600/30"
            />
          </div>

          {/* Category picker */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setNewCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  newCategory === cat
                    ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                    : "bg-background text-muted-foreground border-border hover:border-emerald-300 hover:text-emerald-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Image previews */}
          {newImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {newImages.map((img) => (
                <div
                  key={img.id}
                  className="relative group aspect-square overflow-hidden rounded-lg border border-border/70"
                >
                  <img
                    src={img.url}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  <button
                    onClick={() => removeNewImage(img.id)}
                    className="absolute top-1.5 right-1.5 h-6 w-6 flex items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-border/60 mt-1 pt-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleImageSelect(e, setNewImages)}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2 text-muted-foreground border-border/70 hover:text-emerald-700 hover:border-emerald-300"
            >
              <ImagePlus className="h-4 w-4" />
              Add photos
            </Button>
            <Button
              size="sm"
              onClick={handlePost}
              disabled={!newContent.trim()}
              className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
            >
              Post
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Pinned ───────────────────────────────────────────────────── */}
      {pinned.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Pin className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Pinned
            </h2>
          </div>
          {pinned.map((a) => (
            <AnnouncementCard
              key={a.id}
              announcement={a}
              isEditing={editingId === a.id}
              editContent={editContent}
              onEditContentChange={setEditContent}
              onTogglePin={() => togglePin(a.id)}
              onEdit={() => startEdit(a)}
              onSaveEdit={() => saveEdit(a.id)}
              onCancelEdit={cancelEdit}
              onDelete={() => deleteAnnouncement(a.id)}
            />
          ))}
        </div>
      )}

      {/* ── Regular ──────────────────────────────────────────────────── */}
      {regular.length > 0 && (
        <div className="space-y-3">
          {pinned.length > 0 && (
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recent
            </h2>
          )}
          {regular.map((a) => (
            <AnnouncementCard
              key={a.id}
              announcement={a}
              isEditing={editingId === a.id}
              editContent={editContent}
              onEditContentChange={setEditContent}
              onTogglePin={() => togglePin(a.id)}
              onEdit={() => startEdit(a)}
              onSaveEdit={() => saveEdit(a.id)}
              onCancelEdit={cancelEdit}
              onDelete={() => deleteAnnouncement(a.id)}
            />
          ))}
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────── */}
      {announcements.length === 0 && (
        <Card className="border-dashed border-border">
          <CardContent className="py-14 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Megaphone className="h-5 w-5 text-muted-foreground/60" />
            </div>
            <p className="text-sm font-medium text-foreground">No announcements yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Write one above to notify all members.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Announcement Card ────────────────────────────────────────────────────

interface AnnouncementCardProps {
  announcement: Announcement;
  isEditing: boolean;
  editContent: string;
  onEditContentChange: (val: string) => void;
  onTogglePin: () => void;
  onEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
}

function AnnouncementCard({
  announcement,
  isEditing,
  editContent,
  onEditContentChange,
  onTogglePin,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}: AnnouncementCardProps) {
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <Card
      className={`overflow-hidden transition-shadow hover:shadow-md border-border/70 ${
        announcement.isPinned ? "ring-1 ring-amber-200/70 bg-amber-50/20" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <Badge
                variant="outline"
                className={`text-xs font-medium border ${categoryClass(announcement.category)}`}
              >
                {announcement.category}
              </Badge>
              {announcement.isPinned && (
                <Pin className="h-3 w-3 text-amber-500 fill-amber-500" />
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{announcement.date}</span>
            </div>
          </div>

          {/* 3-dot menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onTogglePin}>
                {announcement.isPinned ? (
                  <>
                    <PinOff className="h-4 w-4 mr-2" />
                    Unpin
                  </>
                ) : (
                  <>
                    <Pin className="h-4 w-4 mr-2" />
                    Pin
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {isEditing ? (
          <div className="space-y-2">
            <FormattingToolbar
              textareaRef={editTextareaRef}
              value={editContent}
              onChange={onEditContentChange}
            />
            <Textarea
              ref={editTextareaRef}
              value={editContent}
              onChange={(e) => onEditContentChange(e.target.value)}
              onKeyDown={(e) => handleFormattingKeyDown(e, editContent, onEditContentChange)}
              rows={4}
              className="resize-none border-border/70 focus-visible:ring-emerald-600/30"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={onCancelEdit}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={onSaveEdit}
                className="gap-1 bg-emerald-700 hover:bg-emerald-800 text-white"
              >
                <Check className="h-3.5 w-3.5" />
                Save
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
            {renderFormattedText(announcement.content)}
          </p>
        )}

       {announcement.images.length > 0 && (
  <div
    className={`grid gap-2 ${
      announcement.images.length === 1
        ? "grid-cols-1"
        : announcement.images.length === 2
        ? "grid-cols-2"
        : "grid-cols-3"
    }`}
  >
    {announcement.images.map((img) => (
      <button
        key={img.id}
        type="button"
        onClick={() => setSelectedImage(img.url)}
        className="overflow-hidden rounded-lg border border-border/60"
      >
        <img
          src={img.url}
          alt=""
          className="w-full h-48 object-cover transition-transform duration-200 hover:scale-105 cursor-pointer"
        />
      </button>
    ))}
  </div>
)}
      </CardContent>

{selectedImage && (
  <div
    className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
    onClick={() => setSelectedImage(null)}
  >
    <button
      className="absolute top-4 right-4 text-white"
      onClick={() => setSelectedImage(null)}
    >
      <X className="h-8 w-8" />
    </button>

    <img
      src={selectedImage}
      alt=""
      className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
)}
</Card>
  );
}