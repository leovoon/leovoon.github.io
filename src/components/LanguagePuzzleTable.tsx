import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  rectIntersection,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DropAnimationFunction,
  type DragEndEvent,
  type DragStartEvent,
  type Modifier,
} from '@dnd-kit/core';
import {
  flexRender,
  functionalUpdate,
  getCoreRowModel,
  useReactTable,
  type Cell,
  type ColumnSizingState,
  type Header,
  type Updater,
} from '@tanstack/react-table';
import JSConfetti from 'js-confetti';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
} from 'react';
import {
  buildPuzzleTiles,
  columnKeys,
  getColumns,
  type ColumnKey,
  type Locale,
  type LanguageRow,
  type PuzzleTile,
} from '../data/languagePuzzle.js';
import { copy } from '../lib/i18n.js';

type WarningState = {
  targetId?: string;
  message: string;
};

type Placements = Record<string, string>;
type RowAssignments = Record<string, string>;
type MobileView = 'tiles' | 'table';
type IconProps = {
  className?: string;
};
type TileDragMetrics = {
  width: number;
  height: number;
};
type RejectPlacementOptions = {
  preserveDragOverlay?: boolean;
};

type SlotCellId = {
  slotId: string;
  columnKey: ColumnKey;
};
type ColumnSizingByLocale = Record<Locale, ColumnSizingState>;
type ColumnSizeVars = CSSProperties & Record<`--${string}`, number | string>;

const columnSizingStoragePrefix = 'language-puzzle-column-sizing';

function getColumnSizingStorageKey(locale: Locale): string {
  return `${columnSizingStoragePrefix}-${locale}`;
}

function readColumnSizing(locale: Locale): ColumnSizingState {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const storedValue = window.localStorage.getItem(getColumnSizingStorageKey(locale));

    if (!storedValue) {
      return {};
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    if (!parsedValue || typeof parsedValue !== 'object' || Array.isArray(parsedValue)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsedValue)
        .filter(
          ([columnId, value]) =>
            columnKeys.includes(columnId as ColumnKey) &&
            typeof value === 'number' &&
            Number.isFinite(value),
        )
        .map(([columnId, value]) => [columnId, Math.round(value as number)]),
    );
  } catch {
    return {};
  }
}

function persistColumnSizing(locale: Locale, sizing: ColumnSizingState): void {
  if (typeof window === 'undefined') {
    return;
  }

  const storageKey = getColumnSizingStorageKey(locale);

  if (Object.keys(sizing).length === 0) {
    window.localStorage.removeItem(storageKey);
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(sizing));
}

function makeInitialColumnSizingByLocale(): ColumnSizingByLocale {
  return {
    en: readColumnSizing('en'),
    zh: readColumnSizing('zh'),
  };
}

function clampSize(value: number, minSize?: number, maxSize?: number): number {
  const minimum = minSize ?? 20;
  const maximum = maxSize ?? Number.MAX_SAFE_INTEGER;

  return Math.min(maximum, Math.max(minimum, value));
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

const collisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);

  return pointerCollisions.length > 0 ? pointerCollisions : rectIntersection(args);
};

const tileDropAnimation = {
  duration: 160,
  easing: 'cubic-bezier(.2, .8, .2, 1)',
};

function getTouchClientCoordinates(event: Event | null): { x: number; y: number } | null {
  if (typeof TouchEvent === 'undefined' || !(event instanceof TouchEvent)) {
    return null;
  }

  const touch = event.touches[0] ?? event.changedTouches[0];

  return touch ? { x: touch.clientX, y: touch.clientY } : null;
}

function isTouchActivator(event: Event | null): boolean {
  return typeof TouchEvent !== 'undefined' && event instanceof TouchEvent;
}

function makeSnapTileOverlayToThumb(metrics: TileDragMetrics | null): Modifier {
  return ({ activatorEvent, activeNodeRect, transform }) => {
    const coordinates = getTouchClientCoordinates(activatorEvent);

    if (!coordinates || !metrics) {
      return transform;
    }

    const baseLeft = activeNodeRect && activeNodeRect.width > 0 ? activeNodeRect.left : 0;
    const baseTop = activeNodeRect && activeNodeRect.height > 0 ? activeNodeRect.top : 0;

    return {
      ...transform,
      x: transform.x + coordinates.x - metrics.width / 2 - baseLeft,
      y: transform.y + coordinates.y - metrics.height / 2 - baseTop,
    };
  };
}

function makeSlotRows(count: number): LanguageRow[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `slot-${index}`,
    language: '',
    coreQuestion: '',
    philosophy: '',
    whereItRuns: '',
    mentalModel: '',
  }));
}

function makeSlotCellId(slotId: string, columnKey: ColumnKey): string {
  return `${slotId}.${columnKey}`;
}

function parseSlotCellId(cellId: string): SlotCellId {
  const [slotId, columnKey] = cellId.split('.') as [string, ColumnKey];

  return { slotId, columnKey };
}

function findRowAssignmentForSlot(
  placements: Placements,
  slotId: string,
  tileById: Record<string, PuzzleTile>,
): string | undefined {
  const remainingTileId = Object.entries(placements).find(
    ([cellId]) => parseSlotCellId(cellId).slotId === slotId,
  )?.[1];

  return remainingTileId ? tileById[remainingTileId]?.rowId : undefined;
}

function TileContent({ tile }: { tile: PuzzleTile }): ReactElement {
  return <span className="tile-value">{tile.value}</span>;
}

function ShuffleIcon({ className = 'button-icon' }: IconProps): ReactElement {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h3.2c1.2 0 2.3.6 3 1.6l3.6 6.2c.6 1 1.7 1.7 3 1.7H20" />
      <path d="m17 13.5 3 3-3 3" />
      <path d="M4 17h3.2c1.2 0 2.3-.6 3-1.6l.7-1.2" />
      <path d="M13.1 9.8c.7-1.7 2-2.8 3.7-2.8H20" />
      <path d="m17 4 3 3-3 3" />
    </svg>
  );
}

function ResetIcon({ className = 'button-icon' }: IconProps): ReactElement {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 6v5h-5" />
      <path d="M19.2 11A7.2 7.2 0 1 0 17 16.4" />
      <path d="M12 8v4l2.5 1.5" />
    </svg>
  );
}

function ColumnWidthIcon({ className = 'button-icon' }: IconProps): ReactElement {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="6" width="16" height="12" rx="1.6" />
      <path d="M9 6v12" />
      <path d="M15 6v12" />
      <path d="m7 12 2-2 2 2" />
      <path d="m17 12-2-2-2 2" />
    </svg>
  );
}

function TableIcon({ className = 'button-icon' }: IconProps): ReactElement {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="1.8" />
      <path d="M4 10h16" />
      <path d="M9.5 5v14" />
      <path d="M14.5 5v14" />
    </svg>
  );
}

function ArrowLeftIcon({ className = 'button-icon' }: IconProps): ReactElement {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 19-7-7 7-7" />
      <path d="M5 12h14" />
    </svg>
  );
}

function XIcon({ className = 'button-icon' }: IconProps): ReactElement {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

function DraggableTile({
  tile,
  isSelected,
  onSelect,
  onPrepareTouchDrag,
}: {
  tile: PuzzleTile;
  isSelected: boolean;
  onSelect: (tileId: string) => void;
  onPrepareTouchDrag: (metrics: TileDragMetrics) => void;
}): ReactElement {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: tile.id,
  });
  const { onTouchStart, ...dragListeners } = listeners ?? {};
  const style: CSSProperties | undefined = transform
    ? {
        transform: `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0)`,
      }
    : undefined;

  return (
    <button
      ref={setNodeRef}
      type="button"
      className="answer-tile"
      data-selected={isSelected}
      data-dragging={isDragging}
      data-tile-id={tile.id}
      style={style}
      {...dragListeners}
      {...attributes}
      aria-pressed={isSelected}
      onTouchStart={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();

        onPrepareTouchDrag({
          width: rect.width,
          height: rect.height,
        });
        onTouchStart?.(event);
      }}
      onClick={() => onSelect(tile.id)}
    >
      <TileContent tile={tile} />
    </button>
  );
}

function PuzzleCell({
  cell,
  rowNumber,
  slotId,
  columnKey,
  placedTile,
  isRemoveMenuOpen,
  isRejectedTarget,
  onAttemptPlacement,
  onRevealRemove,
  onRemovePlacement,
  text,
}: {
  cell: Cell<LanguageRow, unknown>;
  rowNumber: number;
  slotId: string;
  columnKey: ColumnKey;
  placedTile?: PuzzleTile;
  isRemoveMenuOpen: boolean;
  isRejectedTarget: boolean;
  onAttemptPlacement: (cellId: string) => void;
  onRevealRemove: (cellId: string) => void;
  onRemovePlacement: (cellId: string) => void;
  text: (typeof copy)['en']['puzzle'];
}): ReactElement {
  const cellId = makeSlotCellId(slotId, columnKey);
  const isFilled = Boolean(placedTile);
  const { setNodeRef, isOver } = useDroppable({
    id: cellId,
    disabled: isFilled,
  });

  return (
    <td
      className="puzzle-cell"
      data-filled={isFilled}
      data-over={isOver}
      data-rejected={isRejectedTarget}
      style={{ width: `calc(var(--col-${cell.column.id}-size) * 1px)` }}
    >
      <button
        ref={setNodeRef}
        type="button"
        className="cell-slot"
        data-cell-id={cellId}
        data-slot-id={slotId}
        data-column-key={columnKey}
        onClick={() => {
          if (isFilled) {
            onRevealRemove(cellId);
            return;
          }

          onAttemptPlacement(cellId);
        }}
        aria-label={
          isFilled
            ? `${text.row} ${rowNumber}, ${cell.column.columnDef.header}, ${text.showRemoveOption}`
            : `${text.row} ${rowNumber}, ${cell.column.columnDef.header}`
        }
      >
        {placedTile ? (
          <span className="filled-value">{placedTile.value}</span>
        ) : (
          <span className="blank-lines" aria-hidden="true">
            <span />
            <span />
          </span>
        )}
      </button>
      {isFilled && isRemoveMenuOpen ? (
        <button
          type="button"
          className="remove-tile-button"
          onClick={() => onRemovePlacement(cellId)}
          aria-label={`${text.removeFrom} ${text.row} ${rowNumber}, ${cell.column.columnDef.header}`}
        >
          {text.remove}
        </button>
      ) : null}
    </td>
  );
}

export default function LanguagePuzzleTable({ locale }: { locale: Locale }): ReactElement {
  const text = copy[locale].puzzle;
  const tiles = useMemo(() => buildPuzzleTiles(locale), [locale]);
  const slotRows = useMemo(() => makeSlotRows(tiles.length / columnKeys.length), [tiles.length]);
  const columns = useMemo(() => getColumns(locale), [locale]);
  const tileById = useMemo(
    () => Object.fromEntries(tiles.map((tile) => [tile.id, tile])),
    [tiles],
  );
  const confettiRef = useRef<JSConfetti | null>(null);
  const hasCelebratedRef = useRef(false);
  const [tileOrder, setTileOrder] = useState(() => shuffle(tiles.map((tile) => tile.id)));
  const [placements, setPlacements] = useState<Placements>({});
  const [rowAssignments, setRowAssignments] = useState<RowAssignments>({});
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [activeTileId, setActiveTileId] = useState<string | null>(null);
  const [activeDragIsTouch, setActiveDragIsTouch] = useState(false);
  const [shouldSettleRejectedDrop, setShouldSettleRejectedDrop] = useState(false);
  const [touchDragMetrics, setTouchDragMetrics] = useState<TileDragMetrics | null>(null);
  const [removeCellId, setRemoveCellId] = useState<string | null>(null);
  const [warning, setWarning] = useState<WarningState | null>(null);
  const [mobileView, setMobileView] = useState<MobileView>('tiles');
  const [columnSizingByLocale, setColumnSizingByLocale] = useState<ColumnSizingByLocale>(
    makeInitialColumnSizingByLocale,
  );
  const columnSizing = columnSizingByLocale[locale];

  const table = useReactTable({
    data: slotRows,
    columns,
    state: {
      columnSizing,
    },
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    onColumnSizingChange: handleColumnSizingChange,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  const columnSizeVars = useMemo<ColumnSizeVars>(() => {
    const sizes: ColumnSizeVars = {};

    for (const header of table.getFlatHeaders()) {
      sizes[`--header-${header.id}-size`] = header.getSize();
      sizes[`--col-${header.column.id}-size`] = header.column.getSize();
    }

    return sizes;
  }, [table, columnSizing]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 220,
        tolerance: 12,
      },
    }),
    useSensor(KeyboardSensor),
  );

  const placedTileIds = useMemo(() => new Set(Object.values(placements)), [placements]);
  const availableTileIds = tileOrder.filter((tileId) => !placedTileIds.has(tileId));
  const activeTile = activeTileId ? tileById[activeTileId] : null;
  const selectedTile = selectedTileId ? tileById[selectedTileId] : null;
  const placedCount = Object.keys(placements).length;
  const isComplete = placedCount === tiles.length;
  const isPlacementMode = Boolean(selectedTile);
  const visibleMobileView: MobileView = isPlacementMode ? 'table' : mobileView;
  const touchOverlayModifiers = useMemo(
    () => (activeDragIsTouch ? [makeSnapTileOverlayToThumb(touchDragMetrics)] : undefined),
    [activeDragIsTouch, touchDragMetrics],
  );
  const touchOverlayStyle: CSSProperties | undefined =
    activeDragIsTouch && touchDragMetrics
      ? {
          width: touchDragMetrics.width,
          height: touchDragMetrics.height,
        }
      : undefined;
  const settleRejectedDropAnimation = useMemo<DropAnimationFunction>(
    () =>
      ({ dragOverlay }) =>
        new Promise<void>((resolve) => {
          const node = dragOverlay.node;
          const startTransform =
            node.style.transform || window.getComputedStyle(node).transform || 'none';
          const animation = node.animate(
            [
              { opacity: 1, transform: startTransform },
              {
                opacity: 0,
                transform: `${startTransform} translateY(-6px) scale(0.98)`,
              },
            ],
            {
              duration: 130,
              easing: 'cubic-bezier(.4, 0, 1, 1)',
              fill: 'forwards',
            },
          );

          animation.onfinish = () => {
            setShouldSettleRejectedDrop(false);
            setActiveDragIsTouch(false);
            resolve();
          };
          animation.oncancel = () => {
            setShouldSettleRejectedDrop(false);
            setActiveDragIsTouch(false);
            resolve();
          };
        }),
    [],
  );
  const overlayDropAnimation = shouldSettleRejectedDrop
    ? settleRejectedDropAnimation
    : tileDropAnimation;

  function handleColumnSizingChange(updater: Updater<ColumnSizingState>): void {
    setColumnSizingByLocale((current) => {
      const nextSizing = functionalUpdate(updater, current[locale]);

      persistColumnSizing(locale, nextSizing);

      return {
        ...current,
        [locale]: nextSizing,
      };
    });
  }

  function resetColumnWidths(): void {
    setColumnSizingByLocale((current) => ({
      ...current,
      [locale]: {},
    }));
    persistColumnSizing(locale, {});
    table.resetHeaderSizeInfo();
  }

  function resizeColumnFromKeyboard(
    header: Header<LanguageRow, unknown>,
    event: ReactKeyboardEvent<HTMLSpanElement>,
  ): void {
    if (!['ArrowLeft', 'ArrowRight', 'Enter', 'Home'].includes(event.key)) {
      return;
    }

    event.preventDefault();

    if (event.key === 'Enter' || event.key === 'Home') {
      header.column.resetSize();
      return;
    }

    const direction = event.key === 'ArrowLeft' ? -1 : 1;
    const step = event.shiftKey ? 40 : 16;
    const nextSize = clampSize(
      Math.round(header.column.getSize() + direction * step),
      header.column.columnDef.minSize,
      header.column.columnDef.maxSize,
    );

    table.setColumnSizing((current) => ({
      ...current,
      [header.column.id]: nextSize,
    }));
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') {
        return;
      }

      setSelectedTileId(null);
      setActiveTileId(null);
      setActiveDragIsTouch(false);
      setShouldSettleRejectedDrop(false);
      setRemoveCellId(null);
      setWarning(null);
      setMobileView('tiles');
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isComplete) {
      hasCelebratedRef.current = false;
      return;
    }

    if (hasCelebratedRef.current) {
      return;
    }

    hasCelebratedRef.current = true;
    confettiRef.current ??= new JSConfetti();

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    void confettiRef.current.addConfetti({
      emojis: ['🎉'],
      emojiSize: reduceMotion ? 28 : 36,
      confettiNumber: reduceMotion ? 18 : 60,
    });

    if (!reduceMotion) {
      window.setTimeout(() => {
        void confettiRef.current?.addConfetti({
          confettiColors: ['#2f8b5b', '#17623d', '#d7c669', '#b84a33', '#f4f6f1'],
          confettiNumber: 110,
        });
      }, 260);
    }
  }, [isComplete]);

  function closePlacementMode(): void {
    setSelectedTileId(null);
    setActiveTileId(null);
    setActiveDragIsTouch(false);
    setShouldSettleRejectedDrop(false);
    setRemoveCellId(null);
    setMobileView('tiles');
  }

  function rejectPlacement(
    message: string,
    targetId?: string,
    options: RejectPlacementOptions = {},
  ): void {
    setWarning({ targetId, message });
    setActiveTileId(null);
    if (!options.preserveDragOverlay) {
      setActiveDragIsTouch(false);
      setShouldSettleRejectedDrop(false);
    }
    setRemoveCellId(null);
    setMobileView('table');
  }

  function getPlacementRejection(tileId: string, targetCellId: string): WarningState | null {
    const tile = tileById[tileId];
    const { slotId, columnKey } = parseSlotCellId(targetCellId);

    if (!tile || !columnKeys.includes(columnKey)) {
      return { message: text.chooseSlot };
    }

    if (placements[targetCellId]) {
      return { targetId: targetCellId, message: text.slotFilled };
    }

    if (tile.columnKey !== columnKey) {
      return { targetId: targetCellId, message: text.wrongSlot };
    }

    const assignedLanguageId = rowAssignments[slotId];
    if (assignedLanguageId && tile.rowId !== assignedLanguageId) {
      return { targetId: targetCellId, message: text.wrongSlot };
    }

    return null;
  }

  function acceptPlacement(tileId: string, targetCellId: string, slotId: string): void {
    setPlacements((current) => ({
      ...current,
      [targetCellId]: tileId,
    }));

    const tile = tileById[tileId];
    if (tile) {
      setRowAssignments((current) =>
        current[slotId]
          ? current
          : {
              ...current,
              [slotId]: tile.rowId,
            },
      );
    }

    setWarning(null);
    setSelectedTileId(null);
    setActiveTileId(null);
    setActiveDragIsTouch(false);
    setShouldSettleRejectedDrop(false);
    setRemoveCellId(null);
    setMobileView('table');
  }

  function placeTile(tileId: string, targetCellId: string): void {
    const rejection = getPlacementRejection(tileId, targetCellId);
    const { slotId } = parseSlotCellId(targetCellId);

    if (rejection) {
      rejectPlacement(rejection.message, rejection.targetId);
      return;
    }

    acceptPlacement(tileId, targetCellId, slotId);
  }

  function selectTile(tileId: string): void {
    const nextSelectedTileId = selectedTileId === tileId ? null : tileId;

    setSelectedTileId(nextSelectedTileId);
    setMobileView(nextSelectedTileId ? 'table' : 'tiles');
    setRemoveCellId(null);
    setWarning(null);
  }

  function handleDragStart(event: DragStartEvent): void {
    const tileId = String(event.active.id);
    setActiveTileId(tileId);
    setActiveDragIsTouch(isTouchActivator(event.activatorEvent));
    setSelectedTileId(tileId);
    setMobileView('table');
    setRemoveCellId(null);
    setWarning(null);
  }

  function handleDragEnd(event: DragEndEvent): void {
    const tileId = String(event.active.id);
    const targetCellId = event.over?.id ? String(event.over.id) : null;
    const rejection = targetCellId
      ? getPlacementRejection(tileId, targetCellId)
      : { message: text.chooseSlot };
    const shouldSettleDrop = activeDragIsTouch && Boolean(rejection);

    setShouldSettleRejectedDrop(shouldSettleDrop);
    setActiveTileId(null);
    if (!shouldSettleDrop) {
      setActiveDragIsTouch(false);
    }

    if (rejection) {
      rejectPlacement(rejection.message, rejection.targetId, {
        preserveDragOverlay: shouldSettleDrop,
      });
      return;
    }

    placeTile(tileId, targetCellId);
  }

  function handleDragCancel(): void {
    closePlacementMode();
    setWarning(null);
  }

  function handleCellClick(targetCellId: string): void {
    setRemoveCellId(null);

    if (!selectedTileId) {
      setWarning({
        targetId: targetCellId,
        message: text.pickFirst,
      });
      return;
    }

    placeTile(selectedTileId, targetCellId);
  }

  function handleFilledCellClick(cellId: string): void {
    setRemoveCellId((current) => (current === cellId ? null : cellId));
    setSelectedTileId(null);
    setActiveTileId(null);
    setActiveDragIsTouch(false);
    setShouldSettleRejectedDrop(false);
    setWarning(null);
    setMobileView('table');
  }

  function removePlacement(cellId: string): void {
    const { slotId } = parseSlotCellId(cellId);
    const { [cellId]: removedTileId, ...nextPlacements } = placements;

    if (!removedTileId) {
      return;
    }

    const nextAssignment = findRowAssignmentForSlot(nextPlacements, slotId, tileById);

    setPlacements(nextPlacements);
    setRowAssignments((current) => {
      if (nextAssignment) {
        return {
          ...current,
          [slotId]: nextAssignment,
        };
      }

      const { [slotId]: _removedAssignment, ...remainingAssignments } = current;
      return remainingAssignments;
    });
    setRemoveCellId(null);
    setWarning(null);
    setMobileView('table');
  }

  function resetPuzzle(): void {
    setTileOrder(shuffle(tiles.map((tile) => tile.id)));
    setPlacements({});
    setRowAssignments({});
    closePlacementMode();
    setWarning(null);
  }

  function shuffleRemaining(): void {
    setTileOrder((current) => {
      const remaining = current.filter((tileId) => !placedTileIds.has(tileId));
      const placed = current.filter((tileId) => placedTileIds.has(tileId));
      return [...shuffle(remaining), ...placed];
    });
    setRemoveCellId(null);
    setWarning(null);
  }

  function toggleMobileView(): void {
    setMobileView((current) => (current === 'tiles' ? 'table' : 'tiles'));
    setRemoveCellId(null);
    setWarning(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      accessibility={{
        announcements: {
          onDragStart: () => text.dragStart,
          onDragOver: () => undefined,
          onDragEnd: () => text.dragEnd,
          onDragCancel: () => text.dragCancel,
        },
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <section className="puzzle-board" aria-label={text.label}>
        <div className="board-toolbar">
          <div>
            <p className="board-kicker">{text.progress}</p>
            <p className="progress-copy">
              <strong>{placedCount}</strong>
              <span>/</span>
              <span>{tiles.length}</span>
            </p>
          </div>
          <div className="toolbar-actions">
            <button
              type="button"
              className="icon-button quiet-button"
              onClick={shuffleRemaining}
              aria-label={text.shuffle}
              title={text.shuffleTitle}
            >
              <ShuffleIcon />
            </button>
            <button
              type="button"
              className="icon-button solid-button"
              onClick={resetPuzzle}
              aria-label={text.reset}
              title={text.resetTitle}
            >
              <ResetIcon />
            </button>
            <button
              type="button"
              className="icon-button quiet-button"
              onClick={resetColumnWidths}
              aria-label={text.resetColumnWidths}
              title={text.resetColumnWidthsTitle}
            >
              <ColumnWidthIcon />
            </button>
          </div>
        </div>

        <div
          className="play-surface"
          data-placement-mode={isPlacementMode ? 'placing' : 'picking'}
          data-mobile-view={visibleMobileView}
        >
          <div className="selected-strip" hidden={!selectedTile}>
            <span>{text.selected}</span>
            <strong>{selectedTile?.value}</strong>
            <button
              type="button"
              className="icon-button"
              onClick={handleDragCancel}
              aria-label={text.cancelSelected}
              title={text.cancelTitle}
            >
              <XIcon />
            </button>
          </div>

          <div className="table-zone" aria-label={text.skeletonTable}>
            <div className="mobile-table-bar" hidden={isPlacementMode}>
              <span>{text.table}</span>
              <button
                type="button"
                className="icon-button back-button"
                onClick={toggleMobileView}
                aria-label={text.showTilePicker}
                title={text.goBackTitle}
              >
                <ArrowLeftIcon />
              </button>
            </div>
            <div className="table-scroll">
              <table
                className="runtime-table"
                style={{
                  ...columnSizeVars,
                  width: table.getTotalSize(),
                }}
              >
                <colgroup>
                  {table.getVisibleLeafColumns().map((column) => (
                    <col
                      key={column.id}
                      style={{ width: `calc(var(--col-${column.id}-size) * 1px)` }}
                    />
                  ))}
                </colgroup>
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          scope="col"
                          style={{ width: `calc(var(--header-${header.id}-size) * 1px)` }}
                        >
                          <span className="column-header-label">
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </span>
                          {header.column.getCanResize() ? (
                            <span
                              role="separator"
                              tabIndex={0}
                              aria-label={`${text.resizeColumn}: ${String(
                                header.column.columnDef.header,
                              )}`}
                              aria-orientation="vertical"
                              aria-valuemin={header.column.columnDef.minSize}
                              aria-valuemax={header.column.columnDef.maxSize}
                              aria-valuenow={Math.round(header.column.getSize())}
                              className="column-resize-handle"
                              data-resizing={header.column.getIsResizing()}
                              title={text.resizeColumn}
                              onDoubleClick={() => header.column.resetSize()}
                              onMouseDown={header.getResizeHandler()}
                              onTouchStart={header.getResizeHandler()}
                              onKeyDown={(event) => resizeColumnFromKeyboard(header, event)}
                            />
                          ) : null}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row, rowIndex) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => {
                        const columnKey = cell.column.id as ColumnKey;
                        const cellId = makeSlotCellId(row.id, columnKey);
                        const placedTile = placements[cellId]
                          ? tileById[placements[cellId]]
                          : undefined;

                        return (
                          <PuzzleCell
                            key={cell.id}
                            cell={cell}
                            rowNumber={rowIndex + 1}
                            slotId={row.id}
                            columnKey={columnKey}
                            placedTile={placedTile}
                            isRemoveMenuOpen={removeCellId === cellId}
                            isRejectedTarget={warning?.targetId === cellId}
                            onAttemptPlacement={handleCellClick}
                            onRevealRemove={handleFilledCellClick}
                            onRemovePlacement={removePlacement}
                            text={text}
                          />
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="status-line" aria-live="polite">
              {isComplete ? (
                <span className="complete-message">{text.complete}</span>
              ) : warning ? (
                <span className="warning-message">{warning.message}</span>
              ) : (
                <span>
                  {availableTileIds.length} {text.tilesLeft}
                </span>
              )}
            </div>
          </div>

          <aside className="tile-tray" aria-label={text.pickTile}>
            <div className="tray-header">
              <h2>{text.pickTile}</h2>
              <div className="tray-actions">
                <button
                  type="button"
                  className="icon-button mobile-view-toggle"
                  onClick={toggleMobileView}
                  aria-label={text.showTable}
                  title={text.table}
                >
                  <TableIcon />
                </button>
              </div>
            </div>
            <div className="tile-grid">
              {availableTileIds.map((tileId) => {
                const tile = tileById[tileId];

                return (
                  <DraggableTile
                    key={tile.id}
                    tile={tile}
                    isSelected={selectedTileId === tile.id}
                    onSelect={selectTile}
                    onPrepareTouchDrag={setTouchDragMetrics}
                  />
                );
              })}
            </div>
          </aside>
        </div>
      </section>

      <DragOverlay
        dropAnimation={overlayDropAnimation}
        modifiers={touchOverlayModifiers}
        style={touchOverlayStyle}
      >
        {activeTile ? (
          <div className="answer-tile overlay-tile">
            <TileContent tile={activeTile} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
