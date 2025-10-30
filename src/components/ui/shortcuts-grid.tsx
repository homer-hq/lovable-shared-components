import React from 'react';
import { Shortcut } from './shortcut';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ShortcutsGridProps {
  actionIds: string[];
  onShortcutClick?: (actionId: string) => void;
  onReorder?: (newOrder: string[]) => void;
  className?: string;
}

interface SortableShortcutProps {
  actionId: string;
  className?: string;
  onShortcutClick?: (actionId: string) => void;
  style?: React.CSSProperties;
}

const SortableShortcut: React.FC<SortableShortcutProps> = ({ actionId, className, onShortcutClick, style }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: actionId });

  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...style,
  };

  return (
    <div ref={setNodeRef} style={sortableStyle} {...attributes} {...listeners} className="flex-1 min-w-0">
      <Shortcut
        actionId={actionId}
        className={`cursor-grab active:cursor-grabbing w-full ${className || ''}`}
        onClick={() => onShortcutClick?.(actionId)}
      />
    </div>
  );
};

export const ShortcutsGrid: React.FC<ShortcutsGridProps> = ({ 
  actionIds, 
  onShortcutClick,
  onReorder, 
  className 
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id && onReorder) {
      const oldIndex = actionIds.indexOf(active.id);
      const newIndex = actionIds.indexOf(over.id);
      
      const newOrder = arrayMove(actionIds, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };
  const getGridItemClass = (colIndex: number, itemsInRow: number, isFirstRow: boolean, isLastRow: boolean) => {
    const isFirstInRow = colIndex === 0;
    const isLastInRow = colIndex === itemsInRow - 1;

    let corners = '';

    // Only apply large radius to the actual outer corners of the entire grid
    if (isFirstRow && isFirstInRow) corners += ' rounded-tl-2xl';
    if (isFirstRow && isLastInRow) corners += ' rounded-tr-2xl';
    if (isLastRow && isFirstInRow) corners += ' rounded-bl-2xl';
    if (isLastRow && isLastInRow) corners += ' rounded-br-2xl';

    // No inner corner rounding - keep sharp corners for internal borders
    return corners;
  };

  const renderRows = () => {
    if (actionIds.length <= 3) {
      // Single row
      return (
        <div className="flex">
          {actionIds.map((actionId, index) => (
            <SortableShortcut
              key={actionId}
              actionId={actionId}
              className={getGridItemClass(index, actionIds.length, true, true)}
              onShortcutClick={onShortcutClick}
              style={{ flex: '1' }}
            />
          ))}
        </div>
      );
    } else if (actionIds.length === 4) {
      // Two rows of 2
      return (
        <div className="flex flex-col">
          <div className="flex">
            {actionIds.slice(0, 2).map((actionId, index) => (
              <SortableShortcut
                key={actionId}
                actionId={actionId}
                className={getGridItemClass(index, 2, true, false)}
                onShortcutClick={onShortcutClick}
                style={{ flex: '1' }}
              />
            ))}
          </div>
          <div className="flex">
            {actionIds.slice(2, 4).map((actionId, index) => (
              <SortableShortcut
                key={actionId}
                actionId={actionId}
                className={getGridItemClass(index, 2, false, true)}
                onShortcutClick={onShortcutClick}
                style={{ flex: '1' }}
              />
            ))}
          </div>
        </div>
      );
    } else if (actionIds.length === 5) {
      // First row: 2 items, Second row: 3 items
      return (
        <div className="flex flex-col">
          <div className="flex">
            {actionIds.slice(0, 2).map((actionId, index) => (
              <SortableShortcut
                key={actionId}
                actionId={actionId}
                className={getGridItemClass(index, 2, true, false)}
                onShortcutClick={onShortcutClick}
                style={{ flex: '1' }}
              />
            ))}
          </div>
          <div className="flex">
            {actionIds.slice(2, 5).map((actionId, index) => (
              <SortableShortcut
                key={actionId}
                actionId={actionId}
                className={getGridItemClass(index, 3, false, true)}
                onShortcutClick={onShortcutClick}
                style={{ flex: '1' }}
              />
            ))}
          </div>
        </div>
      );
    } else {
      // For 6+ items, use standard 3-column layout
      const rows = Math.ceil(actionIds.length / 3);
      return (
        <div className="flex flex-col">
          {Array.from({ length: rows }, (_, rowIndex) => {
            const startIndex = rowIndex * 3;
            const endIndex = Math.min(startIndex + 3, actionIds.length);
            const rowItems = actionIds.slice(startIndex, endIndex);
            const isFirstRow = rowIndex === 0;
            const isLastRow = rowIndex === rows - 1;
            
            return (
              <div key={rowIndex} className="flex">
                {rowItems.map((actionId, index) => (
                  <SortableShortcut
                    key={actionId}
                    actionId={actionId}
                    className={getGridItemClass(index, rowItems.length, isFirstRow, isLastRow)}
                    onShortcutClick={onShortcutClick}
                    style={{ flex: '1' }}
                  />
                ))}
              </div>
            );
          })}
        </div>
      );
    }
  };

  if (!actionIds.length) {
    return null;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className={`w-full ${className || ''}`}>
        <SortableContext
          items={actionIds}
          strategy={rectSortingStrategy}
        >
          {renderRows()}
        </SortableContext>
      </div>
    </DndContext>
  );
};