import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import i18n from '@/i18n/config';
import { getPartnerLanguage } from '@/i18n/utils';

interface PartnerConfig {
  id: string;
  partnerCode: string;
  partnerDisplayName: string;
  faqLink: string | null;
  faqTextUrl: string | null;
  partnerLogo: {
    logoBig: string | null;
    headerLogo: string | null;
    supportIcon: string | null;
  };
  partnerAccentColor: string;
  favicon: string | null;
  typeface: string;
  primaryContactId: string | null;
}

interface PartnerContextType {
  partner: PartnerConfig | null;
  isLoading: boolean;
}

const PartnerContext = createContext<PartnerContextType | undefined>(undefined);

export const usePartner = () => {
  const context = useContext(PartnerContext);
  if (!context) {
    throw new Error('usePartner must be used within a PartnerProvider');
  }
  return context;
};

// Helper function to extract subdomain from URL
function extractSubdomain(): string | null {
  if (typeof window === 'undefined') return null;
  
  const hostname = window.location.hostname;
  
  // Skip localhost and IP addresses
  if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return null;
  }
  
  // Extract subdomain (first part before first dot)
  // Example: intressantahus.lovable.app -> "intressantahus"
  const parts = hostname.split('.');
  if (parts.length > 2) {
    return parts[0];
  }
  
  return null;
}

export const PartnerProvider = ({ children }: { children: ReactNode }) => {
  const [partner, setPartner] = useState<PartnerConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPartner = async () => {
      try {
        const subdomain = extractSubdomain();
        const fallbackPartnerCode = 'intressantahus-se';
        
        console.log('🏢 Partner detection:', { subdomain, fallbackPartnerCode });

        let data = null;

        // Stage 1: Check if user is logged in and has a partner association
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          console.log('👤 Checking partner association for user:', user.id);
          const { data: userRoleData, error: userRoleError } = await supabase
            .from('user_roles')
            .select('partner_id, partners(*)')
            .eq('user_id', user.id)
            .not('partner_id', 'is', null)
            .maybeSingle();

          if (userRoleError) {
            console.error('Error fetching user role:', userRoleError);
          } else if (userRoleData?.partners) {
            console.log('✅ Partner loaded from user association:', userRoleData.partners.partner_code);
            data = userRoleData.partners;
          }
        }

        // Stage 2: Try loading by subdomain if no user partner found
        if (!data && subdomain) {
          const { data: subdomainData, error: subdomainError } = await supabase
            .from('partners')
            .select('*')
            .eq('is_active', true)
            .eq('subdomain', subdomain)
            .maybeSingle();

          if (subdomainError) throw subdomainError;
          
          if (subdomainData) {
            console.log('✅ Partner loaded by subdomain:', subdomainData.partner_code);
            data = subdomainData;
          } else {
            console.log('⚠️ No partner found for subdomain, using fallback');
          }
        }

        // Stage 3: Fall back to partner_code if subdomain didn't match
        if (!data) {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('partners')
            .select('*')
            .eq('is_active', true)
            .eq('partner_code', fallbackPartnerCode)
            .maybeSingle();

          if (fallbackError) throw fallbackError;
          
          if (fallbackData) {
            console.log('✅ Partner loaded by fallback code:', fallbackData.partner_code);
            data = fallbackData;
          }
        }

        if (data) {
          const partnerConfig: PartnerConfig = {
            id: data.id,
            partnerCode: data.partner_code,
            partnerDisplayName: data.partner_display_name,
            faqLink: data.faq_link,
            faqTextUrl: data.faq_text_url,
            partnerLogo: {
              logoBig: data.logo_big,
              headerLogo: data.logo_header,
              supportIcon: data.logo_support_icon,
            },
            partnerAccentColor: data.accent_color,
            favicon: data.favicon,
            typeface: data.typeface,
            primaryContactId: data.primary_contact_id,
          };
          
          setPartner(partnerConfig);
          
          // Set language based on partner country code
          const language = getPartnerLanguage(data.partner_code);
          console.log('🌐 Setting language based on partner:', { 
            partnerCode: data.partner_code, 
            language 
          });
          
          i18n.changeLanguage(language);
          localStorage.setItem('appLanguage', language);
        } else {
          console.error('❌ No partner could be loaded (subdomain or fallback)');
        }
      } catch (error) {
        console.error('Error loading partner config:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Load partner initially
    loadPartner();

    // Reload partner when auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      console.log('🔄 Auth state changed, reloading partner...');
      loadPartner();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Update favicon when partner changes
  useEffect(() => {
    if (partner?.favicon) {
      let faviconLink = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        faviconLink.type = 'image/png';
        document.head.appendChild(faviconLink);
      }
      
      faviconLink.href = partner.favicon;
      console.log('🎨 Favicon updated for partner:', partner.partnerCode, partner.favicon);
    }
  }, [partner?.favicon]);

  return (
    <PartnerContext.Provider value={{ partner, isLoading }}>
      {children}
    </PartnerContext.Provider>
  );
};
