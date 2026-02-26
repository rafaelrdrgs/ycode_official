'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useEditorStore } from '@/stores/useEditorStore';

interface HoveredElement {
  layerId: string;
  rect: { left: number; top: number; width: number; height: number };
  isValid: boolean;
}

interface ElementPickerOverlayProps {
  iframeElement: HTMLIFrameElement | null;
  zoom: number;
}

export default function ElementPickerOverlay({ iframeElement, zoom }: ElementPickerOverlayProps) {
  const elementPicker = useEditorStore((state) => state.elementPicker);
  const stopElementPicker = useEditorStore((state) => state.stopElementPicker);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredElement, setHoveredElement] = useState<HoveredElement | null>(null);
  const overlayRef = useRef<SVGSVGElement>(null);

  const origin = elementPicker?.originPosition;
  const validate = elementPicker?.validate;
  const scale = zoom / 100;

  const findLayerInIframe = useCallback((iframeX: number, iframeY: number): HoveredElement | null => {
    if (!iframeElement) return null;
    const iframeDoc = iframeElement.contentDocument;
    if (!iframeDoc) return null;

    const el = iframeDoc.elementFromPoint(iframeX, iframeY);
    if (!el) return null;

    let current: HTMLElement | null = el as HTMLElement;
    while (current) {
      const layerId = current.getAttribute('data-layer-id');
      if (layerId) {
        const localRect = current.getBoundingClientRect();
        const iframeRect = iframeElement.getBoundingClientRect();
        const screenRect = {
          left: iframeRect.left + localRect.left * scale,
          top: iframeRect.top + localRect.top * scale,
          width: localRect.width * scale,
          height: localRect.height * scale,
        };
        const isValid = validate ? validate(layerId) : true;
        return { layerId, rect: screenRect, isValid };
      }
      current = current.parentElement;
    }
    return null;
  }, [iframeElement, validate, scale]);

  const findLayerInParent = useCallback((clientX: number, clientY: number): HoveredElement | null => {
    const overlay = overlayRef.current;
    if (overlay) overlay.style.pointerEvents = 'none';
    const el = document.elementFromPoint(clientX, clientY);
    if (overlay) overlay.style.pointerEvents = '';

    if (!el) return null;

    let current: HTMLElement | null = el as HTMLElement;
    while (current) {
      const layerId = current.getAttribute('data-layer-id');
      if (layerId) {
        const rect = current.getBoundingClientRect();
        const isValid = validate ? validate(layerId) : true;
        return { layerId, rect, isValid };
      }
      current = current.parentElement;
    }
    return null;
  }, [validate]);

  // Parent window event listeners
  useEffect(() => {
    if (!elementPicker?.active) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      const found = findLayerInParent(e.clientX, e.clientY);
      setHoveredElement(found);
    };

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const found = findLayerInParent(e.clientX, e.clientY);
      if (found && found.isValid && elementPicker.onSelect) {
        elementPicker.onSelect(found.layerId);
      } else {
        toast.error('Please select an input element inside a Filter form.');
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        stopElementPicker();
      }
    };

    window.addEventListener('mousemove', handleMouseMove, true);
    window.addEventListener('click', handleClick, true);
    window.addEventListener('keydown', handleEscape, true);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove, true);
      window.removeEventListener('click', handleClick, true);
      window.removeEventListener('keydown', handleEscape, true);
    };
  }, [elementPicker?.active, elementPicker?.onSelect, findLayerInParent, stopElementPicker]);

  // Iframe event listeners
  useEffect(() => {
    if (!elementPicker?.active || !iframeElement) return;
    const iframeDoc = iframeElement.contentDocument;
    if (!iframeDoc) return;

    const handleMouseMove = (e: MouseEvent) => {
      const iframeRect = iframeElement.getBoundingClientRect();
      const screenX = iframeRect.left + e.clientX * scale;
      const screenY = iframeRect.top + e.clientY * scale;
      setMousePos({ x: screenX, y: screenY });
      const found = findLayerInIframe(e.clientX, e.clientY);
      setHoveredElement(found);
    };

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const found = findLayerInIframe(e.clientX, e.clientY);
      if (found && found.isValid && elementPicker.onSelect) {
        elementPicker.onSelect(found.layerId);
      } else {
        toast.error('Please select an input element inside a Filter form.');
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        stopElementPicker();
      }
    };

    iframeDoc.addEventListener('mousemove', handleMouseMove, true);
    iframeDoc.addEventListener('click', handleClick, true);
    iframeDoc.addEventListener('keydown', handleEscape, true);
    iframeDoc.body.style.cursor = 'crosshair';

    return () => {
      iframeDoc.removeEventListener('mousemove', handleMouseMove, true);
      iframeDoc.removeEventListener('click', handleClick, true);
      iframeDoc.removeEventListener('keydown', handleEscape, true);
      iframeDoc.body.style.cursor = '';
    };
  }, [elementPicker?.active, elementPicker?.onSelect, iframeElement, scale, findLayerInIframe, stopElementPicker]);

  // Reset state when picker deactivates
  useEffect(() => {
    if (!elementPicker?.active) {
      setMousePos(null);
      setHoveredElement(null);
    }
  }, [elementPicker?.active]);

  if (!elementPicker?.active || !origin || !mousePos) return null;

  const snapToTarget = hoveredElement?.isValid;
  const endX = snapToTarget
    ? hoveredElement!.rect.left + hoveredElement!.rect.width / 2
    : mousePos.x;
  const endY = snapToTarget
    ? hoveredElement!.rect.top + hoveredElement!.rect.height / 2
    : mousePos.y;

  const dx = endX - origin.x;
  const cp1x = origin.x + dx * 0.4;
  const cp1y = origin.y;
  const cp2x = endX - dx * 0.4;
  const cp2y = endY;
  const pathD = `M ${origin.x} ${origin.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;

  const highlightColor = hoveredElement?.isValid ? '#22c55e' : '#22c55e';
  const highlightFill = hoveredElement?.isValid ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.06)';

  return (
    <svg
      ref={overlayRef}
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{ width: '100vw', height: '100vh', cursor: 'crosshair' }}
    >
      {/* Bezier connector line */}
      <path
        d={pathD}
        fill="none"
        stroke="#22c55e"
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* Origin dot */}
      <circle
        cx={origin.x} cy={origin.y}
        r={5} fill="#22c55e"
      />

      {/* Crosshair icon at mouse or hovered element center */}
      <g transform={`translate(${endX}, ${endY})`}>
        <circle
          r={8} fill="none"
          stroke="#22c55e" strokeWidth={1.5}
        />
        <line
          x1={0} y1={-12}
          x2={0} y2={12}
          stroke="#22c55e" strokeWidth={1.5}
        />
        <line
          x1={-12} y1={0}
          x2={12} y2={0}
          stroke="#22c55e" strokeWidth={1.5}
        />
      </g>

      {/* Hover highlight on any layer */}
      {hoveredElement && (
        <rect
          x={hoveredElement.rect.left - 2}
          y={hoveredElement.rect.top - 2}
          width={hoveredElement.rect.width + 4}
          height={hoveredElement.rect.height + 4}
          rx={4}
          fill={highlightFill}
          stroke={highlightColor}
          strokeWidth={2}
        />
      )}
    </svg>
  );
}
