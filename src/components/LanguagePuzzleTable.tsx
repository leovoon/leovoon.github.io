import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  pointerWithin,
  rectIntersection,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type Cell,
} from '@tanstack/react-table';
import JSConfetti from 'js-confetti';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react';
import {
  buildPuzzleTiles,
  columns,
  columnKeys,
  languageRows,
  type ColumnKey,
  type LanguageRow,
  type PuzzleTile,
} from '../data/languagePuzzle.js';

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

type SlotCellId = {
  slotId: string;
  columnKey: ColumnKey;
};

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

const slotRows: LanguageRow[] = languageRows.map((_, index) => ({
  id: `slot-${index}`,
  language: '',
  coreQuestion: '',
  philosophy: '',
  whereItRuns: '',
  mentalModel: '',
}));

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
}: {
  tile: PuzzleTile;
  isSelected: boolean;
  onSelect: (tileId: string) => void;
}): ReactElement {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: tile.id,
  });
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
      {...listeners}
      {...attributes}
      aria-pressed={isSelected}
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
            ? `Row ${rowNumber}, ${cell.column.columnDef.header}, show remove option`
            : `Row ${rowNumber}, ${cell.column.columnDef.header}`
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
          aria-label={`Remove tile from row ${rowNumber}, ${cell.column.columnDef.header}`}
        >
          Remove
        </button>
      ) : null}
    </td>
  );
}

export default function LanguagePuzzleTable(): ReactElement {
  const tiles = useMemo(() => buildPuzzleTiles(), []);
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
  const [removeCellId, setRemoveCellId] = useState<string | null>(null);
  const [warning, setWarning] = useState<WarningState | null>(null);
  const [mobileView, setMobileView] = useState<MobileView>('tiles');

  const table = useReactTable({
    data: slotRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 120,
        tolerance: 8,
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

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') {
        return;
      }

      setSelectedTileId(null);
      setActiveTileId(null);
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
    setRemoveCellId(null);
    setMobileView('tiles');
  }

  function rejectPlacement(message: string, targetId?: string): void {
    setWarning({ targetId, message });
    setActiveTileId(null);
    setRemoveCellId(null);
    setMobileView('table');
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
    setRemoveCellId(null);
    setMobileView('table');
  }

  function placeTile(tileId: string, targetCellId: string): void {
    const tile = tileById[tileId];
    const { slotId, columnKey } = parseSlotCellId(targetCellId);

    if (!tile || !columnKeys.includes(columnKey)) {
      rejectPlacement('Choose a table slot for that tile.');
      return;
    }

    if (placements[targetCellId]) {
      rejectPlacement('That slot is already filled.', targetCellId);
      return;
    }

    if (tile.columnKey !== columnKey) {
      rejectPlacement('That tile does not fit this slot.', targetCellId);
      return;
    }

    const assignedLanguageId = rowAssignments[slotId];
    if (assignedLanguageId && tile.rowId !== assignedLanguageId) {
      rejectPlacement('That tile does not fit this slot.', targetCellId);
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
    setSelectedTileId(tileId);
    setMobileView('table');
    setRemoveCellId(null);
    setWarning(null);
  }

  function handleDragEnd(event: DragEndEvent): void {
    const tileId = String(event.active.id);
    const targetCellId = event.over?.id ? String(event.over.id) : null;

    setActiveTileId(null);

    if (!targetCellId) {
      rejectPlacement('Choose a table slot for that tile.');
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
        message: 'Pick a tile first.',
      });
      return;
    }

    placeTile(selectedTileId, targetCellId);
  }

  function handleFilledCellClick(cellId: string): void {
    setRemoveCellId((current) => (current === cellId ? null : cellId));
    setSelectedTileId(null);
    setActiveTileId(null);
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
          onDragStart: () => 'Tile picked up.',
          onDragOver: () => undefined,
          onDragEnd: () => 'Tile dropped.',
          onDragCancel: () => 'Tile cancelled.',
        },
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <section className="puzzle-board" aria-label="Language runtime puzzle">
        <div className="board-toolbar">
          <div>
            <p className="board-kicker">Progress</p>
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
              aria-label="Shuffle remaining tiles"
              title="Shuffle"
            >
              <ShuffleIcon />
            </button>
            <button
              type="button"
              className="icon-button solid-button"
              onClick={resetPuzzle}
              aria-label="Reset puzzle"
              title="Reset"
            >
              <ResetIcon />
            </button>
          </div>
        </div>

        <div
          className="play-surface"
          data-placement-mode={isPlacementMode ? 'placing' : 'picking'}
          data-mobile-view={visibleMobileView}
        >
          <div className="selected-strip" hidden={!selectedTile}>
            <span>Selected</span>
            <strong>{selectedTile?.value}</strong>
            <button
              type="button"
              className="icon-button"
              onClick={handleDragCancel}
              aria-label="Cancel selected tile"
              title="Cancel"
            >
              <XIcon />
            </button>
          </div>

          <div className="table-zone" aria-label="Skeleton table">
            <div className="mobile-table-bar" hidden={isPlacementMode}>
              <span>Table</span>
              <button
                type="button"
                className="icon-button back-button"
                onClick={toggleMobileView}
                aria-label="Show tile picker"
                title="Go back"
              >
                <ArrowLeftIcon />
              </button>
            </div>
            <div className="table-scroll">
              <table className="runtime-table">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} scope="col">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
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
                <span className="complete-message">Complete. Every slot is filled.</span>
              ) : warning ? (
                <span className="warning-message">{warning.message}</span>
              ) : (
                <span>{availableTileIds.length} tiles left</span>
              )}
            </div>
          </div>

          <aside className="tile-tray" aria-label="Pick tile">
            <div className="tray-header">
              <h2>Pick tile</h2>
              <div className="tray-actions">
                <button
                  type="button"
                  className="icon-button mobile-view-toggle"
                  onClick={toggleMobileView}
                  aria-label="Show table"
                  title="Table"
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
                  />
                );
              })}
            </div>
          </aside>
        </div>
      </section>

      <DragOverlay dropAnimation={{ duration: 160, easing: 'cubic-bezier(.2, .8, .2, 1)' }}>
        {activeTile ? (
          <div className="answer-tile overlay-tile">
            <TileContent tile={activeTile} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
