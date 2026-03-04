/**
 * Utility Elements Templates
 */

import { BlockTemplate, SliderSettings } from '@/types';
import { getTemplateRef } from './blocks';

/** Default slider settings applied when creating a new slider */
export const DEFAULT_SLIDER_SETTINGS: SliderSettings = {
  navigation: true,
  groupSlide: 1,
  slidesPerGroup: 1,
  loop: 'none',
  centered: false,
  touchEvents: false,
  slideToClicked: false,
  mousewheel: false,

  pagination: true,
  paginationType: 'bullets',
  paginationClickable: true,
  autoplay: false,
  pauseOnHover: true,
  delay: '3',
  animationEffect: 'Slide',
  easing: 'ease-in-out',
  duration: '0.5',
};

/** All layer names that are part of the slider element */
export const SLIDER_LAYER_NAMES = [
  'slider', 'slides', 'slide',
  'slideNavigationWrapper', 'slideButtonPrev', 'slideButtonNext',
  'slidePaginationWrapper', 'slideBullets', 'slideFraction', 'slideBullet',
] as const;

export type SliderLayerName = typeof SLIDER_LAYER_NAMES[number];

/** Check if a layer name belongs to the slider element family */
export function isSliderLayerName(name: string): name is SliderLayerName {
  return (SLIDER_LAYER_NAMES as readonly string[]).includes(name);
}

/** Swiper CSS classes needed for core layout (used on canvas + production) */
export const SWIPER_CLASS_MAP: Record<string, string> = {
  slider: 'swiper',
  slides: 'swiper-wrapper',
  slide: 'swiper-slide',
};

/** Data attributes added to slider nav/pagination elements on production for Swiper targeting */
export const SWIPER_DATA_ATTR_MAP: Record<string, string> = {
  slideButtonPrev: 'data-slider-prev',
  slideButtonNext: 'data-slider-next',
  slideBullets: 'data-slider-pagination',
  slideFraction: 'data-slider-fraction',
};

const CHEVRON_LEFT_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd"></path></svg>';
const CHEVRON_RIGHT_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd"></path></svg>';

export const utilityTemplates: Record<string, BlockTemplate> = {
  map: {
    icon: 'block',
    name: 'Map',
    template: {
      name: 'map',
      classes: ['w-full', 'h-full'],
      children: [],
    },
  },

  lightbox: {
    icon: 'block',
    name: 'Lightbox',
    template: {
      name: 'lightbox',
      classes: ['w-full', 'h-full'],
      children: [],
    },
  },

  // --- Slider sub-element templates (not shown in Element Library) ---
  slides: {
    icon: 'slides',
    name: 'Slides',
    template: {
      name: 'slides',
      customName: 'Slides',
      classes: ['w-full', 'h-full'],
      design: {
        sizing: { isActive: true, width: '100%', height: '100%' },
      },
      restrictions: { copy: false, delete: false, ancestor: 'slider' },
      children: [],
    },
  },

  slide: {
    icon: 'slide',
    name: 'Slide',
    template: {
      name: 'slide',
      customName: 'Slide',
      classes: ['w-full', 'h-full'],
      restrictions: { ancestor: 'slides' },
      children: [],
    },
  },

  slideNavigationWrapper: {
    icon: 'slide-navigation',
    name: 'Navigation',
    template: {
      name: 'slideNavigationWrapper',
      customName: 'Navigation',
      classes: ['contents'],
      design: {
        layout: { isActive: true, display: 'Contents' },
      },
      restrictions: { copy: false, delete: false, ancestor: 'slider' },
      children: [],
    },
  },

  slideButtonPrev: {
    icon: 'slide-button-prev',
    name: 'Previous',
    template: {
      name: 'slideButtonPrev',
      customName: 'Previous',
      classes: [
        'absolute', 'top-0', 'bottom-0', 'left-0', 'z-[100]',
        'flex', 'items-center', 'justify-center',
        'disabled:opacity-50', 'disabled:pointer-events-none',
      ],
      design: {
        layout: { isActive: true, display: 'Flex', alignItems: 'center', justifyContent: 'center' },
        positioning: { isActive: true, position: 'absolute', top: '0px', bottom: '0px', left: '0px', zIndex: '100' },
      },
      restrictions: { copy: false, delete: false, ancestor: 'slider' },
      children: [
        {
          name: 'div',
          customName: 'Button',
          classes: ['flex', 'items-center', 'justify-center', 'cursor-pointer', 'ml-[32px]', 'rounded-full', 'bg-black', 'w-[36px]', 'h-[36px]'],
          design: {
            layout: { isActive: true, display: 'Flex', alignItems: 'center', justifyContent: 'center' },
            sizing: { isActive: true, width: '36px', height: '36px' },
            borders: { isActive: true, borderRadius: '9999px' },
            backgrounds: { isActive: true, backgroundColor: '#000000' },
            spacing: { isActive: true, marginLeft: '32px' },
          },
          children: [
            getTemplateRef('icon', {
              customName: 'Icon',
              variables: {
                icon: { src: { type: 'static_text', data: { content: CHEVRON_LEFT_SVG } } },
              },
              classes: ['w-[24px]', 'h-[24px]', 'text-white'],
              design: { sizing: { isActive: true, width: '24px', height: '24px' } },
            }),
          ],
        },
      ],
    },
  },

  slideButtonNext: {
    icon: 'slide-button-next',
    name: 'Next',
    template: {
      name: 'slideButtonNext',
      customName: 'Next',
      classes: [
        'absolute', 'top-0', 'bottom-0', 'right-0', 'z-[100]',
        'flex', 'items-center', 'justify-center',
        'disabled:opacity-50', 'disabled:pointer-events-none',
      ],
      design: {
        layout: { isActive: true, display: 'Flex', alignItems: 'center', justifyContent: 'center' },
        positioning: { isActive: true, position: 'absolute', top: '0px', bottom: '0px', right: '0px', zIndex: '100' },
      },
      restrictions: { copy: false, delete: false, ancestor: 'slider' },
      children: [
        {
          name: 'div',
          customName: 'Button',
          classes: ['flex', 'items-center', 'justify-center', 'cursor-pointer', 'mr-[32px]', 'rounded-full', 'bg-black', 'w-[36px]', 'h-[36px]'],
          design: {
            layout: { isActive: true, display: 'Flex', alignItems: 'center', justifyContent: 'center' },
            sizing: { isActive: true, width: '36px', height: '36px' },
            borders: { isActive: true, borderRadius: '9999px' },
            backgrounds: { isActive: true, backgroundColor: '#000000' },
            spacing: { isActive: true, marginRight: '32px' },
          },
          children: [
            getTemplateRef('icon', {
              customName: 'Icon',
              variables: {
                icon: { src: { type: 'static_text', data: { content: CHEVRON_RIGHT_SVG } } },
              },
              classes: ['w-[24px]', 'h-[24px]', 'text-white'],
              design: { sizing: { isActive: true, width: '24px', height: '24px' } },
            }),
          ],
        },
      ],
    },
  },

  slidePaginationWrapper: {
    icon: 'slide-bullets',
    name: 'Pagination',
    template: {
      name: 'slidePaginationWrapper',
      customName: 'Pagination',
      classes: [
        'absolute', 'bottom-[16px]', 'left-0', 'right-0', 'z-[100]',
        'flex', 'items-center', 'justify-center', 'gap-[8px]',
      ],
      design: {
        layout: { isActive: true, display: 'Flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
        positioning: { isActive: true, position: 'absolute', bottom: '16px', left: '0px', right: '0px', zIndex: '100' },
      },
      restrictions: { copy: false, delete: false, ancestor: 'slider' },
      children: [],
    },
  },

  slideBullets: {
    icon: 'slide-bullets',
    name: 'Bullets',
    template: {
      name: 'slideBullets',
      customName: 'Bullets',
      classes: ['flex', 'items-center', 'justify-center', 'bg-black/50', 'rounded-[9999px]', 'gap-[4px]', 'p-[8px]', 'z-[100]', 'relative'],
      design: {
        layout: { isActive: true, display: 'Flex', alignItems: 'center', justifyContent: 'center', gap: '4px' },
        borders: { isActive: true, borderRadius: '9999px' },
        spacing: { isActive: true, paddingTop: '8px', paddingRight: '8px', paddingBottom: '8px', paddingLeft: '8px' },
        backgrounds: { isActive: true, backgroundColor: 'rgba(0,0,0,0.5)' },
        positioning: { isActive: true, position: 'relative', zIndex: '100' },
      },
      restrictions: { copy: false, delete: false, ancestor: 'slider' },
      children: [],
    },
  },

  slideBullet: {
    icon: 'slide-bullet',
    name: 'Bullet',
    template: {
      name: 'slideBullet',
      customName: 'Bullet',
      classes: ['w-[6px]', 'h-[6px]', 'rounded-[8px]', 'bg-white', 'opacity-50', 'cursor-pointer', 'current:opacity-100'],
      design: {
        sizing: { isActive: true, width: '6px', height: '6px' },
        borders: { isActive: true, borderRadius: '8px' },
      },
      restrictions: { copy: false, delete: false, ancestor: 'slider' },
      children: [],
    },
  },

  slideFraction: {
    icon: 'slide-fraction',
    name: 'Fraction',
    template: {
      name: 'slideFraction',
      customName: 'Fraction',
      classes: ['text-white', 'text-[14px]'],
      design: {
        typography: { isActive: true, fontSize: '14px', color: '#ffffff' },
      },
      restrictions: { copy: false, delete: false, ancestor: 'slider' },
      children: [],
    },
  },

  // --- Main Slider element (shown in Element Library) ---
  slider: {
    icon: 'slider',
    name: 'Slider',
    template: {
      name: 'slider',
      customName: 'Slider',
      classes: [
        'flex', 'relative', 'w-full', 'h-[600px]', 'overflow-hidden', 'rounded-[16px]',
      ],
      settings: {
        tag: 'div',
        slider: { ...DEFAULT_SLIDER_SETTINGS },
      },
      design: {
        layout: { isActive: true, display: 'Flex' },
        sizing: { isActive: true, width: '100%', height: '600px' },
      },
      open: true,
      children: [
        // Slides wrapper with 3 default slides
        {
          name: 'slides',
          customName: 'Slides',
          classes: ['w-full', 'h-full'],
          design: {
            sizing: { isActive: true, width: '100%', height: '100%' },
          },
          restrictions: { copy: false, delete: false, ancestor: 'slider' },
          open: true,
          children: [
            {
              name: 'slide',
              customName: 'Slide 1',
              classes: ['w-full', 'h-full'],
              restrictions: { ancestor: 'slides' },
              children: [
                getTemplateRef('image', {
                  classes: ['w-full', 'h-full', 'object-cover'],
                  design: { sizing: { isActive: true, width: '100%', height: '100%', objectFit: 'cover' } },
                  variables: {
                    image: {
                      src: { type: 'dynamic_text', data: { content: '/ycode/layouts/assets/placeholder-2.webp' } },
                      alt: { type: 'dynamic_text', data: { content: 'Slide 1' } },
                    },
                  },
                }),
              ],
            },
            {
              name: 'slide',
              customName: 'Slide 2',
              classes: ['w-full', 'h-full'],
              restrictions: { ancestor: 'slides' },
              children: [
                getTemplateRef('image', {
                  classes: ['w-full', 'h-full', 'object-cover'],
                  design: { sizing: { isActive: true, width: '100%', height: '100%', objectFit: 'cover' } },
                  variables: {
                    image: {
                      src: { type: 'dynamic_text', data: { content: '/ycode/layouts/assets/placeholder-3.webp' } },
                      alt: { type: 'dynamic_text', data: { content: 'Slide 2' } },
                    },
                  },
                }),
              ],
            },
            {
              name: 'slide',
              customName: 'Slide 3',
              classes: ['w-full', 'h-full'],
              restrictions: { ancestor: 'slides' },
              children: [
                getTemplateRef('image', {
                  classes: ['w-full', 'h-full', 'object-cover'],
                  design: { sizing: { isActive: true, width: '100%', height: '100%', objectFit: 'cover' } },
                  variables: {
                    image: {
                      src: { type: 'dynamic_text', data: { content: '/ycode/layouts/assets/placeholder-7.webp' } },
                      alt: { type: 'dynamic_text', data: { content: 'Slide 3' } },
                    },
                  },
                }),
              ],
            },
          ],
        },
        // Navigation (prev/next buttons)
        {
          name: 'slideNavigationWrapper',
          customName: 'Navigation',
          classes: ['contents'],
          design: {
            layout: { isActive: true, display: 'Contents' },
          },
          restrictions: { copy: false, delete: false, ancestor: 'slider' },
          open: false,
          children: [
            getTemplateRef('slideButtonPrev'),
            getTemplateRef('slideButtonNext'),
          ],
        },
        // Pagination (bullets + fraction)
        getTemplateRef('slidePaginationWrapper', {
          open: false,
          children: [
            getTemplateRef('slideBullets', {
              children: [
                getTemplateRef('slideBullet'),
              ],
            }),
            getTemplateRef('slideFraction'),
          ],
        }),
      ],
    },
  },

  localeSelector: {
    icon: 'globe',
    name: 'Locales',
    template: getTemplateRef('div', {
      customName: 'Locales',
      name: 'localeSelector',
      open: true,
      settings: {
        tag: 'div',
        locale: {
          format: 'locale',
        },
      },
      children: [
        // Locale text
        getTemplateRef('text', {
          key: 'localeSelectorLabel',
          customName: 'Locale',
          settings: {
            tag: 'span',
          },
          restrictions: {
            copy: false,
            delete: false,
            editText: false,
            ancestor: 'localeSelector',
          },
          variables: {
            text: {
              type: 'dynamic_text',
              data: {
                content: 'English'
              }
            }
          }
        }),
        // Locale icon (chevron down)
        getTemplateRef('icon', {
          customName: 'Icon',
          variables: {
            icon: {
              src: {
                type: 'static_text',
                data: {
                  content: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clip-rule="evenodd"></path></svg>'
                }
              }
            }
          },
          classes: [
            'w-[18px]',
            'h-[18px]'
          ],
          design: {
            sizing: {
              isActive: true,
              width: '18px',
              height: '18px'
            }
          }
        }),
      ],
      attributes: {
        display_type: 'name',
      },
      classes: [
        'flex',
        'items-center',
        'pt-[8px]',
        'pb-[8px]',
        'relative',
        'pl-[14px]',
        'pr-[14px]',
        'bg-opacity-[100%]',
        'bg-[#F5F5F5]',
        'w-[max-content]',
        'text-[16px]',
        'rounded-[12px]',
        'text-opacity-[100%]',
        'text-[#171717]',
        'font-medium',
        'tracking-[-0.025em]',
        'gap-[6px]',
      ],
      design: {
        layout: {
          isActive: false,
          display: 'Flex',
          gap: '6px',
          alignItems: 'center',
        },
        sizing: {
          isActive: false,
          width: 'max-content',
        },
        spacing: {
          isActive: true,
          paddingLeft: '14px',
          paddingRight: '14px',
          paddingBottom: '8px',
          paddingTop: '8px',
        },
        backgrounds: {
          isActive: true,
          backgroundColor: '#f5f5f5',
        },
        typography: {
          isActive: true,
          fontSize: '16px',
          letterSpacing: '-0.025em',
          color: '#171717',
          fontWeight: '500',
        },
      },
    }),
  },

  htmlEmbed: {
    icon: 'code',
    name: 'Code',
    template: {
      name: 'htmlEmbed',
      classes: ['w-full'],
      settings: {
        tag: 'div',
        htmlEmbed: {
          code: `<!-- Example: Tailwind CSS + JavaScript -->
<script src="https://cdn.tailwindcss.com"></script>

<div class="p-6 rounded-xl border border-gray-200 bg-white shadow-sm w-full">
  <h2 class="text-xl font-semibold">Custom Code Embed</h2>
  <p class="text-sm text-gray-500 mt-1">
    Add your HTML, CSS, and JavaScript here
  </p>

  <button
    id="btn"
    class="mt-4 px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:opacity-90"
  >
    Click me
  </button>

  <div id="output" class="mt-2 text-sm text-gray-600">
    Ready
  </div>
</div>

<script>
  const btn = document.getElementById("btn");
  const output = document.getElementById("output");
  let clicks = 0;

  btn.addEventListener("click", () => {
    clicks++;
    output.textContent = \`Clicked \${clicks} times!\`;
  });
</script>`,
        },
      },
      design: {
        sizing: {
          isActive: true,
          width: '100%',
        },
      },
    },
  },
};
