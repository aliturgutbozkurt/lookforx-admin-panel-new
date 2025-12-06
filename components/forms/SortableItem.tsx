'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ReactNode, createContext, useContext } from 'react';

interface SortableItemProps {
    id: string;
    children: ReactNode;
}

interface SortableContextValue {
    listeners: any;
    attributes: any;
}

const SortableContext = createContext<SortableContextValue | null>(null);

export function useSortableContext() {
    const context = useContext(SortableContext);
    if (!context) {
        throw new Error('useSortableContext must be used within SortableItem');
    }
    return context;
}

export function SortableItem({ id, children }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <SortableContext.Provider value={{ listeners, attributes }}>
            <div ref={setNodeRef} style={style} {...attributes}>
                {children}
            </div>
        </SortableContext.Provider>
    );
}
