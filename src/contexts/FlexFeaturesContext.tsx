import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FlexFeature {
  type?: string;
  config?: {
    webScreenKey?: string;
    [key: string]: any;
  };
  locale?: {
    [language: string]: {
      tabItem?: string;
      [key: string]: any;
    };
  };
  [key: string]: any;
}

interface FlexFeaturesData {
  [key: string]: FlexFeature;
}

interface FlexFeaturesContextType {
  flexFeatures: FlexFeaturesData | null;
  loading: boolean;
  error: string | null;
  language: string;
  setLanguage: (lang: string) => void;
  getTabActionConfig: (tabActionId: string) => FlexFeature | null;
  getWebScreenConfig: (webScreenKey: string) => FlexFeature | null;
  resolveTabIcon: (webScreenKey: string) => string;
  refetchFlexFeatures: () => Promise<void>;
}

const FlexFeaturesContext = createContext<FlexFeaturesContextType | undefined>(undefined);

const FLEX_FEATURES_URL = 'https://homer-assets.s3.eu-west-1.amazonaws.com/flex/flexFeatures.json';
const CACHE_KEY = 'homer_flex_features_cache';
const CACHE_TIMESTAMP_KEY = 'homer_flex_features_timestamp';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

interface FlexFeaturesProviderProps {
  children: ReactNode;
}

export const FlexFeaturesProvider = ({ children }: FlexFeaturesProviderProps) => {
  const [flexFeatures, setFlexFeatures] = useState<FlexFeaturesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState('en');

  const fetchFlexFeatures = async (bypassCache = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first (unless bypassing)
      if (!bypassCache) {
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

        if (cachedData && cachedTimestamp) {
          const age = Date.now() - parseInt(cachedTimestamp);
          if (age < CACHE_DURATION) {
            console.log('✅ Using cached FlexFeatures data');
            setFlexFeatures(JSON.parse(cachedData));
            setLoading(false);
            return;
          }
        }
      }

      // Fetch fresh data
      console.log('🔄 Fetching FlexFeatures from server...');
      const response = await fetch(FLEX_FEATURES_URL);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch FlexFeatures: ${response.status}`);
      }

      const data: FlexFeaturesData = await response.json();

      // Cache the data
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());

      setFlexFeatures(data);
      console.log('✅ FlexFeatures loaded successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Error loading FlexFeatures:', errorMessage);
      setError(errorMessage);
      
      // Try to use cached data as fallback
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        console.log('⚠️ Using stale cached data as fallback');
        setFlexFeatures(JSON.parse(cachedData));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlexFeatures();
  }, []);

  const refetchFlexFeatures = async () => {
    await fetchFlexFeatures(true);
  };

  const getTabActionConfig = (tabActionId: string): FlexFeature | null => {
    if (!flexFeatures) return null;
    const tabItem = (flexFeatures as any).tabItem;
    if (!tabItem) {
      console.warn('⚠️ No tabItem section found in FlexFeatures');
      return null;
    }
    return tabItem[tabActionId] || null;
  };

  const getWebScreenConfig = (webScreenKey: string): FlexFeature | null => {
    if (!flexFeatures) return null;
    const webScreen = (flexFeatures as any).webScreen;
    if (!webScreen) {
      console.warn('⚠️ No webScreen section found in FlexFeatures');
      return null;
    }
    return webScreen[webScreenKey] || null;
  };

  const resolveTabIcon = (webScreenKey: string): string => {
    return `https://homer-assets.s3.eu-west-1.amazonaws.com/icons_app/${webScreenKey}_nav.png`;
  };

  const value: FlexFeaturesContextType = {
    flexFeatures,
    loading,
    error,
    language,
    setLanguage,
    getTabActionConfig,
    getWebScreenConfig,
    resolveTabIcon,
    refetchFlexFeatures,
  };

  return (
    <FlexFeaturesContext.Provider value={value}>
      {children}
    </FlexFeaturesContext.Provider>
  );
};

export const useFlexFeatures = (): FlexFeaturesContextType => {
  const context = useContext(FlexFeaturesContext);
  if (context === undefined) {
    throw new Error('useFlexFeatures must be used within a FlexFeaturesProvider');
  }
  return context;
};
