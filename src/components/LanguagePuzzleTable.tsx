import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
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
  type Table,
  type Updater,
} from '@tanstack/react-table';
import JSConfetti from 'js-confetti';
import { motion, useReducedMotion, type Transition } from 'motion/react';
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
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
import ProgressStarFlight, {
  type ProgressStarFlightEvent,
  type ProgressStarFlightRect,
} from './ProgressStarFlight.js';

type WarningState = {
  targetId?: string;
  message: string;
};

type Placements = Record<string, string>;
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
type PuzzleState = {
  tileOrder: string[];
  placements: Placements;
  selectedTileId: string | null;
  activeTileId: string | null;
  activeDragIsTouch: boolean;
  shouldSettleRejectedDrop: boolean;
  touchDragMetrics: TileDragMetrics | null;
  removeCellId: string | null;
  warning: WarningState | null;
  mobileView: MobileView;
};
type PuzzleAction =
  | { type: 'finishRejectedDropAnimation' }
  | { type: 'dismissAndShowTiles'; clearWarning?: boolean }
  | { type: 'rejectPlacement'; warning: WarningState; preserveDragOverlay?: boolean }
  | { type: 'acceptPlacement'; tileId: string; targetCellId: string }
  | { type: 'selectTile'; tileId: string }
  | { type: 'startDrag'; tileId: string; isTouch: boolean }
  | { type: 'endDragWithRejection'; warning: WarningState; shouldSettleDrop: boolean }
  | { type: 'clearDrag' }
  | { type: 'pickFirst'; warning: WarningState }
  | { type: 'revealRemove'; cellId: string }
  | { type: 'removePlacement'; nextPlacements: Placements }
  | { type: 'resetPuzzle'; tileOrder: string[] }
  | { type: 'shuffleRemaining' }
  | { type: 'toggleMobileView' }
  | { type: 'setTouchDragMetrics'; metrics: TileDragMetrics };

type SlotCellId = {
  slotId: string;
  columnKey: ColumnKey;
};
type ColumnSizingByLocale = Record<Locale, ColumnSizingState>;
type ColumnSizeVars = CSSProperties & Record<`--${string}`, number | string>;
type ProgressAnimationSnapshot = {
  activeFlight: ProgressStarFlightEvent | null;
  queuedFlightCount: number;
  visiblePlacedCount: number;
  realPlacedCount: number;
};

const columnSizingStoragePrefix = 'language-puzzle-column-sizing';
const columnKeySet: ReadonlySet<string> = new Set(columnKeys);

function isColumnKey(value: string): value is ColumnKey {
  return columnKeySet.has(value);
}

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

    const sizing: ColumnSizingState = {};

    for (const [columnId, value] of Object.entries(parsedValue)) {
      if (
        isColumnKey(columnId) &&
        typeof value === 'number' &&
        Number.isFinite(value)
      ) {
        sizing[columnId] = Math.round(value);
      }
    }

    return sizing;
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

function makeInitialPuzzleState(tiles: PuzzleTile[]): PuzzleState {
  return {
    tileOrder: shuffle(tiles.map((tile) => tile.id)),
    placements: {},
    selectedTileId: null,
    activeTileId: null,
    activeDragIsTouch: false,
    shouldSettleRejectedDrop: false,
    touchDragMetrics: null,
    removeCellId: null,
    warning: null,
    mobileView: 'tiles',
  };
}

function closePlacementState(state: PuzzleState, clearWarning = false): PuzzleState {
  return {
    ...state,
    selectedTileId: null,
    activeTileId: null,
    activeDragIsTouch: false,
    shouldSettleRejectedDrop: false,
    removeCellId: null,
    warning: clearWarning ? null : state.warning,
    mobileView: 'tiles',
  };
}

function puzzleReducer(state: PuzzleState, action: PuzzleAction): PuzzleState {
  switch (action.type) {
    case 'finishRejectedDropAnimation':
      return {
        ...state,
        activeDragIsTouch: false,
        shouldSettleRejectedDrop: false,
      };

    case 'dismissAndShowTiles':
      return closePlacementState(state, action.clearWarning);

    case 'rejectPlacement':
      return {
        ...state,
        warning: action.warning,
        activeTileId: null,
        activeDragIsTouch: action.preserveDragOverlay ? state.activeDragIsTouch : false,
        shouldSettleRejectedDrop: action.preserveDragOverlay
          ? state.shouldSettleRejectedDrop
          : false,
        removeCellId: null,
        mobileView: 'table',
      };

    case 'acceptPlacement':
      return {
        ...state,
        placements: {
          ...state.placements,
          [action.targetCellId]: action.tileId,
        },
        warning: null,
        selectedTileId: null,
        activeTileId: null,
        activeDragIsTouch: false,
        shouldSettleRejectedDrop: false,
        removeCellId: null,
        mobileView: 'table',
      };

    case 'selectTile': {
      const nextSelectedTileId = state.selectedTileId === action.tileId ? null : action.tileId;

      return {
        ...state,
        selectedTileId: nextSelectedTileId,
        mobileView: nextSelectedTileId ? 'table' : 'tiles',
        removeCellId: null,
        warning: null,
      };
    }

    case 'startDrag':
      return {
        ...state,
        activeTileId: action.tileId,
        activeDragIsTouch: action.isTouch,
        shouldSettleRejectedDrop: false,
        selectedTileId: action.tileId,
        mobileView: 'table',
        removeCellId: null,
        warning: null,
      };

    case 'endDragWithRejection':
      return {
        ...state,
        shouldSettleRejectedDrop: action.shouldSettleDrop,
        activeTileId: null,
        activeDragIsTouch: action.shouldSettleDrop ? state.activeDragIsTouch : false,
        warning: action.warning,
        removeCellId: null,
        mobileView: 'table',
      };

    case 'clearDrag':
      return closePlacementState(
        {
          ...state,
          warning: null,
        },
        true,
      );

    case 'pickFirst':
      return {
        ...state,
        removeCellId: null,
        warning: action.warning,
      };

    case 'revealRemove':
      return {
        ...state,
        removeCellId: state.removeCellId === action.cellId ? null : action.cellId,
        selectedTileId: null,
        activeTileId: null,
        activeDragIsTouch: false,
        shouldSettleRejectedDrop: false,
        warning: null,
        mobileView: 'table',
      };

    case 'removePlacement':
      return {
        ...state,
        placements: action.nextPlacements,
        removeCellId: null,
        warning: null,
        mobileView: 'table',
      };

    case 'resetPuzzle':
      return {
        ...closePlacementState(state, true),
        tileOrder: action.tileOrder,
        placements: {},
      };

    case 'shuffleRemaining': {
      const placedTileIds = new Set(Object.values(state.placements));
      const remaining: string[] = [];
      const placed: string[] = [];

      for (const tileId of state.tileOrder) {
        if (placedTileIds.has(tileId)) {
          placed.push(tileId);
        } else {
          remaining.push(tileId);
        }
      }

      return {
        ...state,
        tileOrder: [...shuffle(remaining), ...placed],
        removeCellId: null,
        warning: null,
      };
    }

    case 'toggleMobileView':
      return {
        ...state,
        mobileView: state.mobileView === 'tiles' ? 'table' : 'tiles',
        removeCellId: null,
        warning: null,
      };

    case 'setTouchDragMetrics':
      return {
        ...state,
        touchDragMetrics: action.metrics,
      };
  }
}

function getTopmostCellCollision({
  pointerCoordinates,
  droppableContainers,
}: Parameters<CollisionDetection>[0]) {
  if (!pointerCoordinates || typeof document === 'undefined') {
    return null;
  }

  const enabledDroppableContainerById = new Map<string, (typeof droppableContainers)[number]>();

  for (const container of droppableContainers) {
    if (!container.disabled) {
      enabledDroppableContainerById.set(String(container.id), container);
    }
  }

  for (const element of document.elementsFromPoint(pointerCoordinates.x, pointerCoordinates.y)) {
    const cellSlot =
      element instanceof HTMLElement ? element.closest<HTMLElement>('[data-cell-id]') : null;
    const cellId = cellSlot?.dataset.cellId;

    if (!cellId) {
      continue;
    }

    const droppableContainer = enabledDroppableContainerById.get(cellId);

    if (!droppableContainer) {
      continue;
    }

    return {
      id: droppableContainer.id,
      data: {
        droppableContainer,
        value: 0,
      },
    };
  }

  return null;
}

const collisionDetection: CollisionDetection = (args) => {
  const topmostCellCollision = getTopmostCellCollision(args);

  if (topmostCellCollision) {
    return [topmostCellCollision];
  }

  const pointerCollisions = pointerWithin(args);

  return pointerCollisions.length > 0 ? pointerCollisions : rectIntersection(args);
};

const tileDropAnimation = {
  duration: 160,
  easing: 'cubic-bezier(.2, .8, .2, 1)',
};
const tileLayoutTransition: Transition = {
  type: 'spring',
  duration: 0.28,
  bounce: 0,
};

const stickyAwareMeasuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
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

function snapshotRect(rect: DOMRect): ProgressStarFlightRect {
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
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
  isSuccessPulse,
  onRegisterCellSlot,
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
  isSuccessPulse: boolean;
  onRegisterCellSlot: (cellId: string, node: HTMLButtonElement | null) => void;
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
  const setSlotRef = useCallback(
    (node: HTMLButtonElement | null) => {
      setNodeRef(node);
      onRegisterCellSlot(cellId, node);
    },
    [cellId, onRegisterCellSlot, setNodeRef],
  );

  return (
    <td
      className="puzzle-cell"
      data-filled={isFilled}
      data-over={isOver}
      data-rejected={isRejectedTarget}
      data-success-pulse={isSuccessPulse}
      style={{ width: `calc(var(--col-${cell.column.id}-size) * 1px)` }}
    >
      <button
        ref={setSlotRef}
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

function BoardToolbar({
  text,
  placedCount,
  totalTiles,
  progressPulseKey,
  onRegisterProgressNumber,
  onShuffle,
  onReset,
  onResetColumnWidths,
}: {
  text: (typeof copy)['en']['puzzle'];
  placedCount: number;
  totalTiles: number;
  progressPulseKey: number;
  onRegisterProgressNumber: (node: HTMLElement | null) => void;
  onShuffle: () => void;
  onReset: () => void;
  onResetColumnWidths: () => void;
}): ReactElement {
  return (
    <div className="board-toolbar">
      <div>
        <p className="board-kicker">{text.progress}</p>
        <p className="progress-copy">
          <strong
            key={progressPulseKey}
            ref={onRegisterProgressNumber}
            className="progress-number"
            data-pulse={progressPulseKey > 0}
          >
            {placedCount}
          </strong>
          <span>/</span>
          <span>{totalTiles}</span>
        </p>
      </div>
      <div className="toolbar-actions">
        <button
          type="button"
          className="icon-button quiet-button"
          onClick={onShuffle}
          aria-label={text.shuffle}
          title={text.shuffleTitle}
        >
          <ShuffleIcon />
        </button>
        <button
          type="button"
          className="icon-button solid-button"
          onClick={onReset}
          aria-label={text.reset}
          title={text.resetTitle}
        >
          <ResetIcon />
        </button>
        <button
          type="button"
          className="icon-button quiet-button"
          onClick={onResetColumnWidths}
          aria-label={text.resetColumnWidths}
          title={text.resetColumnWidthsTitle}
        >
          <ColumnWidthIcon />
        </button>
      </div>
    </div>
  );
}

function SelectedTileStrip({
  selectedTile,
  text,
  onCancel,
}: {
  selectedTile: PuzzleTile | null;
  text: (typeof copy)['en']['puzzle'];
  onCancel: () => void;
}): ReactElement {
  return (
    <div className="selected-strip" hidden={!selectedTile}>
      <span>{text.selected}</span>
      <strong>{selectedTile?.value}</strong>
      <button
        type="button"
        className="icon-button"
        onClick={onCancel}
        aria-label={text.cancelSelected}
        title={text.cancelTitle}
      >
        <XIcon />
      </button>
    </div>
  );
}

function PuzzleTableSection({
  table,
  text,
  columnSizeVars,
  isPlacementMode,
  placements,
  tileById,
  removeCellId,
  warning,
  successPulseCellId,
  isComplete,
  availableTileCount,
  onToggleMobileView,
  onRegisterCellSlot,
  onResizeColumnFromKeyboard,
  onAttemptPlacement,
  onRevealRemove,
  onRemovePlacement,
}: {
  table: Table<LanguageRow>;
  text: (typeof copy)['en']['puzzle'];
  columnSizeVars: ColumnSizeVars;
  isPlacementMode: boolean;
  placements: Placements;
  tileById: Record<string, PuzzleTile>;
  removeCellId: string | null;
  warning: WarningState | null;
  successPulseCellId: string | null;
  isComplete: boolean;
  availableTileCount: number;
  onToggleMobileView: () => void;
  onRegisterCellSlot: (cellId: string, node: HTMLButtonElement | null) => void;
  onResizeColumnFromKeyboard: (
    header: Header<LanguageRow, unknown>,
    event: ReactKeyboardEvent<HTMLSpanElement>,
  ) => void;
  onAttemptPlacement: (cellId: string) => void;
  onRevealRemove: (cellId: string) => void;
  onRemovePlacement: (cellId: string) => void;
}): ReactElement {
  return (
    <div className="table-zone" aria-label={text.skeletonTable}>
      <div className="mobile-table-bar" hidden={isPlacementMode}>
        <span>{text.table}</span>
        <button
          type="button"
          className="icon-button back-button"
          onClick={onToggleMobileView}
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
                        onKeyDown={(event) => onResizeColumnFromKeyboard(header, event)}
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
                      isSuccessPulse={successPulseCellId === cellId}
                      onRegisterCellSlot={onRegisterCellSlot}
                      onAttemptPlacement={onAttemptPlacement}
                      onRevealRemove={onRevealRemove}
                      onRemovePlacement={onRemovePlacement}
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
            {availableTileCount} {text.tilesLeft}
          </span>
        )}
      </div>
    </div>
  );
}

function TileTray({
  text,
  availableTileIds,
  tileById,
  selectedTileId,
  onToggleMobileView,
  onSelectTile,
  onPrepareTouchDrag,
}: {
  text: (typeof copy)['en']['puzzle'];
  availableTileIds: string[];
  tileById: Record<string, PuzzleTile>;
  selectedTileId: string | null;
  onToggleMobileView: () => void;
  onSelectTile: (tileId: string) => void;
  onPrepareTouchDrag: (metrics: TileDragMetrics) => void;
}): ReactElement {
  const shouldReduceMotion = useReducedMotion();
  const layoutTransition: Transition = shouldReduceMotion
    ? { duration: 0 }
    : tileLayoutTransition;

  return (
    <aside className="tile-tray" aria-label={text.pickTile}>
      <div className="tray-header">
        <h2>{text.pickTile}</h2>
        <div className="tray-actions">
          <button
            type="button"
            className="icon-button mobile-view-toggle"
            onClick={onToggleMobileView}
            aria-label={text.showTable}
            title={text.table}
          >
            <TableIcon />
          </button>
        </div>
      </div>
      <motion.div className="tile-grid" layoutScroll>
        {availableTileIds.map((tileId) => {
          const tile = tileById[tileId];

          return (
            <motion.div
              key={tile.id}
              className="tile-motion-item"
              layout="position"
              transition={layoutTransition}
            >
              <DraggableTile
                tile={tile}
                isSelected={selectedTileId === tile.id}
                onSelect={onSelectTile}
                onPrepareTouchDrag={onPrepareTouchDrag}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </aside>
  );
}

function useLanguagePuzzleController(locale: Locale) {
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
  const progressNumberRef = useRef<HTMLElement | null>(null);
  const cellSlotRefs = useRef(new Map<string, HTMLButtonElement>());
  const progressFlightIdRef = useRef(0);
  const progressAnimationSnapshotRef = useRef<ProgressAnimationSnapshot>({
    activeFlight: null,
    queuedFlightCount: 0,
    visiblePlacedCount: 0,
    realPlacedCount: 0,
  });
  const [puzzleState, dispatchPuzzle] = useReducer(
    puzzleReducer,
    tiles,
    makeInitialPuzzleState,
  );
  const [visiblePlacedCount, setVisiblePlacedCount] = useState(0);
  const [progressFlightQueue, setProgressFlightQueue] = useState<ProgressStarFlightEvent[]>([]);
  const [activeProgressFlight, setActiveProgressFlight] =
    useState<ProgressStarFlightEvent | null>(null);
  const [successPulseCellId, setSuccessPulseCellId] = useState<string | null>(null);
  const [progressPulseKey, setProgressPulseKey] = useState(0);
  const [columnSizingByLocale, setColumnSizingByLocale] = useState<ColumnSizingByLocale>(
    makeInitialColumnSizingByLocale,
  );
  const shouldReduceMotion = useReducedMotion();
  const {
    tileOrder,
    placements,
    selectedTileId,
    activeTileId,
    activeDragIsTouch,
    shouldSettleRejectedDrop,
    touchDragMetrics,
    removeCellId,
    warning,
    mobileView,
  } = puzzleState;
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

  const availableTileIds = useMemo(
    () => {
      const placedTileIds = new Set(Object.values(placements));
      const availableIds: string[] = [];

      for (const tileId of tileOrder) {
        if (!placedTileIds.has(tileId)) {
          availableIds.push(tileId);
        }
      }

      return availableIds;
    },
    [placements, tileOrder],
  );
  const activeTile = activeTileId ? tileById[activeTileId] : null;
  const selectedTile = selectedTileId ? tileById[selectedTileId] : null;
  const placedCount = Object.keys(placements).length;
  const visibleAvailableTileCount = Math.max(tiles.length - visiblePlacedCount, 0);
  const isComplete = visiblePlacedCount === tiles.length;
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
            dispatchPuzzle({ type: 'finishRejectedDropAnimation' });
            resolve();
          };
          animation.oncancel = () => {
            dispatchPuzzle({ type: 'finishRejectedDropAnimation' });
            resolve();
          };
        }),
    [],
  );
  const overlayDropAnimation = shouldSettleRejectedDrop
    ? settleRejectedDropAnimation
    : tileDropAnimation;

  const registerCellSlot = useCallback((cellId: string, node: HTMLButtonElement | null) => {
    if (node) {
      cellSlotRefs.current.set(cellId, node);
      return;
    }

    cellSlotRefs.current.delete(cellId);
  }, []);

  const registerProgressNumber = useCallback((node: HTMLElement | null) => {
    progressNumberRef.current = node;
  }, []);

  const pulseProgressNumber = useCallback(() => {
    setProgressPulseKey((current) => current + 1);
  }, []);

  const syncVisibleProgress = useCallback(
    (nextVisiblePlacedCount = progressAnimationSnapshotRef.current.realPlacedCount) => {
      progressAnimationSnapshotRef.current = {
        activeFlight: null,
        queuedFlightCount: 0,
        visiblePlacedCount: nextVisiblePlacedCount,
        realPlacedCount: nextVisiblePlacedCount,
      };
      setProgressFlightQueue([]);
      setActiveProgressFlight(null);
      setSuccessPulseCellId(null);
      setVisiblePlacedCount(nextVisiblePlacedCount);
    },
    [],
  );

  const enqueueProgressFlight = useCallback(
    (sourceCellId: string) => {
      const sourceNode = cellSlotRefs.current.get(sourceCellId);
      const targetNode = progressNumberRef.current;

      if (shouldReduceMotion || !sourceNode || !targetNode) {
        setVisiblePlacedCount((current) => Math.min(tiles.length, current + 1));
        pulseProgressNumber();
        return;
      }

      progressFlightIdRef.current += 1;
      setProgressFlightQueue((current) => [
        ...current,
        {
          id: progressFlightIdRef.current,
          sourceCellId,
          sourceRect: snapshotRect(sourceNode.getBoundingClientRect()),
          targetRect: snapshotRect(targetNode.getBoundingClientRect()),
        },
      ]);
    },
    [pulseProgressNumber, shouldReduceMotion, tiles.length],
  );

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
    progressAnimationSnapshotRef.current = {
      activeFlight: activeProgressFlight,
      queuedFlightCount: progressFlightQueue.length,
      visiblePlacedCount,
      realPlacedCount: placedCount,
    };
  }, [activeProgressFlight, placedCount, progressFlightQueue.length, visiblePlacedCount]);

  useEffect(() => {
    if (activeProgressFlight || progressFlightQueue.length === 0) {
      return;
    }

    const [nextFlight, ...remainingFlights] = progressFlightQueue;

    setProgressFlightQueue(remainingFlights);
    setActiveProgressFlight(nextFlight);
    setSuccessPulseCellId(nextFlight.sourceCellId);

    const pulseTimeout = window.setTimeout(() => {
      setSuccessPulseCellId((current) =>
        current === nextFlight.sourceCellId ? null : current,
      );
    }, 280);

    return () => window.clearTimeout(pulseTimeout);
  }, [activeProgressFlight, progressFlightQueue]);

  useEffect(() => {
    function handleGeometryChange() {
      const snapshot = progressAnimationSnapshotRef.current;
      const hasAnimatedProgressPending =
        snapshot.activeFlight ||
        snapshot.queuedFlightCount > 0 ||
        snapshot.visiblePlacedCount !== snapshot.realPlacedCount;

      if (hasAnimatedProgressPending) {
        syncVisibleProgress(snapshot.realPlacedCount);
      }
    }

    window.addEventListener('resize', handleGeometryChange);
    window.addEventListener('scroll', handleGeometryChange, true);

    return () => {
      window.removeEventListener('resize', handleGeometryChange);
      window.removeEventListener('scroll', handleGeometryChange, true);
    };
  }, [syncVisibleProgress]);

  useEffect(() => {
    syncVisibleProgress(placedCount);
  }, [locale]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') {
        return;
      }

      dispatchPuzzle({ type: 'dismissAndShowTiles', clearWarning: true });
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

  function rejectPlacement(
    message: string,
    targetId?: string,
    options: RejectPlacementOptions = {},
  ): void {
    dispatchPuzzle({
      type: 'rejectPlacement',
      warning: { targetId, message },
      preserveDragOverlay: options.preserveDragOverlay,
    });
  }

  function getPlacementRejection(tileId: string, targetCellId: string): WarningState | null {
    const tile = tileById[tileId];
    const { slotId, columnKey } = parseSlotCellId(targetCellId);

    if (!tile || !isColumnKey(columnKey)) {
      return { message: text.chooseSlot };
    }

    if (placements[targetCellId]) {
      return { targetId: targetCellId, message: text.slotFilled };
    }

    if (tile.columnKey !== columnKey) {
      return { targetId: targetCellId, message: text.wrongSlot };
    }

    const assignedLanguageId = findRowAssignmentForSlot(placements, slotId, tileById);
    if (assignedLanguageId && tile.rowId !== assignedLanguageId) {
      return { targetId: targetCellId, message: text.wrongSlot };
    }

    return null;
  }

  function acceptPlacement(tileId: string, targetCellId: string): void {
    enqueueProgressFlight(targetCellId);
    dispatchPuzzle({ type: 'acceptPlacement', tileId, targetCellId });
  }

  function completeProgressFlight(flightId: number, sourceCellId: string): void {
    if (progressAnimationSnapshotRef.current.activeFlight?.id !== flightId) {
      return;
    }

    setActiveProgressFlight(null);
    setSuccessPulseCellId((current) => (current === sourceCellId ? null : current));
    setVisiblePlacedCount((current) => Math.min(tiles.length, current + 1));
    pulseProgressNumber();
  }

  function placeTile(tileId: string, targetCellId: string): void {
    const rejection = getPlacementRejection(tileId, targetCellId);

    if (rejection) {
      rejectPlacement(rejection.message, rejection.targetId);
      return;
    }

    acceptPlacement(tileId, targetCellId);
  }

  function selectTile(tileId: string): void {
    dispatchPuzzle({ type: 'selectTile', tileId });
  }

  function handleDragStart(event: DragStartEvent): void {
    const tileId = String(event.active.id);
    dispatchPuzzle({
      type: 'startDrag',
      tileId,
      isTouch: isTouchActivator(event.activatorEvent),
    });
  }

  function handleDragEnd(event: DragEndEvent): void {
    const tileId = String(event.active.id);
    const targetCellId = event.over?.id ? String(event.over.id) : null;

    if (!targetCellId) {
      dispatchPuzzle({
        type: 'endDragWithRejection',
        warning: { message: text.chooseSlot },
        shouldSettleDrop: activeDragIsTouch,
      });
      return;
    }

    const rejection = getPlacementRejection(tileId, targetCellId);

    if (rejection) {
      dispatchPuzzle({
        type: 'endDragWithRejection',
        warning: rejection,
        shouldSettleDrop: activeDragIsTouch,
      });
      return;
    }

    acceptPlacement(tileId, targetCellId);
  }

  function handleDragCancel(): void {
    dispatchPuzzle({ type: 'clearDrag' });
  }

  function handleCellClick(targetCellId: string): void {
    if (!selectedTileId) {
      dispatchPuzzle({
        type: 'pickFirst',
        warning: {
          targetId: targetCellId,
          message: text.pickFirst,
        },
      });
      return;
    }

    placeTile(selectedTileId, targetCellId);
  }

  function handleFilledCellClick(cellId: string): void {
    dispatchPuzzle({ type: 'revealRemove', cellId });
  }

  function removePlacement(cellId: string): void {
    const { [cellId]: removedTileId, ...nextPlacements } = placements;

    if (!removedTileId) {
      return;
    }

    syncVisibleProgress(Object.keys(nextPlacements).length);
    dispatchPuzzle({ type: 'removePlacement', nextPlacements });
  }

  function resetPuzzle(): void {
    syncVisibleProgress(0);
    dispatchPuzzle({
      type: 'resetPuzzle',
      tileOrder: shuffle(tiles.map((tile) => tile.id)),
    });
  }

  function shuffleRemaining(): void {
    dispatchPuzzle({ type: 'shuffleRemaining' });
  }

  function toggleMobileView(): void {
    dispatchPuzzle({ type: 'toggleMobileView' });
  }

  function prepareTouchDrag(metrics: TileDragMetrics): void {
    dispatchPuzzle({ type: 'setTouchDragMetrics', metrics });
  }

  return {
    text,
    table,
    columnSizeVars,
    sensors,
    availableTileIds,
    activeTile,
    selectedTile,
    selectedTileId,
    placedCount: visiblePlacedCount,
    totalTiles: tiles.length,
    isComplete,
    isPlacementMode,
    visibleMobileView,
    tileById,
    placements,
    removeCellId,
    warning,
    successPulseCellId,
    activeProgressFlight,
    progressPulseKey,
    overlayDropAnimation,
    touchOverlayModifiers,
    touchOverlayStyle,
    visibleAvailableTileCount,
    registerCellSlot,
    registerProgressNumber,
    completeProgressFlight,
    resizeColumnFromKeyboard,
    shuffleRemaining,
    resetPuzzle,
    resetColumnWidths,
    toggleMobileView,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    handleCellClick,
    handleFilledCellClick,
    removePlacement,
    selectTile,
    prepareTouchDrag,
  };
}

function LanguagePuzzleBoardView({
  text,
  table,
  columnSizeVars,
  sensors,
  availableTileIds,
  activeTile,
  selectedTile,
  selectedTileId,
  placedCount,
  totalTiles,
  isComplete,
  isPlacementMode,
  visibleMobileView,
  tileById,
  placements,
  removeCellId,
  warning,
  successPulseCellId,
  activeProgressFlight,
  progressPulseKey,
  overlayDropAnimation,
  touchOverlayModifiers,
  touchOverlayStyle,
  visibleAvailableTileCount,
  registerCellSlot,
  registerProgressNumber,
  completeProgressFlight,
  resizeColumnFromKeyboard,
  shuffleRemaining,
  resetPuzzle,
  resetColumnWidths,
  toggleMobileView,
  handleDragStart,
  handleDragEnd,
  handleDragCancel,
  handleCellClick,
  handleFilledCellClick,
  removePlacement,
  selectTile,
  prepareTouchDrag,
}: ReturnType<typeof useLanguagePuzzleController>): ReactElement {
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      measuring={stickyAwareMeasuring}
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
        <BoardToolbar
          text={text}
          placedCount={placedCount}
          totalTiles={totalTiles}
          progressPulseKey={progressPulseKey}
          onRegisterProgressNumber={registerProgressNumber}
          onShuffle={shuffleRemaining}
          onReset={resetPuzzle}
          onResetColumnWidths={resetColumnWidths}
        />

        <div
          className="play-surface"
          data-placement-mode={isPlacementMode ? 'placing' : 'picking'}
          data-mobile-view={visibleMobileView}
        >
          <SelectedTileStrip
            selectedTile={selectedTile}
            text={text}
            onCancel={handleDragCancel}
          />
          <PuzzleTableSection
            table={table}
            text={text}
            columnSizeVars={columnSizeVars}
            isPlacementMode={isPlacementMode}
            placements={placements}
            tileById={tileById}
            removeCellId={removeCellId}
            warning={warning}
            successPulseCellId={successPulseCellId}
            isComplete={isComplete}
            availableTileCount={visibleAvailableTileCount}
            onToggleMobileView={toggleMobileView}
            onRegisterCellSlot={registerCellSlot}
            onResizeColumnFromKeyboard={resizeColumnFromKeyboard}
            onAttemptPlacement={handleCellClick}
            onRevealRemove={handleFilledCellClick}
            onRemovePlacement={removePlacement}
          />
          <TileTray
            text={text}
            availableTileIds={availableTileIds}
            tileById={tileById}
            selectedTileId={selectedTileId}
            onToggleMobileView={toggleMobileView}
            onSelectTile={selectTile}
            onPrepareTouchDrag={prepareTouchDrag}
          />
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
      <ProgressStarFlight
        flight={activeProgressFlight}
        onComplete={() => {
          if (activeProgressFlight) {
            completeProgressFlight(activeProgressFlight.id, activeProgressFlight.sourceCellId);
          }
        }}
      />
    </DndContext>
  );
}

export default function LanguagePuzzleTable({ locale }: { locale: Locale }): ReactElement {
  const puzzle = useLanguagePuzzleController(locale);

  return <LanguagePuzzleBoardView {...puzzle} />;
}
