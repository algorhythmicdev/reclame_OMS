// src/lib/profiles/stores/profileTemplatesStore.ts

import { writable, derived, get } from 'svelte/store';
import type { ProfileTemplate, ProfileSection, ProfileField } from '../types';

// Mock profile templates (will be replaced with API calls later)
const MOCK_TEMPLATES: ProfileTemplate[] = [
  {
    id: 1,
    code: 'P7st',
    name: 'Profile 7st - Super Pro',
    version: 1,
    isActive: true,
    metadata: {
      icon: '🏆',
      description: {
        en: 'Complete outdoor/indoor sign with full manufacturing workflow',
        ru: 'Полный наружный/внутренний знак с полным производственным циклом',
        lv: 'Pilnīgs ārējais/iekšējais zīmējums ar pilnu ražošanas procesu'
      },
      category: 'complex',
      manufacturingTime: 192 // 8-10 days * 24 hours
    },
    sections: [
      {
        id: 1,
        name: 'CNC_FREZER',
        displayName: {
          en: 'CNC FREZER',
          ru: 'ЧПУ ФРЕЗЕР',
          lv: 'CNC FRĒZE'
        },
        icon: '⚙️',
        orderIndex: 1,
        isRequired: true,
        fields: [
          {
            id: 1,
            fieldKey: 'face_material',
            fieldType: 'material_selector',
            label: {
              en: 'FACE Material',
              ru: 'Материал ЛИЦО',
              lv: 'SEJA materiāls'
            },
            isRequired: true,
            defaultValue: 'OPAL_WHITE',
            options: ['OPAL_WHITE', 'OPAL_BLACK', 'ACRYLIC_CLEAR'],
            orderIndex: 1,
            config: {
              showPreview: true
            }
          },
          {
            id: 2,
            fieldKey: 'face_thickness',
            fieldType: 'thickness_selector',
            label: {
              en: 'FACE Thickness',
              ru: 'Толщина ЛИЦО',
              lv: 'SEJA biezums'
            },
            isRequired: true,
            defaultValue: 3,
            options: [3, 5, 6, 8],
            orderIndex: 2,
            config: {
              unit: 'mm',
              step: 0.5,
              min: 1,
              max: 20
            }
          },
          {
            id: 3,
            fieldKey: 'back_material',
            fieldType: 'material_selector',
            label: {
              en: 'BACK Material',
              ru: 'Материал ЗАДНИК',
              lv: 'AIZMUGURE materiāls'
            },
            isRequired: true,
            defaultValue: 'ALU_1_5',
            options: ['ALU_1_3', 'ALU_1_5', 'ALU_2_0', 'PVC_3MM'],
            orderIndex: 3
          }
        ]
      },
      {
        id: 2,
        name: 'BENDER',
        displayName: {
          en: 'BENDER',
          ru: 'ГИБКА',
          lv: 'LIECE'
        },
        icon: '🔄',
        orderIndex: 2,
        isRequired: true,
        fields: [
          {
            id: 4,
            fieldKey: 'sides_material',
            fieldType: 'material_selector',
            label: {
              en: 'SIDES Material',
              ru: 'Материал БОКОВИНЫ',
              lv: 'SĀNI materiāls'
            },
            isRequired: true,
            defaultValue: 'ALU_1_2',
            options: ['ALU_1_0', 'ALU_1_2', 'ALU_1_5', 'ALU_2_0'],
            orderIndex: 1
          },
          {
            id: 5,
            fieldKey: 'sides_depth',
            fieldType: 'numeric_input',
            label: {
              en: 'Depth',
              ru: 'Глубина',
              lv: 'Dziļums'
            },
            isRequired: true,
            defaultValue: 60,
            orderIndex: 2,
            config: {
              unit: 'mm',
              min: 30,
              max: 200,
              step: 10
            }
          }
        ]
      },
      {
        id: 3,
        name: 'PAINTING',
        displayName: {
          en: 'PAINTING',
          ru: 'ПОКРАСКА',
          lv: 'KRĀSOŠANA'
        },
        icon: '🎨',
        orderIndex: 3,
        isRequired: true,
        fields: [
          {
            id: 6,
            fieldKey: 'sides_color',
            fieldType: 'color_ral',
            label: {
              en: 'SIDES Color',
              ru: 'Цвет БОКОВИНЫ',
              lv: 'SĀNU krāsa'
            },
            isRequired: true,
            defaultValue: '3020',
            orderIndex: 1,
            config: {
              showPreview: true,
              previewSize: 'lg'
            }
          },
          {
            id: 7,
            fieldKey: 'back_color',
            fieldType: 'color_ral',
            label: {
              en: 'BACK Color',
              ru: 'Цвет ЗАДНИК',
              lv: 'AIZMUGURES krāsa'
            },
            isRequired: true,
            defaultValue: '3020',
            orderIndex: 2,
            config: {
              showPreview: true,
              previewSize: 'lg'
            }
          }
        ]
      },
      {
        id: 4,
        name: 'ASSEMBLING',
        displayName: {
          en: 'ASSEMBLING',
          ru: 'СБОРКА',
          lv: 'MONTĀŽA'
        },
        icon: '🔧',
        orderIndex: 4,
        isRequired: true,
        fields: [
          {
            id: 8,
            fieldKey: 'led_type',
            fieldType: 'dropdown',
            label: {
              en: 'LED Type',
              ru: 'Тип LED',
              lv: 'LED tips'
            },
            isRequired: true,
            defaultValue: 'BaltLED',
            options: ['BaltLED', 'SLOAN', 'REGULAR'],
            orderIndex: 1
          },
          {
            id: 9,
            fieldKey: 'trafo_type',
            fieldType: 'dropdown',
            label: {
              en: 'TRAFO Type',
              ru: 'Тип ТРАНСФОРМАТОРА',
              lv: 'TRAFO tips'
            },
            isRequired: false,
            defaultValue: 'REGULAR',
            options: ['REGULAR', 'SEPARATE', 'SLOAN INSIDE SIGN'],
            orderIndex: 2
          },
          {
            id: 10,
            fieldKey: 'waterholes',
            fieldType: 'toggle',
            label: {
              en: 'WATERHOLES',
              ru: 'ВОДООТВОДЫ',
              lv: 'ŪDENS ATVERES'
            },
            isRequired: false,
            defaultValue: false,
            orderIndex: 3
          }
        ]
      },
      {
        id: 5,
        name: 'DELIVERY',
        displayName: {
          en: 'DELIVERY',
          ru: 'ДОСТАВКА',
          lv: 'PIEGĀDE'
        },
        icon: '🚚',
        orderIndex: 5,
        isRequired: true,
        fields: [
          {
            id: 11,
            fieldKey: 'delivery_date',
            fieldType: 'date_input',
            label: {
              en: 'Delivery Date',
              ru: 'Дата доставки',
              lv: 'Piegādes datums'
            },
            isRequired: true,
            defaultValue: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            orderIndex: 1
          }
        ]
      }
    ]
  },
  {
    id: 2,
    code: 'P1',
    name: 'Profile 1 - Basic Sign',
    version: 1,
    isActive: true,
    metadata: {
      icon: '📦',
      description: {
        en: 'Simple sign with basic configuration',
        ru: 'Простая вывеска с базовой конфигурацией',
        lv: 'Vienkārša zīme ar pamata konfigurāciju'
      },
      category: 'simple',
      manufacturingTime: 120 // 5-7 days
    },
    sections: [
      {
        id: 6,
        name: 'CNC_FREZER',
        displayName: {
          en: 'CNC FREZER',
          ru: 'ЧПУ ФРЕЗЕР',
          lv: 'CNC FRĒZE'
        },
        icon: '⚙️',
        orderIndex: 1,
        isRequired: true,
        fields: [
          {
            id: 12,
            fieldKey: 'face_material',
            fieldType: 'material_selector',
            label: {
              en: 'FACE Material',
              ru: 'Материал ЛИЦО',
              lv: 'SEJA materiāls'
            },
            isRequired: true,
            defaultValue: 'OPAL_WHITE',
            options: ['OPAL_WHITE', 'ACRYLIC_CLEAR'],
            orderIndex: 1
          }
        ]
      },
      {
        id: 7,
        name: 'PAINTING',
        displayName: {
          en: 'PAINTING',
          ru: 'ПОКРАСКА',
          lv: 'KRĀSOŠANA'
        },
        icon: '🎨',
        orderIndex: 2,
        isRequired: true,
        fields: [
          {
            id: 13,
            fieldKey: 'color',
            fieldType: 'color_ral',
            label: {
              en: 'Color',
              ru: 'Цвет',
              lv: 'Krāsa'
            },
            isRequired: true,
            defaultValue: '9005',
            orderIndex: 1,
            config: {
              showPreview: true
            }
          }
        ]
      },
      {
        id: 8,
        name: 'DELIVERY',
        displayName: {
          en: 'DELIVERY',
          ru: 'ДОСТАВКА',
          lv: 'PIEGĀDE'
        },
        icon: '🚚',
        orderIndex: 3,
        isRequired: true,
        fields: [
          {
            id: 14,
            fieldKey: 'delivery_date',
            fieldType: 'date_input',
            label: {
              en: 'Delivery Date',
              ru: 'Дата доставки',
              lv: 'Piegādes datums'
            },
            isRequired: true,
            defaultValue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            orderIndex: 1
          }
        ]
      }
    ]
  },
  {
    id: 3,
    code: 'P3',
    name: 'Profile 3 - Channel Letters',
    version: 1,
    isActive: true,
    metadata: {
      icon: '✍️',
      description: {
        en: 'Channel letters with LED illumination',
        ru: 'Объемные буквы с LED подсветкой',
        lv: 'Kanāla burti ar LED apgaismojumu'
      },
      category: 'medium',
      manufacturingTime: 168 // 7-9 days
    },
    sections: [
      {
        id: 9,
        name: 'CNC_FREZER',
        displayName: {
          en: 'CNC FREZER',
          ru: 'ЧПУ ФРЕЗЕР',
          lv: 'CNC FRĒZE'
        },
        icon: '⚙️',
        orderIndex: 1,
        isRequired: true,
        fields: [
          {
            id: 15,
            fieldKey: 'face_material',
            fieldType: 'material_selector',
            label: {
              en: 'FACE Material',
              ru: 'Материал ЛИЦО',
              lv: 'SEJA materiāls'
            },
            isRequired: true,
            defaultValue: 'ACRYLIC_CLEAR',
            options: ['ACRYLIC_CLEAR', 'OPAL_WHITE'],
            orderIndex: 1
          }
        ]
      },
      {
        id: 10,
        name: 'BENDER',
        displayName: {
          en: 'BENDER',
          ru: 'ГИБКА',
          lv: 'LIECE'
        },
        icon: '🔄',
        orderIndex: 2,
        isRequired: true,
        fields: [
          {
            id: 16,
            fieldKey: 'sides_material',
            fieldType: 'material_selector',
            label: {
              en: 'SIDES Material',
              ru: 'Материал БОКОВИНЫ',
              lv: 'SĀNI materiāls'
            },
            isRequired: true,
            defaultValue: 'ALU_1_5',
            options: ['ALU_1_2', 'ALU_1_5'],
            orderIndex: 1
          }
        ]
      },
      {
        id: 11,
        name: 'PAINTING',
        displayName: {
          en: 'PAINTING',
          ru: 'ПОКРАСКА',
          lv: 'KRĀSOŠANA'
        },
        icon: '🎨',
        orderIndex: 3,
        isRequired: true,
        fields: [
          {
            id: 17,
            fieldKey: 'color',
            fieldType: 'color_ral',
            label: {
              en: 'Color',
              ru: 'Цвет',
              lv: 'Krāsa'
            },
            isRequired: true,
            defaultValue: '9005',
            orderIndex: 1
          }
        ]
      }
    ]
  },
  {
    id: 4,
    code: 'P5',
    name: 'Profile 5 - Lightbox',
    version: 1,
    isActive: true,
    metadata: {
      icon: '💡',
      description: {
        en: 'Illuminated lightbox sign',
        ru: 'Световой короб',
        lv: 'Izgaismots gaismas kaste'
      },
      category: 'medium',
      manufacturingTime: 144 // 6-8 days
    },
    sections: [
      {
        id: 12,
        name: 'CNC_FREZER',
        displayName: {
          en: 'CNC FREZER',
          ru: 'ЧПУ ФРЕЗЕР',
          lv: 'CNC FRĒZE'
        },
        icon: '⚙️',
        orderIndex: 1,
        isRequired: true,
        fields: [
          {
            id: 18,
            fieldKey: 'face_material',
            fieldType: 'material_selector',
            label: {
              en: 'FACE Material',
              ru: 'Материал ЛИЦО',
              lv: 'SEJA materiāls'
            },
            isRequired: true,
            defaultValue: 'OPAL_WHITE',
            options: ['OPAL_WHITE', 'ACRYLIC_CLEAR'],
            orderIndex: 1
          }
        ]
      },
      {
        id: 13,
        name: 'ASSEMBLING',
        displayName: {
          en: 'ASSEMBLING',
          ru: 'СБОРКА',
          lv: 'MONTĀŽA'
        },
        icon: '🔧',
        orderIndex: 2,
        isRequired: true,
        fields: [
          {
            id: 19,
            fieldKey: 'led_type',
            fieldType: 'dropdown',
            label: {
              en: 'LED Type',
              ru: 'Тип LED',
              lv: 'LED tips'
            },
            isRequired: true,
            defaultValue: 'BaltLED',
            options: ['BaltLED', 'SLOAN'],
            orderIndex: 1
          }
        ]
      }
    ]
  },
  {
    id: 5,
    code: 'P8',
    name: 'Profile 8 - Custom',
    version: 1,
    isActive: true,
    metadata: {
      icon: '🎯',
      description: {
        en: 'Custom profile with flexible configuration',
        ru: 'Кастомный профиль с гибкой конфигурацией',
        lv: 'Pielāgots profils ar elastīgu konfigurāciju'
      },
      category: 'complex',
      manufacturingTime: 240 // 10+ days
    },
    sections: [
      {
        id: 14,
        name: 'CONFIGURATION',
        displayName: {
          en: 'CONFIGURATION',
          ru: 'КОНФИГУРАЦИЯ',
          lv: 'KONFIGURĀCIJA'
        },
        icon: '⚙️',
        orderIndex: 1,
        isRequired: true,
        fields: [
          {
            id: 20,
            fieldKey: 'custom_notes',
            fieldType: 'textarea',
            label: {
              en: 'Custom Requirements',
              ru: 'Особые требования',
              lv: 'Pielāgotas prasības'
            },
            isRequired: true,
            defaultValue: '',
            orderIndex: 1,
            placeholder: {
              en: 'Describe your custom requirements...',
              ru: 'Опишите ваши особые требования...',
              lv: 'Aprakstiet savas prasības...'
            }
          }
        ]
      }
    ]
  }
];

// Store
function createProfileTemplatesStore() {
  const { subscribe, set, update } = writable<ProfileTemplate[]>(MOCK_TEMPLATES);

  return {
    subscribe,
    loadTemplates: async (): Promise<void> => {
      // TODO: Replace with API call
      // const response = await fetch('/api/profiles/templates');
      // const data = await response.json();
      // set(data.items || data);
      set(MOCK_TEMPLATES);
    },
    getTemplate: (code: string): ProfileTemplate | undefined => {
      return get({ subscribe }).find(t => t.code === code);
    },
    getActiveTemplates: (): ProfileTemplate[] => {
      return get({ subscribe }).filter(t => t.isActive);
    },
    getTemplateById: (id: number): ProfileTemplate | undefined => {
      return get({ subscribe }).find(t => t.id === id);
    }
  };
}

export const profileTemplates = createProfileTemplatesStore();

// Derived store for active templates only
export const activeTemplates = derived(
  profileTemplates,
  $templates => $templates.filter(t => t.isActive)
);

// Helper to get template by code
export function getTemplateByCode(code: string): ProfileTemplate | undefined {
  return get(profileTemplates).find(t => t.code === code);
}

// Helper to get complexity badge color
export function getComplexityColor(category?: string): string {
  switch (category) {
    case 'simple':
      return '#10B981'; // green
    case 'medium':
      return '#F59E0B'; // amber
    case 'complex':
      return '#EF4444'; // red
    default:
      return '#6B7280'; // gray
  }
}

// Helper to format manufacturing time
export function formatManufacturingTime(hours?: number): string {
  if (!hours) return '7-10 days';
  const days = Math.ceil(hours / 24);
  return `${days} days`;
}
