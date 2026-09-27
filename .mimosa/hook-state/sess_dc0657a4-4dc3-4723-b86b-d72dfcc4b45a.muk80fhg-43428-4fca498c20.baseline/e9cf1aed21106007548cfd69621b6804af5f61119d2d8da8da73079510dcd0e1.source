import { useState } from 'react';
import { DEFAULT_EMOJI, EMOJI_PRESETS, NAME_MAX_LENGTH } from '@/domain/habits/model.js';
import { Button } from '@/ui/web/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/web/components/ui/dialog';
import { Input } from '@/ui/web/components/ui/input';
import { Label } from '@/ui/web/components/ui/label';
import { cn } from '@/ui/web/lib/utils';

function EmojiPicker({ value, onChange }) {
  return (
    <div role="radiogroup" aria-label="Emoji" className="grid grid-cols-6 gap-2">
      {EMOJI_PRESETS.map((emoji) => {
        const selected = emoji === value;
        return (
          <button
            key={emoji}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={emoji}
            onClick={() => onChange(emoji)}
            className={cn(
              'flex aspect-square items-center justify-center rounded-md border text-2xl transition-colors outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
              selected ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent',
            )}
          >
            {emoji}
          </button>
        );
      })}
    </div>
  );
}

function HabitForm({ initialName, initialEmoji, submitLabel, onSubmit }) {
  const [name, setName] = useState(initialName);
  const [emoji, setEmoji] = useState(initialEmoji);
  const canSubmit = name.trim() !== '';

  const handleSubmit = (event) => {
    event.preventDefault();
    if (canSubmit) onSubmit({ name, emoji });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="habit-name">Name</Label>
        <Input
          id="habit-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={NAME_MAX_LENGTH}
          placeholder="e.g. Drink water"
          autoComplete="off"
          autoFocus
        />
      </div>
      <div className="grid gap-2">
        <span className="text-sm font-medium">Emoji</span>
        <EmojiPicker value={emoji} onChange={setEmoji} />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={!canSubmit}>
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function HabitDialog({ open, onOpenChange, habit, onSubmit }) {
  const editing = Boolean(habit);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? 'Rename habit' : 'New habit'}</DialogTitle>
          <DialogDescription>Give it a short name and pick an emoji.</DialogDescription>
        </DialogHeader>
        <HabitForm
          key={habit?.id ?? 'new'}
          initialName={habit?.name ?? ''}
          initialEmoji={habit?.emoji ?? DEFAULT_EMOJI}
          submitLabel={editing ? 'Save' : 'Add habit'}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
