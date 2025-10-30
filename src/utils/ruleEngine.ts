import type { Rule } from '@/services/rulesService';
import { DefaultEffectsService } from '@/services/defaultEffectsService';
import { getTabLabel } from '@/lib/tabTranslations';

export interface TestContext {
  user: {
    partner: { name: string } | null;
    countryISO: string;
    [key: string]: any;
  };
  home: {
    name?: string;
    type: string;
    ownershipType: string;
    countryISO: string;
    partner?: { name: string } | null;
    extra?: {
      zillowId?: string | null;
      [key: string]: any;
    };
    users?: Array<{
      id: string;
      homeRole: string;
    }>;
    [key: string]: any;
  };
  userActivity: {
    homesCount: number;
    cardsCount: number;
    appOpened: number;
    timelinePions: number;
    [key: string]: any;
  };
  homeActivity: {
    inboxEmailed: number;
    [key: string]: any;
  };
  expensesScreen: {
    activeSubtab: 'expenses-all' | 'expenses-trackers';
  };
}

interface QuickActionsConfig {
  visible: boolean;
  items: string[]; // actionIds
  layout: 'grid' | 'list';
  showCustomize: boolean;
  showAllActions: boolean;
}

export interface AppliedEffectsState {
  header: {
    avatars: boolean;
    homeInfo: boolean;
    userSettings: boolean;
    expandCollapse: boolean;
    ellipsis: boolean;
    searchAsk: boolean;
    search: boolean | undefined;
    ask: boolean | undefined;
    navDots: boolean;
    navDotCount: number;
    activeNavDot: number;
  };
  homeImage: {
    url?: string;
    partnerLogo?: string;
  };
  shortcuts: string[]; // actionIds
  quickActions: {
    start: QuickActionsConfig;
    inventory: QuickActionsConfig;
    expenses: QuickActionsConfig;
    timeline: QuickActionsConfig;
    lists: QuickActionsConfig;
  };
  startPlates: string[]; // actionIds
  fab: {
    visible: boolean;
  };
  bottomTabs: Array<{
    id: string;
    label: string;
    icon: string;
    visible: boolean;
    position: number;
  }>;
  inventory: {
    displayType: 'list' | 'microcards' | 'grid' | 'large' | 'table';
  };
  [key: string]: any;
}

type Operator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains';

interface Cause {
  field?: string; // Legacy format
  path?: string; // New format
  dataSource?: string; // New format: user, home, userActivity, homeActivity
  operator: Operator;
  value?: any; // Legacy format
  data?: { // New format
    type: string;
    value: any;
  };
  logicalOperator?: 'AND' | 'OR';
  active?: boolean;
}

/**
 * Check if a single cause matches the context
 */
function evaluateCause(cause: Cause, context: TestContext): boolean {
  // Validate cause has required fields
  if (!cause || !cause.operator) {
    console.warn('Invalid cause - missing operator:', cause);
    return false;
  }

  // Skip inactive causes
  if (cause.active === false) {
    return false;
  }

  // Build the full field path
  let fieldPath: string;
  if (cause.field) {
    // Legacy format: field contains full path like "user.partner.name"
    fieldPath = cause.field;
  } else if (cause.dataSource && cause.path) {
    // New format: combine dataSource and path like "user" + "partner.name"
    fieldPath = `${cause.dataSource}.${cause.path}`;
  } else {
    console.warn('Invalid cause - missing field or path:', cause);
    return false;
  }

  // Get the value from context using the field path
  const fieldParts = fieldPath.split('.');
  let contextValue: any = context;
  
  for (const part of fieldParts) {
    if (contextValue === undefined || contextValue === null) {
      return false;
    }
    contextValue = contextValue[part];
  }

  // Get the comparison value
  const { operator } = cause;
  const value = cause.data?.value ?? cause.value;

  switch (operator) {
    case 'eq':
      return contextValue === value;
    case 'ne':
      // Special handling for null/undefined - treat them as equivalent
      if (value === null || value === undefined) {
        return contextValue !== null && contextValue !== undefined;
      }
      return contextValue !== value;
    case 'gt':
      return contextValue > value;
    case 'gte':
      return contextValue >= value;
    case 'lt':
      return contextValue < value;
    case 'lte':
      return contextValue <= value;
    case 'in':
      return Array.isArray(value) && value.includes(contextValue);
    case 'nin':
      return Array.isArray(value) && !value.includes(contextValue);
    case 'contains':
      if (typeof contextValue === 'string') {
        return contextValue.includes(value);
      }
      if (Array.isArray(contextValue)) {
        return contextValue.includes(value);
      }
      return false;
    default:
      return false;
  }
}

/**
 * Check if a rule's causes match the context
 */
function ruleMatchesContext(rule: Rule, context: TestContext): boolean {
  if (!rule.causes || !Array.isArray(rule.causes) || rule.causes.length === 0) {
    return true; // Rules with no causes always match
  }

  const causes = rule.causes as unknown as Cause[];
  let result = evaluateCause(causes[0], context);

  for (let i = 1; i < causes.length; i++) {
    const cause = causes[i];
    const causeResult = evaluateCause(cause, context);
    
    if (cause.logicalOperator === 'OR') {
      result = result || causeResult;
    } else {
      // Default to AND
      result = result && causeResult;
    }
  }

  return result;
}

interface TabMetadata {
  id: string;
  label: string;
  icon: string;
  visible: boolean;
  position: number;
}

interface FlexFeaturesContextType {
  getTabActionConfig: (tabActionId: string) => any;
  resolveTabIcon: (webScreenKey: string) => string;
  language: string;
}

/**
 * Resolve tab metadata from FlexFeatures context
 */
function resolveTabMetadata(
  tabActionId: string,
  position: number,
  flexFeaturesContext?: FlexFeaturesContextType
): TabMetadata | null {
  if (!flexFeaturesContext) {
    console.warn(`⚠️ FlexFeatures context not available, cannot resolve tab: ${tabActionId}`);
    return null;
  }

  try {
    // Get tab action config (e.g., "madeliaFireSafetyTab")
    const tabConfig = flexFeaturesContext.getTabActionConfig(tabActionId);
    
    if (!tabConfig) {
      console.warn(`⚠️ Tab action not found in FlexFeatures: ${tabActionId}`);
      return null;
    }

    console.log(`✅ Found tab config for ${tabActionId}:`, tabConfig);

    // Get label from locale
    const language = flexFeaturesContext.language || 'en';
    const label = tabConfig.locale?.[language]?.tabItem || 
                  tabConfig.locale?.['en-GB']?.tabItem || 
                  tabActionId;

    // Get webScreenKey from config
    const webScreenKey = tabConfig.config?.webScreenKey;
    
    if (!webScreenKey) {
      console.warn(`⚠️ No webScreenKey found for tab action: ${tabActionId}`);
      return null;
    }

    // Resolve icon URL
    const icon = flexFeaturesContext.resolveTabIcon(webScreenKey);

    console.log(`✅ Resolved tab metadata for ${tabActionId}:`, { label, webScreenKey, icon, position });

    return {
      id: tabActionId,
      label,
      icon,
      visible: true,
      position,
    };
  } catch (error) {
    console.error(`❌ Error resolving tab metadata for ${tabActionId}:`, error);
    return null;
  }
}

/**
 * Helper function to apply filter modifications to item arrays
 */
function applyFilterToItems(
  currentItems: string[], 
  filterItems: Array<{ id: string; show?: boolean; order?: number | null }>
): string[] {
  // Start with current items
  let result = [...currentItems];
  
  // Process each filter item
  filterItems.forEach(filterItem => {
    const itemId = filterItem.id;
    const currentIndex = result.indexOf(itemId);
    
    // Handle show/hide
    if (filterItem.show === false) {
      // Remove item if it exists
      if (currentIndex !== -1) {
        result = result.filter(id => id !== itemId);
      }
    } else if (filterItem.show === true) {
      // Add item if it doesn't exist
      if (currentIndex === -1) {
        result.push(itemId);
      }
    }
    
    // Handle reordering (if order is specified and item is visible)
    if (filterItem.order !== null && filterItem.order !== undefined && filterItem.show !== false) {
      const itemIndex = result.indexOf(itemId);
      if (itemIndex !== -1) {
        // Remove from current position
        result = result.filter(id => id !== itemId);
        // Insert at new position (0-indexed)
        const insertIndex = Math.min(filterItem.order, result.length);
        result.splice(insertIndex, 0, itemId);
      }
    }
  });
  
  return result;
}

/**
 * Apply a single effect to the state
 */
function applyEffect(
  state: AppliedEffectsState, 
  effect: any, 
  currentScreen: string = 'start',
  flexFeaturesContext?: FlexFeaturesContextType
): AppliedEffectsState {
  if (effect.active === false) {
    return state;
  }

  // Filter by screen - only apply if effect is for current screen or global
  const effectScreen = effect.screen || 'start';
  // Allow matching expenses sub-screens (expenses-all, expenses-trackers) when processing the main "expenses" screen
  const matchesScreen =
    effectScreen === currentScreen ||
    effectScreen === 'global' ||
    (currentScreen === 'expenses' && typeof effectScreen === 'string' && effectScreen.startsWith('expenses'));
  if (!matchesScreen) {
    return state;
  }

  // Handle both 'target' and 'element' field names (Supabase uses 'element')
  const target = effect.target || effect.element;
  const section = effect.section;
  const { action, data } = effect;
  const newState = { ...state };

  switch (action) {
    case 'showContent': {
      console.log('  ➡️ showContent:', target, '| items:', data?.value?.length, '| data:', data?.value);
      const isShortcuts = (typeof target === 'string' && (target.startsWith('shortcuts') || target === 'shortcut')) || section === 'shortcuts';
      const isStartPlates = (typeof target === 'string' && (target.startsWith('startPlates') || target === 'startPlate')) || section === 'startPlates' || section === 'startplates';
      const isQuickActions = (target === 'quickActions' || target === 'quickAction') || section === 'quickActions';

      const rawItems = Array.isArray(data?.value) ? data.value : [];
      const items = rawItems.map((item: any) => typeof item === 'string' ? item : item?.id).filter(Boolean);

      if (isShortcuts) {
        newState.shortcuts = items;
        console.log('     ✅ Replaced shortcuts:', items);
      } else if (isStartPlates) {
        newState.startPlates = items;
        console.log('     ✅ Replaced startPlates:', items);
      } else if (isQuickActions) {
        const bucketScreen = currentScreen.startsWith('expenses') ? 'expenses' : currentScreen;
        const screenKey = bucketScreen as keyof typeof newState.quickActions;
        if (screenKey in newState.quickActions) {
          newState.quickActions[screenKey].items = items;
          newState.quickActions[screenKey].visible = true;
          console.log(`     ✅ Replaced quickActions.${screenKey}:`, items);
        }
      }
      break;
    }

    case 'filter': {
      console.log('  ➡️ filter:', target, '| items:', data?.value?.length);
      const isShortcuts = (typeof target === 'string' && (target.startsWith('shortcuts') || target === 'shortcut')) || section === 'shortcuts';
      const isStartPlates = (typeof target === 'string' && (target.startsWith('startPlates') || target === 'startPlate')) || section === 'startPlates' || section === 'startplates';
      const isQuickActions = (target === 'quickActions' || target === 'quickAction') || section === 'quickActions';

      const filterItems = Array.isArray(data?.value) ? data.value : [];

      if (isShortcuts) {
        newState.shortcuts = applyFilterToItems(newState.shortcuts, filterItems);
        console.log('     ✅ Filtered shortcuts:', newState.shortcuts);
      } else if (isStartPlates) {
        newState.startPlates = applyFilterToItems(newState.startPlates, filterItems);
        console.log('     ✅ Filtered startPlates:', newState.startPlates);
      } else if (isQuickActions) {
        const bucketScreen = currentScreen.startsWith('expenses') ? 'expenses' : currentScreen;
        const screenKey = bucketScreen as keyof typeof newState.quickActions;
        if (screenKey in newState.quickActions) {
          newState.quickActions[screenKey].items = applyFilterToItems(
            newState.quickActions[screenKey].items, 
            filterItems
          );
          console.log(`     ✅ Filtered quickActions.${screenKey}:`, newState.quickActions[screenKey].items);
        }
      }
      break;
    }

    case 'display': {
      console.log('  ➡️ display:', target, '| value:', data?.value, '| section:', section);
      // Header toggles: accept "header.field" or section==="header" with element name
      if ((typeof target === 'string' && target.startsWith('header.')) || section === 'header') {
        const headerField = section === 'header' ? String(target) : target.split('.')[1];
        if (headerField && headerField in newState.header) {
          (newState.header as any)[headerField] = data?.value === true;
          console.log('     ✅ Set header.' + headerField + ':', data?.value);
        }
      } else if (target === 'fab' || target === 'fab.button') {
        newState.fab.visible = data?.value === true;
        console.log('     ✅ Set fab.visible:', data?.value);
      } else if (target === 'allActions') {
        // Check specific allActions target BEFORE general quickActions check
        const bucketScreen = currentScreen.startsWith('expenses') ? 'expenses' : currentScreen;
        const screenKey = bucketScreen as keyof typeof newState.quickActions;
        if (screenKey in newState.quickActions) {
          newState.quickActions[screenKey].showAllActions = data?.value === true;
          console.log(`     ✅ Set quickActions.${screenKey}.showAllActions:`, data?.value);
        }
      } else if (target === 'customizeQuickActions') {
        // Check specific customizeQuickActions target BEFORE general quickActions check
        const bucketScreen = currentScreen.startsWith('expenses') ? 'expenses' : currentScreen;
        const screenKey = bucketScreen as keyof typeof newState.quickActions;
        if (screenKey in newState.quickActions) {
          newState.quickActions[screenKey].showCustomize = data?.value === true;
          console.log(`     ✅ Set quickActions.${screenKey}.showCustomize:`, data?.value);
        }
      } else if (target === 'quickActions' || target === 'quickAction' || section === 'quickActions') {
        // General quickActions visibility - checked AFTER specific targets
        const bucketScreen = currentScreen.startsWith('expenses') ? 'expenses' : currentScreen;
        const screenKey = bucketScreen as keyof typeof newState.quickActions;
        if (screenKey in newState.quickActions) {
          newState.quickActions[screenKey].visible = data?.value === true;
          console.log(`     ✅ Set quickActions.${screenKey}.visible:`, data?.value);
        }
      }
      break;
    }

    case 'style': {
      console.log('  ➡️ style:', target, '| section:', section, '| data:', data);
      // Apply styling
      const isQuick = target === 'quickActions' || target === 'quickAction' || section === 'quickActions';
      const isPartnerLogo = target === 'partnerLogo' && section === 'homeImage';
      
      if (isQuick) {
        const layoutValue = (data?.layout ?? data?.value);
        if (typeof layoutValue === 'string') {
          const bucketScreen = currentScreen.startsWith('expenses') ? 'expenses' : currentScreen;
          const screenKey = bucketScreen as keyof typeof newState.quickActions;
          if (screenKey in newState.quickActions) {
            newState.quickActions[screenKey].layout = layoutValue === 'list' ? 'list' : 'grid';
            console.log(`     ✅ Set quickActions.${screenKey}.layout:`, layoutValue);
          }
        }
      } else if (isPartnerLogo) {
        // Handle partnerLogo in homeImage section
        if (data?.type === 'url' && data?.value) {
          newState.homeImage.partnerLogo = data.value;
          console.log('     ✅ Set homeImage.partnerLogo:', data.value);
        }
      } else if (target === 'homeImage') {
        // Handle homeImage styling (partnerLogo, url)
        if (data?.partnerLogo) {
          newState.homeImage.partnerLogo = data.partnerLogo;
        }
        if (data?.url) {
          newState.homeImage.url = data.url;
        }
      } else if (target === 'inventory' && data?.displayType) {
        // Handle inventory display type
        newState.inventory.displayType = data.displayType;
        console.log('     ✅ Set inventory.displayType:', data.displayType);
      }
      break;
    }

    case 'toggle': {
      // Enable/disable features
      if (target === 'fab') {
        newState.fab.visible = data?.value === true;
      } else if (target.startsWith('header.')) {
        const headerField = target.split('.')[1];
        if (headerField in newState.header) {
          (newState.header as any)[headerField] = data?.value === true;
        }
      }
      break;
    }

    case 'replaceTabs': {
      console.log('  ➡️ replaceTabs:', section, '| items:', data?.value?.length);
      
      if (section === 'tabs' && Array.isArray(data?.value)) {
        const tabsToReplace = data.value;
        const newBottomTabs = [...newState.bottomTabs];
        
        for (const tabData of tabsToReplace) {
          const position = tabData.position;
          const tabActionId = tabData.id;
          
          // Protect position 0 (Start tab)
          if (position === 0) {
            console.warn(`⚠️ Cannot replace position 0 (Start tab), skipping: ${tabActionId}`);
            continue;
          }
          
          // If id is null, hide the tab at this position
          if (tabActionId === null) {
            if (position >= 0 && position < newBottomTabs.length) {
              newBottomTabs[position] = {
                ...newBottomTabs[position],
                visible: false
              };
              console.log(`     ✅ Hiding tab at position ${position}:`, newBottomTabs[position].id);
            } else {
              console.warn(`⚠️ Invalid position ${position}, tab array has ${newBottomTabs.length} items`);
            }
            continue;
          }
          
          // Resolve tab metadata for replacement
          const resolvedTab = resolveTabMetadata(tabActionId, position, flexFeaturesContext);
          
          if (!resolvedTab) {
            console.warn(`⚠️ Could not resolve tab metadata for: ${tabActionId} at position ${position}`);
            continue;
          }
          
          // Replace the tab at the specified position
          if (position >= 0 && position < newBottomTabs.length) {
            console.log(`     ✅ Replacing tab at position ${position}:`, {
              old: newBottomTabs[position],
              new: resolvedTab
            });
            newBottomTabs[position] = resolvedTab;
          } else {
            console.warn(`⚠️ Invalid position ${position}, tab array has ${newBottomTabs.length} items`);
          }
        }
        
        newState.bottomTabs = newBottomTabs;
      }
      break;
    }

    default:
      console.warn(`Unknown action type: ${action}`);
  }

  return newState;
}

/**
 * Main function to apply rules and return final state
 */
export async function applyRules(
  selectedRules: Rule[],
  context: TestContext,
  currentScreen: string = 'start',
  includeDefaultEffects: boolean = true,
  defaultEffectsVersionId?: string,
  flexFeaturesContext?: FlexFeaturesContextType,
  language: string = 'en'
): Promise<AppliedEffectsState> {
  // Initialize with empty state
  const createEmptyQuickActionsConfig = (): QuickActionsConfig => ({
    visible: false,
    items: [],
    layout: 'grid',
    showCustomize: false,
    showAllActions: false,
  });

  let state: AppliedEffectsState = {
    header: {
      avatars: false,
      homeInfo: false,
      userSettings: false,
      expandCollapse: false,
      ellipsis: false,
    searchAsk: false,
    search: undefined,
    ask: undefined,
      navDots: false,
      navDotCount: 3,
      activeNavDot: 0,
    },
    homeImage: {},
    shortcuts: [],
    quickActions: {
      start: createEmptyQuickActionsConfig(),
      inventory: createEmptyQuickActionsConfig(),
      expenses: createEmptyQuickActionsConfig(),
      timeline: createEmptyQuickActionsConfig(),
      lists: createEmptyQuickActionsConfig(),
    },
    startPlates: [],
    fab: {
      visible: true, // Default to visible
    },
    bottomTabs: [
      { id: 'start', label: getTabLabel('start', language), icon: 'https://homer-assets.s3.eu-west-1.amazonaws.com/icons_app/key_nav.png', visible: true, position: 0 },
      { id: 'inventory', label: getTabLabel('inventory', language), icon: 'https://homer-assets.s3.eu-west-1.amazonaws.com/icons_app/inventory_nav.png', visible: true, position: 1 },
      { id: 'expenses', label: getTabLabel('expenses', language), icon: 'https://homer-assets.s3.eu-west-1.amazonaws.com/icons_app/expenses_nav.png', visible: true, position: 2 },
      { id: 'timeline', label: getTabLabel('timeline', language), icon: 'https://homer-assets.s3.eu-west-1.amazonaws.com/icons_app/timeline_nav.png', visible: true, position: 3 },
      { id: 'lists', label: getTabLabel('lists', language), icon: 'https://homer-assets.s3.eu-west-1.amazonaws.com/icons_app/tasks_nav.png', visible: true, position: 4 },
    ],
    inventory: {
      displayType: 'list',
    },
  };

  console.log('🔍 Applying rules for screen:', currentScreen);

  // Apply default effects first if enabled (no cause checking needed)
  if (includeDefaultEffects) {
    const defaultEffects = await DefaultEffectsService.getEffects(defaultEffectsVersionId);
    console.log('📋 Applying default effects', defaultEffectsVersionId ? `(version: ${defaultEffectsVersionId})` : '(active version)', ':', defaultEffects.length, 'effects');
    
    for (const effect of defaultEffects) {
      state = applyEffect(state, effect, currentScreen, flexFeaturesContext);
    }
  }

  // Apply selected rules in reverse order (last to first)
  const activeSelectedRules = selectedRules.filter(r => r.active);
  console.log('📋 Processing', activeSelectedRules.length, 'selected rules');
  
  for (let i = activeSelectedRules.length - 1; i >= 0; i--) {
    const rule = activeSelectedRules[i];
    if (ruleMatchesContext(rule, context)) {
      console.log('✅ Rule matched:', rule.name);
      const effects = Array.isArray(rule.effects) ? rule.effects : [];
      console.log('  📦 Applying', effects.length, 'effects');
      for (const effect of effects) {
        state = applyEffect(state, effect, currentScreen, flexFeaturesContext);
      }
    }
  }

  // Handle subtab-specific rules for expenses screen
  if (currentScreen === 'expenses' && context.expensesScreen?.activeSubtab) {
    const subtabRuleName = context.expensesScreen.activeSubtab;
    console.log(`🔍 Looking for subtab-specific rule: ${subtabRuleName}`);
    
    // Find the subtab-specific rule in selected rules only (no default rules anymore)
    const subtabRule = activeSelectedRules.find(
      r => r.name === subtabRuleName && ruleMatchesContext(r, context)
    );
    
    if (subtabRule) {
      console.log(`✅ Applying subtab rule: ${subtabRuleName}`);
      const effects = Array.isArray(subtabRule.effects) ? subtabRule.effects : [];
      console.log('  📦 Applying', effects.length, 'subtab effects');
      for (const effect of effects) {
        // Pass subtab name as screen so effects with screen: 'expenses-all' match correctly
        state = applyEffect(state, effect, subtabRuleName, flexFeaturesContext);
      }
    }
  }

  console.log('🎯 Final state for screen', currentScreen, ':', {
    shortcuts: state.shortcuts.length,
    startPlates: state.startPlates.length,
    quickActions: state.quickActions[currentScreen as keyof typeof state.quickActions]?.items.length || 0,
    header: state.header,
  });

  return state;
}
