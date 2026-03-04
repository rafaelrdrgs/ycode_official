'use client';

/**
 * Hook to initialize Swiper on slider layers in the canvas editor.
 * Provides slide navigation when selecting slide layers in the layers panel.
 *
 * Swiper CSS is loaded via CDN in Canvas.tsx (same pattern as GSAP).
 * Swiper JS is bundled and initialized here per-slider instance.
 */

import { useEffect, useRef, useMemo } from 'react';
import Swiper from 'swiper';
import type { Layer, SliderSettings } from '@/types';
import { useEditorStore } from '@/stores/useEditorStore';
import { containsLayerId } from '@/lib/layer-utils';
import { DEFAULT_SLIDER_SETTINGS } from '@/lib/templates/utilities';
import { buildCanvasSwiperOptions, applySwiperEasing } from '@/lib/slider-utils';

/** Registry of active Swiper instances and their layer refs */
const swiperRegistry = new Map<string, { swiper: Swiper; layerRef: React.RefObject<Layer> }>();

/** Tracks the intended target index per slider during rapid navigation */
const targetIndex = new Map<string, number>();

function navigateAndSelect(sliderLayerId: string, direction: 'prev' | 'next') {
  const entry = swiperRegistry.get(sliderLayerId);
  if (!entry) return;
  const { swiper, layerRef } = entry;
  const slides = layerRef.current?.children?.find(c => c.name === 'slides')?.children;
  if (!slides?.length) return;

  const current = targetIndex.get(sliderLayerId) ?? swiper.realIndex;
  const next = direction === 'prev'
    ? (current - 1 + slides.length) % slides.length
    : (current + 1) % slides.length;
  targetIndex.set(sliderLayerId, next);

  swiper.slideTo(next);

  const slideLayer = slides[next];
  if (slideLayer) {
    useEditorStore.getState().setSelectedLayerId(slideLayer.id);
  }
}

/** Navigate to the previous slide and select it */
export function slidePrev(sliderLayerId: string) {
  navigateAndSelect(sliderLayerId, 'prev');
}

/** Navigate to the next slide and select it */
export function slideNext(sliderLayerId: string) {
  navigateAndSelect(sliderLayerId, 'next');
}

/**
 * Initializes Swiper on the canvas for a slider layer and navigates
 * to the correct slide when a slide or its descendant is selected.
 *
 * No-op when `layer.name !== 'slider'` or `isEditMode` is false.
 */
export function useCanvasSlider(
  elementRef: React.RefObject<HTMLElement | null>,
  layer: Layer,
  isEditMode: boolean,
) {
  const swiperRef = useRef<Swiper | null>(null);
  const layerRef = useRef(layer);

  useEffect(() => {
    layerRef.current = layer;
  });

  const isSlider = isEditMode && layer.name === 'slider';

  const settings: SliderSettings = { ...DEFAULT_SLIDER_SETTINGS, ...layer.settings?.slider };
  const settingsKey = useMemo(
    () => `${settings.animationEffect}-${settings.duration}-${settings.easing}-${settings.groupSlide}-${settings.slidesPerGroup}-${settings.centered}-${settings.paginationType}`,
    [settings.animationEffect, settings.duration, settings.easing, settings.groupSlide, settings.slidesPerGroup, settings.centered, settings.paginationType],
  );

  const settingsRef = useRef(settings);
  useEffect(() => { settingsRef.current = settings; });

  // Initialize / destroy Swiper when the slider mounts or settings change
  useEffect(() => {
    if (!isSlider || !elementRef.current) return;

    const el = elementRef.current;
    const options = buildCanvasSwiperOptions(settingsRef.current);
    const swiper = new Swiper(el, options);
    applySwiperEasing(el, settingsRef.current.easing);

    swiperRef.current = swiper;
    swiperRegistry.set(layer.id, { swiper, layerRef });

    // Restore the selected slide after reinit (e.g. after per-view change)
    const selectedLayerId = useEditorStore.getState().selectedLayerId;
    if (selectedLayerId) {
      const slidesWrapper = layerRef.current.children?.find(c => c.name === 'slides');
      const slideIndex = slidesWrapper?.children?.findIndex(
        child => containsLayerId(child, selectedLayerId),
      ) ?? -1;
      if (slideIndex > 0) {
        requestAnimationFrame(() => swiper.slideTo(slideIndex, 0));
      }
    }

    // Sync pagination state on the canvas depending on pagination type
    const isFraction = settingsRef.current.paginationType === 'fraction';

    const syncBullets = () => {
      if (isFraction) return;
      const slidesPerView = settingsRef.current.groupSlide || 1;
      const activeBulletIdx = Math.floor(swiper.realIndex / slidesPerView);
      const bulletTemplate = layerRef.current.children
        ?.find(c => c.name === 'slidePaginationWrapper')
        ?.children?.find(c => c.name === 'slideBullets')
        ?.children?.[0];
      if (!bulletTemplate) return;
      const bulletEls = el.querySelectorAll(`[data-layer-id="${bulletTemplate.id}"]`);
      bulletEls.forEach((b, i) => {
        if (i === activeBulletIdx) {
          b.setAttribute('aria-current', 'true');
        } else {
          b.removeAttribute('aria-current');
        }
      });
    };

    const syncFraction = () => {
      if (!isFraction) return;
      const fractionLayer = layerRef.current.children
        ?.find(c => c.name === 'slidePaginationWrapper')
        ?.children?.find(c => c.name === 'slideFraction');
      if (!fractionLayer) return;
      const fractionEl = el.querySelector(`[data-layer-id="${fractionLayer.id}"]`) as HTMLElement | null;
      if (!fractionEl) return;
      const slidesPerView = settingsRef.current.groupSlide || 1;
      const totalSlides = swiper.slides.length;
      const totalPages = Math.ceil(totalSlides / slidesPerView);
      const currentPage = Math.floor(swiper.realIndex / slidesPerView) + 1;
      fractionEl.textContent = `${currentPage} / ${totalPages}`;
    };

    const syncPagination = () => {
      syncBullets();
      syncFraction();
    };

    swiper.on('slideChange', syncPagination);
    requestAnimationFrame(syncPagination);

    const { setSliderAnimating } = useEditorStore.getState();
    swiper.on('slideChangeTransitionStart', () => setSliderAnimating(true));
    swiper.on('slideChangeTransitionEnd', () => {
      targetIndex.delete(layer.id);
      setSliderAnimating(false);
    });

    return () => {
      swiperRegistry.delete(layer.id);
      swiper.destroy(true, true);
      swiperRef.current = null;
      setSliderAnimating(false);
    };
  }, [isSlider, elementRef, settingsKey, layer.id]);

  // Navigate to the slide containing the selected layer
  useEffect(() => {
    if (!isSlider) return;

    const navigateToSelected = (selectedLayerId: string | null) => {
      const swiper = swiperRef.current;
      if (!swiper || !selectedLayerId) return;

      const slidesWrapper = layerRef.current.children?.find(c => c.name === 'slides');
      if (!slidesWrapper?.children) return;

      const slideIndex = slidesWrapper.children.findIndex(
        child => containsLayerId(child, selectedLayerId),
      );

      if (slideIndex >= 0 && slideIndex !== swiper.realIndex) {
        requestAnimationFrame(() => {
          swiper.update();
          swiper.slideTo(slideIndex);
        });
      }
    };

    // Handle initial selection (e.g. from URL layer= param)
    navigateToSelected(useEditorStore.getState().selectedLayerId);

    let prevSelectedId: string | null = useEditorStore.getState().selectedLayerId;

    const unsubscribe = useEditorStore.subscribe((state) => {
      const selectedLayerId = state.selectedLayerId;
      if (selectedLayerId === prevSelectedId) return;
      prevSelectedId = selectedLayerId;
      navigateToSelected(selectedLayerId);
    });

    return unsubscribe;
  }, [isSlider]);
}
