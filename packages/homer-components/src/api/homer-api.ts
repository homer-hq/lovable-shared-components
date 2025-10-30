// Homer API Client - GraphQL Interface for Home Management Co-pilot

// Configure API URLs for staging environment
const HOMER_API_URL = 'https://staging-core.homer.co/graphql';
const HOMER_FILES_API_URL = 'https://staging-files.homer.co/graphql';

export interface HomerPartner {
  id: string;
  name: string; // Partner code in format: "partnername-countrycode" (e.g., "intressantahus-se")
  assignedAt?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  token: string;
  language: { id: string; label: string };
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  image?: { id: string; url: string } | null;
  createdAt: string;
  homesCount: number;
  cardsCount?: number;
  role: string;
  homes?: Home[];
  partner?: HomerPartner; // Primary partner assignment
  partners?: HomerPartner[]; // All partner assignments
}

export interface Home {
  id: string;
  title: string;
  type?: string;
  ownershipType?: string;
  ownershipTiming?: string;
  createdAt: string;
  updatedAt: string;
  cards?: { id: string }[];
  image?: { id: string; url: string; tinyUrl: string };
  tags?: { id: string; title: string; order: number }[];
  users?: Array<{
    id: string;
    email?: string;
    homeRole?: string;
    partner?: HomerPartner;   // Single partner assignment
    partners?: HomerPartner[]; // Array of partner assignments
  }>;
  language?: { id: string; label: string };
}

export interface Card {
  id: string;
  title: string;
  subtitle?: string;
  home: string;
  read: boolean;
  unreadPions: number;
  updatedAt: string;
  createdAt?: string;
  pions: Pion[];
  actionPionsCount?: number;
  image?: {
    id: string;
    url: string;
    tinyUrl: string;
    smallUrl: string;
    mediumUrl: string;
    largeUrl: string;
    width: number;
    height: number;
  };
  headerImage?: {
    id: string;
    url: string;
    tinyUrl: string;
    smallUrl: string;
    mediumUrl: string;
    largeUrl: string;
  };
  tags: Tag[];
}

export interface Tag {
  id: string;
  title: string;
}

export interface Pion {
  id: string;
  type: PionType;
  card: string;
  read: boolean;
  autoCreated: boolean;
  home: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  title?: string;
  content?: string;
  url?: string;
  brand?: string;
  model?: string;
  photos?: Photo[];
  file?: HomerFile;
  payload?: any;
}

// Enhanced detailed pion interfaces with full payload data
export interface DetailedPion extends Pion {
  payload: any;
}

export interface BrandPion extends DetailedPion {
  type: 'brand';
  title: string;
  brand: string;
  model: string;
  productInfo: any;
  productPhoto?: {
    id: string;
    url: string;
    largeUrl: string;
    tinyUrl: string;
    status: string;
    payload: any;
  };
}

export interface PhotoPion extends DetailedPion {
  type: 'photo';
  title: string;
  photos: Photo[];
}

export interface PDFPion extends DetailedPion {
  type: 'pdf';
  title: string;
  documentName: string;
  file: HomerFile & {
    pages: number;
  };
}

export interface NotePion extends DetailedPion {
  type: 'note';
  title: string;
  content: string;
  richContent?: string;
  files?: HomerFile[];
}

export interface TimelinePion extends DetailedPion {
  type: 'timeline';
  title: string;
  eventTitle: string;
  eventType?: string;
  startDate: string;
  endDate?: string;
  timeGranularity?: string;
  timelineDescription?: string;
  showOnTimeline: boolean;
  cardTitle?: string;
}

export interface ReceiptPion extends DetailedPion {
  type: 'receipt';
  title: string;
  status: string;
  pages: { url: string }[];
}

export interface ARNotePion extends DetailedPion {
  type: 'note'; // AR notes are a special type of note
  title: string;
  scene: {
    id: string;
    home: string;
    size: number;
    mime: string;
    md5: string;
    name: string;
    url: string;
    notes: {
      pointerAnchorId: string;
      noteAnchorId: string;
      caption: string;
      description: string;
      image: {
        url: string;
        tinyUrl: string;
        smallUrl: string;
      };
    }[];
  };
}

// Crow-related interfaces
export interface CrowList {
  id: string;
  title?: string;
  home: {
    id: string;
    title: string;
  };
  owner: { id: string; email: string };
  tasks?: CrowTask[];
  createdAt: string;
  updatedAt: string;
}

export interface Crow {
  id: string;
  type: string; // 'task', 'item', etc.
  home: { id: string; title: string };
  owner: { id: string; email: string };
  cards?: { id: string; title: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface CrowTask extends Crow {
  type: 'task';
  title: string;
  description?: string;
  tasksList?: string;
  prevTask?: string;
  dueDate?: string;
  done: boolean;
}

export interface CrowItem extends Crow {
  type: 'item';
  title: string;
  crowList?: string;
  sourceId?: string;
  amount?: number;
  category?: string;
}

export type PionType = 
  | 'photo' 
  | 'pdf' 
  | 'receipt' 
  | 'note' 
  | 'url' 
  | 'youtube' 
  | 'brand' 
  | 'typeplate'
  | 'typePlate'
  | 'timeline'
  | 'action'
  | 'card';

export interface Photo {
  id: string;
  url: string;
  tinyUrl: string;
  smallUrl: string;
  mediumUrl: string;
  largeUrl: string;
  caption?: string;
  description?: string;
  width?: number;
  height?: number;
}

export interface HomerFile {
  id: string;
  name?: string;
  url: string;
  tinyUrl?: string;
  smallUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
  pages?: number;
  payload?: any;
}

export interface Activity {
  count: number;
  items: {
    todo: { count: number; items: any[] };
    new: { count: number; items: any[] };
    tips: { count: number; items: any[]; readItems: any[] };
    inbox: { count: number; items: any[] };
  };
}

export interface SearchResults {
  stats: string;
  allCardsCount: number;
  allTagsCount: number;
  allPionsCount: number;
  allFilesCount: number;
  cards: Card[];
  tags: Tag[];
  pions: Pion[];
  files: HomerFile[];
}

class HomerAPIClient {
  private apiUrl: string;
  private filesApiUrl: string;
  private sessionId: string;

  constructor(apiUrl: string = HOMER_API_URL, filesApiUrl: string = HOMER_FILES_API_URL) {
    this.apiUrl = apiUrl;
    this.filesApiUrl = filesApiUrl;
    this.sessionId = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  private get token(): string | null {
    return localStorage.getItem('homer_token');
  }

  setToken(token: string) {
    localStorage.setItem('homer_token', token);
  }

  clearToken() {
    localStorage.removeItem('homer_token');
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getTokenSuffix(): string | null {
    return this.token ? this.token.slice(-6) : null;
  }

  private async request(query: string, variables?: Record<string, any>): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Language': 'en',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    headers['X-Homer-Session-Id'] = this.sessionId;

    let lastError: any = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({ query, variables }),
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403 || response.status >= 500) {
            lastError = new Error(`HTTP ${response.status}`);
            await new Promise((r) => setTimeout(r, attempt === 1 ? 200 : attempt === 2 ? 500 : 1000));
            continue;
          }
          // For 400 errors, capture the full response body for debugging
          const errorBody = await response.text();
          console.error('HTTP 400 Error Details:', {
            status: response.status,
            body: errorBody,
            query: query.substring(0, 200),
            variables: variables
          });
          throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
        }

        const result = await response.json();
        if (result.errors) {
          const msg: string = result.errors[0]?.message || 'GraphQL error';
          if (/unauthorized|token|auth/i.test(msg) && attempt < 3) {
            lastError = new Error(msg);
            await new Promise((r) => setTimeout(r, attempt === 1 ? 200 : 500));
            continue;
          }
          throw new Error(msg);
        }

        return result.data;
      } catch (err) {
        lastError = err;
        await new Promise((r) => setTimeout(r, attempt === 1 ? 200 : attempt === 2 ? 500 : 1000));
        continue;
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  // Authentication
  async login(email: string, password: string): Promise<User> {
    const query = `
      mutation LoginUser($email: String, $password: String) {
        user: loginUser(email: $email, password: $password) {
          id, email, firstName, lastName, token,
          language { id, label },
          acceptTerms, acceptPrivacy,
          image { id, url },
          createdAt, homesCount, role
        }
      }
    `;
    const data = await this.request(query, { email, password });
    
    console.log('🔐 Setting token from login response:', data.user.token);
    this.setToken(data.user.token);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('✅ Token set, current token:', this.token);
    return data.user;
  }

  async loginUserVerification(): Promise<{ id: string; email: string }> {
    const query = `
      mutation Mutations {
        loginUserVerification { id, email }
      }
    `;
    const data = await this.request(query);
    return data.loginUserVerification;
  }

  async register(email: string, firstName: string, lastName: string, password: string): Promise<User> {
    const query = `
      mutation CreateUser($email: String, $firstName: String, $lastName: String, $password: String) {
        createUser(email: $email, firstName: $firstName, lastName: $lastName, password: $password) {
          email, firstName, lastName, token,
          language { label }
        }
      }
    `;
    const data = await this.request(query, { email, firstName, lastName, password });
    this.setToken(data.createUser.token);
    return data.createUser;
  }

  async logout(): Promise<void> {
    const query = `
      mutation LogoutUser {
        logoutUser { id, email, token }
      }
    `;
    await this.request(query);
    this.clearToken();
  }

  async getUser(): Promise<User> {
    const query = `
      query GetUser {
        user {
          id, firstName, lastName, email, token, acceptPrivacy,
          cardsCount, role,
          language { id, label },
          image { id, url },
          homes { id, title, createdAt, updatedAt }
        }
      }
    `;
    const data = await this.request(query);
    return data.user;
  }

  async getUserBasic(): Promise<{ id: string; email: string; homes: { id: string; title: string }[] }> {
    const query = `
      query GetUserBasic {
        user {
          id
          email
          homes { id, title }
        }
      }
    `;
    const data = await this.request(query);
    return data.user;
  }

  // Homes
  async getHomes(): Promise<Home[]> {
    console.log('🏠 Getting homes, current token:', this.token ? 'Token present' : 'No token');
    
    const query = `
      query GetHomes {
        homes {
          id,
          title,
          type,
          ownershipType,
          ownershipTiming,
          cards { id },
          image { id, url, tinyUrl },
          tags { id, title, order },
          users {
            id,
            email,
            homeRole,
            partner { id, name, assignedAt },
            partners { id, name, assignedAt }
          },
          language { id, label },
          createdAt,
          updatedAt
        }
      }
    `;
    
    const data = await this.request(query);
    console.log('✅ Homes data received:', data.homes);
    return data.homes;
  }

  async getHome(homeId: string): Promise<Home> {
    const query = `
      query GetHome($id: ID!) {
        home(id: $id) {
          id,
          title,
          type,
          ownershipType,
          ownershipTiming,
          users {
            id,
            email,
            homeRole,
            partner { id, name, assignedAt },
            partners { id, name, assignedAt }
          },
          createdAt,
          updatedAt
        }
      }
    `;
    const data = await this.request(query, { id: homeId });
    return data.home;
  }

  // Simple cards query - get cards for a home with tags (based on Postman collection)
  async getCardsWithTags(homeId: string): Promise<Card[]> {
    const query = `
      query Queries($homeId: ID) {
        cards(homeId: $homeId) {
          items {
            id,
            title,
            subtitle,
            home,
            read,
            unreadPions,
            updatedAt,
            pions { 
              id, 
              type, 
              __typename,
              ... on BrandPion { brand, model }
            },
            tags { id, title }
          }
        }
      }
    `;
    const data = await this.request(query, { homeId });
    // Fill in missing fields for Card interface
    return data.cards.items.map((card: any) => ({
      ...card,
      createdAt: card.updatedAt, // fallback
      actionPionsCount: 0,
      tags: card.tags || []
    }));
  }

  // Get card details with resilient fallbacks
  async getCardDetails(homeId: string, cardId: string): Promise<Card | null> {
    // 1) Try direct card query by id (best quality data)
    try {
      const query = `
        query GetCard($id: ID!) {
          card(id: $id) {
            id, title, subtitle, home, read, unreadPions, updatedAt, createdAt,
            image { url, tinyUrl, smallUrl, mediumUrl },
            headerImage { url, tinyUrl, smallUrl, mediumUrl },
            tags { id, title },
            pions {
              id, type, __typename, card, read, autoCreated, home, payload,
              createdBy { id, firstName, lastName, email, role }
              ... on PhotoPion { title, photos { id, caption, description, url, tinyUrl, smallUrl, mediumUrl, largeUrl } }
              ... on PDFPion { 
                title, 
                documentName, 
                file { 
                  id, 
                  name, 
                  pages, 
                  url, 
                  tinyUrl, 
                  smallUrl, 
                  mediumUrl, 
                  largeUrl 
                } 
              }
              ... on BrandPion { title, brand, model }
              ... on TypePlatePion { title, photo { id, caption, description, url, tinyUrl, smallUrl, mediumUrl, largeUrl } }
              ... on NotePion { 
                title, 
                content, 
                files { 
                  id, 
                  name,
                  url, 
                  tinyUrl, 
                  smallUrl, 
                  mediumUrl, 
                  largeUrl 
                } 
              }
              ... on UrlPion { url, title }
              ... on YouTubePion { url, title }
              ... on TimelinePion {
                title,
                eventTitle,
                eventType,
                timelineDescription: description,
                startDate,
                endDate,
                timeGranularity,
                showOnTimeline,
                cardTitle
              }
              ... on CardPion { cardReference { id, title } }
            }
          }
        }
      `;
      const data = await this.request(query, { id: cardId });
      if (data?.card) {
        return data.card as Card;
      }
    } catch (e) {
      console.warn('Direct card(id) query failed, falling back:', e);
    }

    // 2) Fallback to search endpoint (provides detailed pions when available)
    try {
      const searchResults = await this.search(homeId, '', 'all', 200);
      const card = searchResults.cards?.find((c: Card) => c.id === cardId);
      const cardPions = searchResults.pions?.filter((p: Pion) => p.card === cardId) || [];
      if (card) {
        return { ...card, pions: cardPions } as Card;
      }
    } catch (e) {
      console.warn('Search fallback failed, falling back to cards list:', e);
    }

    // 3) Last resort: use cards list (shallow pions), but do NOT throw
    try {
      const cards = await this.getCardsWithTags(homeId);
      const found = cards.find((c) => c.id === cardId);
      if (found) {
        return { ...found, pions: found.pions || [], tags: found.tags || [] } as Card;
      }
    } catch (e) {
      console.warn('Cards list fallback failed:', e);
    }

    // If absolutely not found, return null to let UI handle gracefully
    return null;
  }

  // Simple card query (based on API docs)
  async getCard(cardId: string): Promise<{ 
    id: string; 
    title: string; 
    headerImage?: {
      id: string;
      url: string;
      tinyUrl: string;
      smallUrl: string;
      mediumUrl: string;
      largeUrl: string;
    };
    image?: {
      id: string;
      url: string;
      tinyUrl: string;
      smallUrl: string;
      mediumUrl: string;
      largeUrl: string;
      width: number;
      height: number;
    };
  } | null> {
    const query = `
      query Queries($id: ID) {
        card(id: $id) {
          id,
          title,
          headerImage {
            id,
            url,
            tinyUrl,
            smallUrl,
            mediumUrl,
            largeUrl
          }
          image {
            id,
            url,
            tinyUrl,
            smallUrl,
            mediumUrl,
            largeUrl,
            width,
            height
          }
        }
      }
    `;
    
    try {
      const data = await this.request(query, { id: cardId });
      return data?.card || null;
    } catch (error) {
      console.error('Failed to fetch card:', error);
      return null;
    }
  }

  // Get detailed pion data including payload and type-specific fields
  async getPion(pionId: string): Promise<DetailedPion | null> {
    const query = `
      query Queries($id: ID) {
        pion(id: $id) {
          id,
          card,
          type,
          payload,
          ... on BrandPion {
            title,
            brand,
            model,
            productInfo,
            productPhoto {
              id,
              url,
              largeUrl,
              tinyUrl,
              status,
              payload,
            }
          }
          ... on NotePion {
            title,
            content,
            richContent,
            files {
              id,
              url,
              tinyUrl,
              smallUrl,
              mediumUrl,
              largeUrl
            }
          }
          ... on PhotoPion {
            title,
            photos {
              id,
              url,
              tinyUrl,
              smallUrl,
              mediumUrl,
              largeUrl,
              caption,
              description
            }
          }
          ... on PDFPion {
            title,
            documentName,
            file {
              id, pages, url, tinyUrl, smallUrl, mediumUrl, largeUrl 
            }
          }
          ... on ReceiptPion {
            title,
            status,
            pages { url }
          }
          ... on ARNotePion {
            title,
            scene {
              id,
              home,
              size,
              mime,
              md5,
              name,
              url,
              notes {
                pointerAnchorId,
                noteAnchorId,
                caption,
                description,
                image {
                  url,
                  tinyUrl,
                  smallUrl
                }
              }
            }
          }
          ... on CardPion {
            cardReference { id, title }
          }
        }
      }
    `;
    
    try {
      const data = await this.request(query, { id: pionId });
      if (data?.pion) {
        return data.pion as DetailedPion;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch pion details:', error);
      return null;
    }
  }

  // Tag management - updates the complete tags array for a card
  async updateCardTags(homeId: string, cardId: string, tagIds: string[]): Promise<{ id: string; tags: Tag[] } | null> {
    const query = `
      mutation UpdateCardTags($home: ID, $id: ID, $tags: JSON) {
        updateCard(home: $home, id: $id, tags: $tags) {
          id,
          tags { id, title }
        }
      }
    `;
    try {
      const data = await this.request(query, { home: homeId, id: cardId, tags: tagIds });
      return data.updateCard;
    } catch (error) {
      console.error('Failed to update card tags:', error);
      return null;
    }
  }

  // File upload to files host using UploadType
  async uploadFile(file: any): Promise<{ id: string; url: string }> {
    console.log('uploadFile called with:', file);
    
    if (!file) {
      throw new Error('File is required for upload');
    }
    
    if (typeof file !== 'object' || !file.name || typeof file.size !== 'number') {
      console.error('Invalid file object:', file);
      throw new Error('Parameter must be a valid File object');
    }
    
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    const formData = new FormData();
    
    // Use UploadType approach per Homer API spec
    const operations = JSON.stringify({
      query: `
        mutation Mutations($upload: UploadType) {
          createFile(upload: $upload) {
            id
            url
          }
        }
      `,
      variables: {}
    });
    
    formData.append('operations', operations);
    formData.append('variables.upload', file, file.name);
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    headers['X-Homer-Session-Id'] = this.sessionId;
    
    try {
      const response = await fetch(this.filesApiUrl, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`File upload failed: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'File upload error');
      }
      
      return result.data.createFile;
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw error;
    }
  }
  
  // Create PDF pion
  async createPDFPion(homeId: string, cardId: string, fileId: string, title: string): Promise<Pion> {
    const query = `
      mutation CreatePion($card: ID, $type: PionTypes, $payload: JSON) {
        createPion(card: $card, type: $type, payload: $payload) {
          id
          card
          type
          payload
          ... on PDFPion {
            title
            file {
              id
              pages
              url
              tinyUrl
              smallUrl
              mediumUrl
              largeUrl
              payload
            }
          }
        }
      }
    `;
    
    const payload = {
      file: fileId
    };
    
    try {
      console.log('Creating PDF pion with params:', {
        cardId,
        type: 'pdf',
        payload,
        fileId
      });
      
      const data = await this.request(query, {
        card: cardId,
        type: 'pdf',
        payload: payload
      });
      
      console.log('PDF pion created successfully:', data.createPion);
      return data.createPion;
    } catch (error) {
      console.error('Failed to create PDF pion - Full error details:', {
        error,
        cardId,
        fileId,
        payload
      });
      throw error;
    }
  }

  // Create Timeline Pion
  async createTimelinePion(
    params: {
      homeId: string;
      cardId?: string | null;
      title: string;
      eventTitle: string;
      startDate: string;
      description: string;
      eventType?: string;
      endDate?: string;
    }
  ): Promise<Pion> {
    const query = `
      mutation CreatePion($card: ID, $home: ID, $type: PionTypes, $payload: JSON) {
        createPion(card: $card, home: $home, type: $type, payload: $payload) {
          id
          card
          home
          type
          payload
          ... on TimelinePion {
            title
            eventTitle
            startDate
            endDate
            eventType
            description
            showOnTimeline
            timeGranularity
            cardTitle
          }
        }
      }
    `;
    
    const payload: any = {
      title: params.title,
      eventTitle: params.eventTitle,
      startDate: params.startDate,
      description: params.description.substring(0, 500), // Truncate to 500 chars
      showOnTimeline: true,
      timeGranularity: 'date'
    };

    // Add optional fields
    if (params.eventType) {
      payload.eventType = params.eventType;
    }
    if (params.endDate) {
      payload.endDate = params.endDate;
    }
    
    try {
      const variables: any = {
        type: 'timeline',
        payload
      };

      // Either attach to card or create standalone for home
      if (params.cardId) {
        variables.card = params.cardId;
      } else {
        variables.home = params.homeId;
      }

      const data = await this.request(query, variables);
      return data.createPion;
    } catch (error) {
      console.error('Failed to create timeline pion:', error);
      throw error;
    }
  }

  // Update Timeline Pion
  async updateTimelinePion(
    pionId: string,
    updates: {
      eventTitle?: string;
      startDate?: string;
      endDate?: string;
      description?: string;
      eventType?: string;
    }
  ): Promise<Pion> {
    const query = `
      mutation UpdatePion($id: ID!, $payload: JSON) {
        updatePion(id: $id, payload: $payload) {
          id
          card
          home
          type
          payload
          ... on TimelinePion {
            title
            eventTitle
            startDate
            endDate
            eventType
            description
            showOnTimeline
            timeGranularity
            cardTitle
          }
        }
      }
    `;

    try {
      const data = await this.request(query, {
        id: pionId,
        payload: updates
      });
      return data.updatePion;
    } catch (error) {
      console.error('Failed to update timeline pion:', error);
      throw error;
    }
  }

  // Upload Photo File
  async uploadPhotoFile(file: File): Promise<{ id: string; url: string }> {
    // Reuse existing uploadFile method which already handles photo uploads
    return this.uploadFile(file);
  }

  // Create Photo Pion
  async createPhotoPion(
    cardId: string,
    title: string,
    fileIds: string[]
  ): Promise<Pion> {
    const query = `
      mutation CreatePion($card: ID, $type: PionTypes, $payload: JSON) {
        createPion(card: $card, type: $type, payload: $payload) {
          id
          card
          type
          payload
          ... on PhotoPion {
            title
            photos {
              id
              url
              largeUrl
              mediumUrl
              smallUrl
              tinyUrl
              caption
            }
          }
        }
      }
    `;
    
    const payload = {
      title,
      files: fileIds
    };
    
    try {
      const data = await this.request(query, {
        card: cardId,
        type: 'photo',
        payload
      });
      return data.createPion;
    } catch (error) {
      console.error('Failed to create photo pion:', error);
      throw error;
    }
  }

  // Delete a pion
  async deletePion(pionId: string): Promise<{ id: string } | null> {
    const query = `
      mutation DeletePion($id: ID!) {
        deletePion(id: $id) {
          id
        }
      }
    `;
    try {
      const data = await this.request(query, { id: pionId });
      return data?.deletePion ?? null;
    } catch (error) {
      console.error('Failed to delete pion:', error);
      return null;
    }
  }

  // Update pion title
  async updatePionTitle(pionId: string, title: string, type?: PionType): Promise<{ id: string } | null> {
    const query = `
      mutation UpdatePion($id: ID!, $payload: JSON) {
        updatePion(id: $id, payload: $payload) {
          id
        }
      }
    `;
    try {
      const data = await this.request(query, { id: pionId, payload: { title } });
      return data?.updatePion ?? null;
    } catch (error) {
      console.error('Failed to update pion title:', error);
      return null;
    }
  }

  // Get timeline pions for a home (sorted by startDate descending)
  async getTimelinePions(homeId: string): Promise<TimelinePion[]> {
    const query = `
      query Search($homeId: ID, $searchType: String, $limit: Int) {
        searchResults: search(homeId: $homeId, searchType: $searchType, limit: $limit) {
          pions {
            id,
            type,
            __typename,
            card,
            read,
            home,
            payload,
            ... on TimelinePion {
              title,
              eventTitle,
              eventType,
              timelineDescription: description,
              startDate,
              endDate,
              timeGranularity,
              showOnTimeline,
              cardTitle
            }
          }
        }
      }
    `;

    // GraphQL per docs: fetch all pions for a home, then filter timeline ones
    const pionsQuery = `
      query Pions($homeId: ID) {
        pions(homeId: $homeId) {
          items {
            id
            type
            __typename
            card
            read
            home
            payload
            ... on TimelinePion {
              title
              eventTitle
              eventType
              timelineDescription: description
              startDate
              endDate
              timeGranularity
              showOnTimeline
              cardTitle
            }
          }
          count
        }
      }
    `;

    // Default timeline event types that should always be included
    const DEFAULT_TIMELINE_EVENT_TYPES = ['movedIn', 'houseBuilt'];

    // Helper to check if a pion is a timeline event
    const isTimelineEvent = (p: any): boolean => {
      return (
        p?.type === 'timeline' ||
        p?.__typename === 'TimelinePion' ||
        DEFAULT_TIMELINE_EVENT_TYPES.includes(p?.eventType)
      );
    };

    // Helper to normalize and validate a timeline pion
    const normalize = (p: any, fallbackCardTitle?: string) => {
      const start = p?.startDate || p?.payload?.startDate;
      const validDate = start && !Number.isNaN(new Date(start).getTime());
      const show = p?.showOnTimeline ?? true;
      if (!validDate || !show) return null;
      return { ...p, startDate: start, cardTitle: p?.cardTitle ?? fallbackCardTitle } as TimelinePion;
    };

    // 0) Direct pions query (recommended by docs) — supports standalone timeline events
    try {
      console.log('[Timeline] Step0: Fetching pions(homeId) and filtering timeline');
      const data = await this.request(pionsQuery, { homeId });
      const items = data?.pions?.items || [];
      console.log('[Timeline] Step0 raw pions count:', items.length);
      const step0: TimelinePion[] = (items)
        .filter((p: any) => isTimelineEvent(p))
        .map((p: any) => normalize(p))
        .filter(Boolean) as TimelinePion[];
      console.log('[Timeline] Step0 timeline count:', step0.length);
      if (step0.length > 0) {
        return step0.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      }
      console.log('[Timeline] Step0 empty, proceeding to Step1');
    } catch (error) {
      console.warn('[Timeline] Step0 failed:', error);
    }

    // 1) Primary: dedicated timeline search
    try {
      console.log('[Timeline] Step1: Attempting searchType=timeline for home:', homeId);
      const data = await this.request(query, { homeId, searchType: 'timeline', limit: 500 });
      const step1: TimelinePion[] = (data.searchResults?.pions || [])
        .filter((p: any) => isTimelineEvent(p))
        .map((p: any) => normalize(p))
        .filter(Boolean) as TimelinePion[];
      console.log('[Timeline] Step1 count (searchType=timeline):', step1.length);
      if (step1.length > 0) {
        return step1.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      }
      console.log('[Timeline] Step1 empty, proceeding to Step2');
    } catch (error) {
      console.warn('[Timeline] Step1 failed:', error);
    }

    // 2) Fallback A: broad search then filter client-side
    try {
      console.log('[Timeline] Step2: Attempting searchType=all');
      const all = await this.search(homeId, '', 'all', 500);
      console.log('[Timeline] Step2 raw pions count:', all.pions?.length || 0);
      
      // Log sample pions to debug
      if (all.pions && all.pions.length > 0) {
        console.log('[Timeline] Step2 sample pion:', all.pions[0]);
      }
      
      const step2: TimelinePion[] = (all.pions || [])
        .filter((p: any) => {
          const match = isTimelineEvent(p);
          if (match) {
            console.log('[Timeline] Step2 matched timeline pion:', p.id, p.type, p.__typename);
          }
          return match;
        })
        .map((p: any) => {
          const normalized = normalize(p);
          if (!normalized) {
            console.log('[Timeline] Step2 pion failed normalization:', p.id, 'startDate:', p.startDate, 'payload.startDate:', p.payload?.startDate);
          }
          return normalized;
        })
        .filter(Boolean) as TimelinePion[];
      console.log('[Timeline] Step2 count after filtering (searchType=all):', step2.length);
      if (step2.length > 0) {
        return step2.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      }
      console.log('[Timeline] Step2 empty, proceeding to Step3');
    } catch (error) {
      console.warn('[Timeline] Step2 failed:', error);
    }

    // 3) Fallback B: inspect cards and fetch details for those that contain timeline pions
    try {
      console.log('[Timeline] Step3: Fetching cards for home');
      const cards = await this.getCardsWithTags(homeId);
      console.log('[Timeline] Step3 total cards:', cards?.length || 0);
      const candidateCardIds = (cards || [])
        .filter((c) => (c.pions || []).some((p: any) => isTimelineEvent(p)))
        .map((c) => c.id);
      console.log('[Timeline] Step3 candidate cards with timeline pions:', candidateCardIds.length);

      const detailedCards = await Promise.all(
        candidateCardIds.map(async (id) => {
          try { return await this.getCardDetails(homeId, id); } catch { return null; }
        })
      );

      const events: TimelinePion[] = [];
      detailedCards.forEach((card) => {
        if (!card) return;
        const cardTitle = (card as any).title;
        (card.pions || []).forEach((p: any) => {
          if (isTimelineEvent(p)) {
            const n = normalize(p, cardTitle);
            if (n) events.push(n);
          }
        });
      });

      console.info('[Timeline] Step3 count (cards details):', events.length);
      if (events.length > 0) {
        return events.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      }
    } catch (error) {
      console.warn('[Timeline] Step3 failed:', error);
    }

    console.info('[Timeline] No events found after all strategies.');
    return [];
  }

  // Crow Lists - Get all crow lists for a home
  async getCrowLists(homeId: string, type?: string): Promise<CrowList[]> {
    const query = `
      query CrowLists($homeId: ID, $type: String) {
        crowLists(homeId: $homeId, type: $type) {
          id
          home {
            id
            title
          }
          owner {
            id
            email
          }
          ... on TasksList {
            title
            tasks {
              id
              cards {
                id
                title
              }
              ... on CrowTask {
                title
                description
                tasksList
                prevTask
                dueDate
                done
              }
            }
          }
          createdAt
          updatedAt
        }
      }
    `;
    try {
      const data = await this.request(query, { homeId, type });
      return data?.crowLists || [];
    } catch (error) {
      console.error('Failed to fetch crow lists:', error);
      return [];
    }
  }

  // Create a new crow list
  async createCrowList(homeId: string, type: string, title?: string): Promise<CrowList | null> {
    const query = `
      mutation CreateCrowList($homeId: ID, $type: String, $payload: JSON) {
        createCrowList(homeId: $homeId, type: $type, payload: $payload) {
          id
          home {
            id
            title
          }
          owner {
            id
            email
          }
          ... on TasksList {
            title
          }
          createdAt
          updatedAt
        }
      }
    `;
    try {
      const payload = title ? { title } : {};
      const data = await this.request(query, { homeId, type, payload });
      return data?.createCrowList || null;
    } catch (error) {
      console.error('Failed to create crow list:', error);
      return null;
    }
  }

  // Get a single crow item
  async getCrow(crowId: string): Promise<CrowTask | CrowItem | null> {
    const query = `
      query GetCrow($id: ID) {
        crow(id: $id) {
          id
          type
          cards {
            id
            title
          }
          home {
            id
            title
          }
          owner {
            id
            email
          }
          ... on CrowTask {
            title
            description
            tasksList
            prevTask
            dueDate
            done
          }
          ... on CrowItem {
            title
            crowList
            sourceId
          }
          createdAt
          updatedAt
        }
      }
    `;
    try {
      const data = await this.request(query, { id: crowId });
      return data?.crow || null;
    } catch (error) {
      console.error('Failed to fetch crow:', error);
      return null;
    }
  }

  // Update a single crow via payload
  async updateCrow(crowId: string, payload: any, homeId: string): Promise<CrowTask | CrowItem | null> {
    const query = `
      mutation UpdateCrow($homeId: ID, $id: ID, $payload: JSON) {
        updateCrow(homeId: $homeId, id: $id, payload: $payload) {
          id
          type
          cards { id title }
          home { id title }
          owner { id email }
          ... on CrowTask {
            title
            description
            tasksList
            prevTask
            dueDate
            done
          }
          ... on CrowItem {
            title
            crowList
            sourceId
          }
          createdAt
          updatedAt
        }
      }
    `;
    try {
      const data = await this.request(query, { homeId, id: crowId, payload });
      return data?.updateCrow || null;
    } catch (error) {
      console.error('Failed to update crow:', error);
      return null;
    }
  }

  // Get crows for a specific card
  async getCardCrows(cardId: string): Promise<(CrowTask | CrowItem)[]> {
    const query = `
      query CardCrows($card: ID) {
        cardCrows(card: $card) {
          id
          type
          cards {
            id
            title
          }
          home {
            id
            title
          }
          owner {
            id
            email
          }
          ... on CrowTask {
            title
            description
            tasksList
            prevTask
            dueDate
            done
          }
          ... on CrowItem {
            title
            crowList
            sourceId
          }
          createdAt
          updatedAt
        }
      }
    `;
    try {
      const data = await this.request(query, { card: cardId });
      return data?.cardCrows || [];
    } catch (error) {
      console.error('Failed to fetch card crows:', error);
      return [];
    }
  }

  // Create a new crow (task or item)
  async createCrow(homeId: string, type: string, payload: any): Promise<CrowTask | CrowItem | null> {
    const query = `
      mutation CreateCrow($homeId: ID, $type: String, $payload: JSON) {
        createCrow(homeId: $homeId, type: $type, payload: $payload) {
          id
          type
          cards {
            id
            title
          }
          home {
            id
            title
          }
          owner {
            id
            email
          }
          ... on CrowTask {
            title
            description
            tasksList
            prevTask
            dueDate
            done
          }
          ... on CrowItem {
            title
            crowList
            sourceId
          }
          createdAt
          updatedAt
        }
      }
    `;
    try {
      const data = await this.request(query, { homeId, type, payload });
      return data?.createCrow || null;
    } catch (error) {
      console.error('Failed to create crow:', error);
      return null;
    }
  }

  // Update crow list crows (for bulk operations)
  async updateCrowListCrows(
    crowListId: string, 
    homeId: string, 
    payload: { done?: boolean; [key: string]: any }
  ): Promise<{ id: string; payload: any }[] | null> {
    const query = `
      mutation UpdateCrowListCrows($crowListId: ID, $homeId: ID, $payload: UpdateCrowListCrowsPayload) {
        updateCrowListCrows(crowListId: $crowListId, homeId: $homeId, payload: $payload) {
          id
          payload
        }
      }
    `;
    try {
      const data = await this.request(query, { crowListId, homeId, payload });
      return data?.updateCrowListCrows || null;
    } catch (error) {
      console.error('Failed to update crow list crows:', error);
      return null;
    }
  }

  // Delete crow list crows (with optional condition)
  async deleteCrowListCrows(
    crowListId: string, 
    homeId: string, 
    condition?: 'completed' | 'all'
  ): Promise<{ id: string }[] | null> {
    const query = `
      mutation DeleteCrowListCrows($crowListId: ID, $homeId: ID, $condition: DeleteCrowListCrowsCondition) {
        deleteCrowListCrows(crowListId: $crowListId, homeId: $homeId, condition: $condition) {
          id
        }
      }
    `;
    try {
      const data = await this.request(query, { crowListId, homeId, condition });
      return data?.deleteCrowListCrows || null;
    } catch (error) {
      console.error('Failed to delete crow list crows:', error);
      return null;
    }
  }

  // Search within a home (simplified based on working API calls)
  async search(homeId: string, searchText?: string, searchType: string = 'all', limit: number = 50): Promise<SearchResults> {
    const query = `
      query Search($homeId: ID, $searchText: String, $searchType: String, $limit: Int) {
        searchResults: search(homeId: $homeId, searchText: $searchText, searchType: $searchType, limit: $limit) {
          stats,
          allCardsCount,
          allTagsCount,
          allPionsCount,
          allFilesCount,
          cards {
            id,
            title,
            subtitle,
            updatedAt,
            createdAt,
            home,
            image { tinyUrl, smallUrl, mediumUrl },
            read,
            tags {
              id
              title
            }
          },
          pions {
            id,
            type,
            __typename,
            card,
            autoCreated,
            home,
            payload,
            createdBy {
              id,
              firstName,
              lastName,
              email,
              role
            }
            ... on PhotoPion { title, photos { id, caption, description, url, tinyUrl, smallUrl } }
            ... on PDFPion { title, createdAt, file { id, name, url, smallUrl, payload } }
            ... on BrandPion { title, brand, model } 
            ... on NotePion { title, content, richContent } 
            ... on UrlPion { url, title, urlTitle } 
            ... on YouTubePion { url, title }
            ... on TimelinePion {
              title,
              eventTitle,
              eventType,
              timelineDescription: description,
              startDate,
              endDate,
              timeGranularity,
              showOnTimeline,
              cardTitle
            }
          },
          files { id, mime, url }
          stats
        }
      }
    `;
    const data = await this.request(query, { homeId, searchText, searchType, limit });
    return data.searchResults;
  }
}

// Helper function to extract partner code from Homer user data
export function extractHomerPartnerCode(user: User | null | undefined): string | null {
  if (!user) return null;
  
  // Try primary partner first
  if (user.partner?.name) {
    return user.partner.name;
  }
  
  // Fall back to first partner in array
  if (user.partners && user.partners.length > 0) {
    return user.partners[0].name;
  }
  
  return null;
}

/**
 * Extract partner code from home's users array
 * Looks for partner in home.users[].partner or home.users[].partners[]
 */
export function extractPartnerFromHome(home: Home | null | undefined): string | null {
  if (!home?.users || home.users.length === 0) {
    console.warn('No users found in home data');
    return null;
  }

  // Try each user in the home
  for (const user of home.users) {
    // Try single partner field first
    if (user.partner?.name) {
      console.log('✅ Found partner from home user:', user.partner.name);
      return user.partner.name;
    }
    
    // Try partners array (take first active partner)
    if (user.partners && user.partners.length > 0) {
      const partnerCode = user.partners[0].name;
      console.log('✅ Found partner from home users array:', partnerCode);
      return partnerCode;
    }
  }

  console.warn('⚠️ No partner found in home users');
  return null;
}

export const homerAPI = new HomerAPIClient();