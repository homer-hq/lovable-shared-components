// Homer API Package Exports

// Core API Client
export { homerAPI, extractHomerPartnerCode, extractPartnerFromHome } from './lib/homer-api';

// All Type Definitions
export type {
  User,
  Home,
  Card,
  Tag,
  Pion,
  DetailedPion,
  BrandPion,
  PhotoPion,
  PDFPion,
  NotePion,
  TimelinePion,
  ReceiptPion,
  ARNotePion,
  CrowList,
  Crow,
  CrowTask,
  CrowItem,
  PionType,
  Photo,
  HomerFile,
  Activity,
  SearchResults,
  HomerPartner
} from './lib/homer-api';

// Partner Context (Optional - requires Supabase)
export { PartnerProvider, usePartner } from './contexts/PartnerContext';
