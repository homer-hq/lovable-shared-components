import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ActionData {
  id: string;
  icon: string;
  title: string;
  shortName?: string;
  description: string;
  platforms?: string[];
  deeplink?: string;
  [key: string]: any;
}

interface RawActionData {
  id: string;
  icon?: string;
  remoteIcon?: string;
  title: Record<string, string> | string;
  shortName?: Record<string, string> | string;
  description: Record<string, string> | string;
  platforms?: string[];
  deeplink?: string;
  [key: string]: any;
}

interface ActionsContextType {
  actions: Record<string, ActionData>;
  loading: boolean;
  error: string | null;
  currentLanguage: string;
  refetchActions: () => Promise<void>;
  getActionById: (id: string) => ActionData | null;
  setLanguage: (language: string) => void;
  availableLanguages: string[];
}

const ActionsContext = createContext<ActionsContextType | undefined>(undefined);

const ACTIONS_CACHE_KEY = 'homer_actions_cache_v3';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

interface CachedData {
  data: Record<string, ActionData>;
  rawActions: RawActionData[];
  availableLanguages: string[];
  timestamp: number;
}

export function ActionsProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<Record<string, ActionData>>({});
  const [rawActions, setRawActions] = useState<RawActionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(['en']);

  const fetchActions = async (forceRefetch = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first if not force refetching
      if (!forceRefetch) {
        const cached = localStorage.getItem(ACTIONS_CACHE_KEY);
        if (cached) {
          const cachedData: CachedData = JSON.parse(cached);
          const now = Date.now();
          if (now - cachedData.timestamp < CACHE_TTL) {
            setActions(cachedData.data);
            setRawActions(cachedData.rawActions || []);
            setAvailableLanguages(cachedData.availableLanguages || ['en']);
            setLoading(false);
            return;
          }
        }
      }

      const response = await fetch('https://homer-assets.s3.eu-west-1.amazonaws.com/flex/actions.json');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch actions: ${response.status}`);
      }

      const rawData: RawActionData[] = await response.json();
      setRawActions(rawData);
      
      // Extract available languages
      const languages = new Set<string>(['en']);
      rawData.forEach((action) => {
        if (typeof action.title === 'object' && action.title) {
          Object.keys(action.title).forEach(lang => languages.add(lang));
        }
        if (typeof action.shortName === 'object' && action.shortName) {
          Object.keys(action.shortName).forEach(lang => languages.add(lang));
        }
        if (typeof action.description === 'object' && action.description) {
          Object.keys(action.description).forEach(lang => languages.add(lang));
        }
      });
      const sortedLanguages = Array.from(languages).sort();
      console.log('🌍 Available languages detected:', sortedLanguages);
      setAvailableLanguages(sortedLanguages);
      
      // Transform data with current language
      const transformedData = transformActionsData(rawData, currentLanguage);
      
      // Cache the transformed data
      const cacheData: CachedData = {
        data: transformedData,
        rawActions: rawData,
        availableLanguages: sortedLanguages,
        timestamp: Date.now()
      };
      localStorage.setItem(ACTIONS_CACHE_KEY, JSON.stringify(cacheData));

      setActions(transformedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch actions';
      setError(errorMessage);
      
      // Try to use cached data as fallback
      const cached = localStorage.getItem(ACTIONS_CACHE_KEY);
      if (cached) {
        try {
          const cachedData: CachedData = JSON.parse(cached);
          setActions(cachedData.data);
          setRawActions(cachedData.rawActions || []);
          setAvailableLanguages(cachedData.availableLanguages || ['en']);
        } catch {
          // Ignore cache parse errors
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const refetchActions = async () => {
    await fetchActions(true);
  };

  const transformActionsData = (rawData: RawActionData[], language: string): Record<string, ActionData> => {
    const transformedData: Record<string, ActionData> = {};
    rawData.forEach((action) => {
      transformedData[action.id] = {
        ...action,
        // Prefer remoteIcon URL when available, fallback to named icon or default
        icon: action.remoteIcon && action.remoteIcon.length > 0
          ? action.remoteIcon
          : (action.icon
              ? (action.icon.startsWith('http')
                  ? action.icon
                  : `https://homer-assets.s3.eu-west-1.amazonaws.com/icons_app/${action.icon}.png`)
              : 'https://homer-assets.s3.eu-west-1.amazonaws.com/icons_app/default.png'),
        // Extract text for the selected language or fallback
        title: typeof action.title === 'string' 
          ? action.title 
          : action.title?.[language] || action.title?.en || action.title?.[Object.keys(action.title)[0]] || action.id,
        shortName: typeof action.shortName === 'string'
          ? action.shortName
          : action.shortName?.[language] || action.shortName?.en || action.shortName?.[Object.keys(action.shortName || {})[0]] || undefined,
        description: typeof action.description === 'string' 
          ? action.description 
          : action.description?.[language] || action.description?.en || action.description?.[Object.keys(action.description)[0]] || 'No description available'
      };
    });
    return transformedData;
  };

  const setLanguage = (language: string) => {
    setCurrentLanguage(language);
    if (rawActions.length > 0) {
      const transformedData = transformActionsData(rawActions, language);
      setActions(transformedData);
    }
  };

  const getActionById = (id: string): ActionData | null => {
    return actions[id] || null;
  };

  useEffect(() => {
    fetchActions();
  }, []);

  return (
    <ActionsContext.Provider 
      value={{ 
        actions, 
        loading, 
        error, 
        currentLanguage,
        availableLanguages,
        refetchActions, 
        getActionById,
        setLanguage
      }}
    >
      {children}
    </ActionsContext.Provider>
  );
}

export function useActions() {
  const context = useContext(ActionsContext);
  if (context === undefined) {
    throw new Error('useActions must be used within an ActionsProvider');
  }
  return context;
}