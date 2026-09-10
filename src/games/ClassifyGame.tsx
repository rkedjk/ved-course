import { useMemo, useState } from "react";
import {
    DndContext,
    PointerSensor,
    useDraggable,
    useDroppable,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useStore } from "../store";
import { fireConfetti } from "../lib/confetti";
import { buzz, tick } from "../lib/haptics";

export interface ClassifyCategory {
    id: string;
    label: string;
    emoji: string;
}
export interface ClassifyItem {
    id: string;
    label: string;
    emoji: string;
    category: string;
    explain: string;
}

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export function ClassifyGame({
    categories,
    items,
    onDone,
}: {
    categories: ClassifyCategory[];
    items: ClassifyItem[];
    onDone?: () => void;
}) {
    const [placed, setPlaced] = useState<Record<string, string>>({});
    const [wrong, setWrong] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);
    const addXp = useStore((s) => s.addXp);
    const unlock = useStore((s) => s.unlock);
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    );

    const deck = useMemo(() => shuffle(items), [items]);
    const remaining = deck.filter((i) => !placed[i.id]);
    const allPlaced = remaining.length === 0;

    const place = (itemId: string, catId: string) => {
        if (placed[itemId]) return;
        const item = items.find((i) => i.id === itemId);
        if (!item) return;
        if (item.category === catId) {
            setPlaced((p) => ({ ...p, [itemId]: catId }));
            setSelected(null);
            addXp(5);
            tick();
            const nextPlaced = { ...placed, [itemId]: catId };
            const doneNow = items.every((i) => nextPlaced[i.id]);
            if (doneNow) {
                if (errors === 0) unlock("classifier");
                fireConfetti();
                onDone?.();
            }
        } else {
            setWrong((w) => ({ ...w, [itemId]: true }));
            setErrors((e) => e + 1);
            buzz();
            setTimeout(() => setWrong((w) => ({ ...w, [itemId]: false })), 650);
        }
    };

    const onDragEnd = (e: DragEndEvent) => {
        if (e.over) place(String(e.active.id), String(e.over.id));
    };

    return (
        <div className="rounded-tds-card border border-tds-border bg-tds-card p-4 shadow-tds-card">
            <DndContext sensors={sensors} onDragEnd={onDragEnd}>
                <div className="mb-3 flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <DropZone
                            key={cat.id}
                            id={cat.id}
                            emoji={cat.emoji}
                            label={cat.label}
                            onAssign={(catId) =>
                                selected && place(selected, catId)
                            }
                            placed={items.filter(
                                (i) => placed[i.id] === cat.id,
                            )}
                        />
                    ))}
                </div>
                <div className="flex flex-wrap gap-2">
                    {remaining.map((item) => (
                        <Card
                            key={item.id}
                            item={item}
                            selected={selected === item.id}
                            wrong={!!wrong[item.id]}
                            onPick={() =>
                                setSelected(
                                    selected === item.id ? null : item.id,
                                )
                            }
                        />
                    ))}
                </div>
            </DndContext>
            {allPlaced ? (
                <div className="mt-3 text-center text-sm font-bold text-tds-green">
                    ✅ Всё разложено
                    {errors === 0 ? " без ошибок!" : ` (ошибок: ${errors})`}
                </div>
            ) : (
                <div className="mt-3 text-center text-xs text-tds-muted">
                    Перетащи карточку в категорию или выбери карточку и кликни
                    категорию
                </div>
            )}
            {selected && (
                <div className="mt-2 rounded-tds-btn bg-tds-yellow-soft p-2 text-center text-xs font-semibold text-tds-text">
                    Выбрано: {items.find((i) => i.id === selected)?.label} —
                    теперь кликни категорию
                </div>
            )}
        </div>
    );
}

function DropZone({
    id,
    emoji,
    label,
    placed,
    onAssign,
}: {
    id: string;
    emoji: string;
    label: string;
    placed: ClassifyItem[];
    onAssign: (catId: string) => void;
}) {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
        <div
            ref={setNodeRef}
            onClick={() => onAssign(id)}
            className={`min-w-36 flex-1 rounded-tds-btn border-2 p-2.5 transition ${
                isOver
                    ? "border-tds-yellow bg-tds-yellow-soft"
                    : "border-tds-border bg-tds-bg"
            }`}
        >
            <div className="text-sm font-bold text-tds-text">
                {emoji} {label}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1">
                {placed.map((p) => (
                    <span
                        key={p.id}
                        className="rounded-md bg-tds-card px-1.5 py-0.5 text-xs font-medium text-tds-text shadow-tds-card"
                        title={p.explain}
                    >
                        {p.emoji} {p.label}
                    </span>
                ))}
            </div>
        </div>
    );
}

function Card({
    item,
    selected,
    wrong,
    onPick,
}: {
    item: ClassifyItem;
    selected: boolean;
    wrong: boolean;
    onPick: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({
            id: item.id,
        });
    return (
        <button
            type="button"
            ref={setNodeRef}
            style={{ transform: CSS.Translate.toString(transform) }}
            onClick={onPick}
            {...attributes}
            {...listeners}
            className={`flex items-center gap-2 rounded-tds-btn border-2 px-3 py-2 text-sm font-semibold transition ${
                isDragging
                    ? "z-10 border-tds-yellow bg-tds-yellow-soft opacity-80"
                    : wrong
                      ? "border-tds-red bg-tds-red-soft"
                      : selected
                        ? "border-tds-yellow bg-tds-yellow-soft"
                        : "border-tds-border bg-tds-bg text-tds-text hover:border-tds-yellow"
            }`}
        >
            <span className="text-lg">{item.emoji}</span> {item.label}
        </button>
    );
}
