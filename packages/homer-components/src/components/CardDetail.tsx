import { useState, useEffect } from "react";
import { X, Calendar, Tag as TagIcon, FileText, Image, Link, Video, ShoppingBag, Receipt, MoreHorizontal, Download, Copy, CreditCard, Edit, Upload, Trash2, Tags, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { homerAPI, type Card as CardType, type Pion, type DetailedPion } from "@/lib/homer-api";
import { useToast } from "@/hooks/use-toast";
import { RelatedCards } from "./RelatedCards";
import { CardPion } from "./CardPion";
import { EditTagsDialog } from "./EditTagsDialog";
import { FileUpload } from "./FileUpload";
import { EditPionTitleDialog } from "./EditPionTitleDialog";
import { DeletePionDialog } from "./DeletePionDialog";
import { BrandPionRenderer, PhotoPionRenderer, PDFPionRenderer, NotePionRenderer, GenericPionRenderer } from "./PionRenderers";

interface CardDetailProps {
  cardId: string;
  homeId: string;
  cards: CardType[];
  onClose: () => void;
  onTagClick?: (tagId: string) => void;
  onCardClick?: (cardId: string) => void;
  onCardUpdate?: (card: CardType) => void;
}

export const CardDetail = ({ cardId, homeId, cards, onClose, onTagClick, onCardClick, onCardUpdate }: CardDetailProps) => {
  const [card, setCard] = useState<CardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingAllPions, setLoadingAllPions] = useState(false);
  const [loadedPions, setLoadedPions] = useState<Map<string, DetailedPion>>(new Map());
  const [pionLoadProgress, setPionLoadProgress] = useState({ loaded: 0, total: 0 });
  const [editTagsOpen, setEditTagsOpen] = useState(false);
  const [editPionTitleOpen, setEditPionTitleOpen] = useState(false);
  const [deletePionOpen, setDeletePionOpen] = useState(false);
  const [selectedPion, setSelectedPion] = useState<Pion | null>(null);
  const { toast } = useToast();

  // Helper function to check if pion data is complete enough for basic rendering
  const isPionDataComplete = (pion: Pion) => {
    // For 'card' pions, ensure we have a resolvable reference; otherwise treat as incomplete
    if (pion.type === 'card') {
      const anyPion: any = pion as any;
      const payload = anyPion?.payload;
      const hasResolvableRef =
        anyPion?.cardReference?.id ||
        payload?.cardUUID ||
        payload?.cardUuid ||
        payload?.card?.id ||
        payload?.cardId ||
        typeof payload === 'string';
      return Boolean(hasResolvableRef);
    }

    // Other pion types are fine for basic rendering
    return true;
  };

  // Helper function to check if card has complete pion data
  const hasCompletePionData = (cardData: CardType) => {
    return cardData.pions?.every(pion => isPionDataComplete(pion)) || !cardData.pions?.length;
  };

  // Helper function to load all pion details at once
  const loadAllPionDetails = async (pions: Pion[]) => {
    // Exclude 'card' pions from per-pion fetches; rely on card(id:) response for cardReference
    const detailPionTypes = ['brand', 'photo', 'pdf', 'note'];
    const pionsToLoad = pions.filter(pion => detailPionTypes.includes(pion.type));
    
    if (pionsToLoad.length === 0) return;

    setLoadingAllPions(true);
    setPionLoadProgress({ loaded: 0, total: pionsToLoad.length });
    
    const results = await Promise.allSettled(
      pionsToLoad.map(async (pion, index) => {
        try {
          const detailedPion = await homerAPI.getPion(pion.id);
          setPionLoadProgress(prev => ({ ...prev, loaded: prev.loaded + 1 }));
          return { pionId: pion.id, detailedPion };
        } catch (error) {
          console.error(`Failed to load pion ${pion.id}:`, error);
          setPionLoadProgress(prev => ({ ...prev, loaded: prev.loaded + 1 }));
          return { pionId: pion.id, detailedPion: null };
        }
      })
    );

    const newLoadedPions = new Map(loadedPions);
    let successCount = 0;
    let failCount = 0;

    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.detailedPion) {
        newLoadedPions.set(result.value.pionId, result.value.detailedPion);
        successCount++;
      } else {
        failCount++;
      }
    });

    setLoadedPions(newLoadedPions);
    setLoadingAllPions(false);

    if (successCount > 0) {
      toast({
        title: "Content Loaded",
        description: `Loaded detailed content for ${successCount} items${failCount > 0 ? ` (${failCount} failed)` : ''}`,
      });
    }
    
    if (failCount > 0 && successCount === 0) {
      toast({
        title: "Load Failed",
        description: "Could not load detailed content for any items",
        variant: "destructive",
      });
    }
  };

  const handleAddTag = async (tagId: string, tagTitle: string) => {
    if (!card) return;
    
    // Optimistic update - update UI immediately
    const newTags = [...(card.tags || []), { id: tagId, title: tagTitle }];
    const previousTags = card.tags;
    setCard({
      ...card,
      tags: newTags
    });
    
    // Make API call in background
    try {
      const tagIds = newTags.map(tag => tag.id);
      const result = await homerAPI.updateCardTags(homeId, card.id, tagIds);
      if (!result) {
        throw new Error("Failed to add tag");
      }
      // Update with server response to ensure consistency
      const updatedCard = { ...card, tags: result.tags };
      setCard(updatedCard);
      onCardUpdate?.(updatedCard);
    } catch (error) {
      // Revert optimistic update on error
      setCard(prev => prev ? { ...prev, tags: previousTags } : prev);
      toast({
        title: "Error",
        description: "Failed to add tag",
        variant: "destructive",
      });
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    if (!card) return;
    
    // Optimistic update - update UI immediately
    const newTags = (card.tags || []).filter(tag => tag.id !== tagId);
    const previousTags = card.tags;
    setCard({
      ...card,
      tags: newTags
    });
    
    // Make API call in background
    try {
      const tagIds = newTags.map(tag => tag.id);
      const result = await homerAPI.updateCardTags(homeId, card.id, tagIds);
      if (!result) {
        throw new Error("Failed to remove tag");
      }
      // Update with server response to ensure consistency
      const updatedCard = { ...card, tags: result.tags };
      setCard(updatedCard);
      onCardUpdate?.(updatedCard);
    } catch (error) {
      // Revert optimistic update on error
      setCard(prev => prev ? { ...prev, tags: previousTags } : prev);
      toast({
        title: "Error",
        description: "Failed to remove tag",
        variant: "destructive",
      });
    }
  };

  // Handle pion title update
  const handleUpdatePionTitle = async (newTitle: string) => {
    if (!selectedPion?.id) {
      toast({ title: "No item selected", description: "Please select an item to edit.", variant: "destructive" });
      return;
    }
    try {
      const result = await homerAPI.updatePionTitle(selectedPion.id, newTitle);
      if (!result) {
        throw new Error("Update returned no result");
      }
      // Refresh card data
      const updatedCard = await homerAPI.getCardDetails(homeId, cardId);
      if (updatedCard) {
        setCard(updatedCard);
        await loadAllPionDetails(updatedCard.pions);
      }
      setSelectedPion(null);
      toast({
        title: "Title Updated",
        description: "Item title has been updated successfully",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update title";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  // Handle pion deletion
  const handleDeletePion = async () => {
    if (!selectedPion?.id) {
      toast({ title: "No item selected", description: "Please select an item to delete.", variant: "destructive" });
      return;
    }
    try {
      await homerAPI.deletePion(selectedPion.id);
      // Refresh card data to verify deletion
      const updatedCard = await homerAPI.getCardDetails(homeId, cardId);
      if (updatedCard) {
        setCard(updatedCard);
        await loadAllPionDetails(updatedCard.pions);
      }
      setSelectedPion(null);
      toast({
        title: "Item Deleted",
        description: "Item has been deleted successfully",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete item";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  // Handle file upload completion
  const handleUploadComplete = async (pionIds: string[]) => {
    // Refresh card data to show newly uploaded files
    try {
      const updatedCard = await homerAPI.getCardDetails(homeId, cardId);
      if (updatedCard) {
        setCard(updatedCard);
        // Load details for new pions
        if (updatedCard.pions) {
          await loadAllPionDetails(updatedCard.pions);
        }
      }
    } catch (error) {
      console.error('Failed to refresh card after upload:', error);
    }
  };

  useEffect(() => {
    const loadCardDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Loading card details for:', cardId);
        
        // First try to find the card in the already loaded cards
        const foundCard = cards.find(c => c.id === cardId);
        if (foundCard && hasCompletePionData(foundCard)) {
          console.log('Card found in local state with complete data:', foundCard);
          setCard(foundCard);
          
          // Auto-load all pion details even for local cards
          if (foundCard.pions && foundCard.pions.length > 0) {
            await loadAllPionDetails(foundCard.pions);
          }
          
          toast({
            title: "Card Loaded",
            description: `Loaded ${foundCard.pions?.length || 0} pions for "${foundCard.title}"`,
          });
          setLoading(false);
          return;
        }
        
        // If not found locally or has incomplete data, try API
        console.log(foundCard ? 'Card found locally but missing detailed pion data, fetching from API...' : 'Card not found locally, fetching from API...');
        const cardData = await homerAPI.getCardDetails(homeId, cardId);
        console.log('Card details loaded from API:', cardData);
        if (!cardData) {
          const msg = 'Card not found';
          setError(msg);
          toast({
            title: 'Card not found',
            description: `Card ${cardId} is not available in this home.`,
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
        setCard(cardData);
        
        // Auto-load all pion details
        if (cardData.pions && cardData.pions.length > 0) {
          await loadAllPionDetails(cardData.pions);
        }
        
        toast({
          title: 'Card Loaded',
          description: `Loaded ${cardData.pions?.length || 0} pions for "${cardData.title}"`,
        });
      } catch (err) {
        console.error('Failed to load card details:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load card details';
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (cardId) {
      loadCardDetails();
    }
  }, [cardId, homeId, cards, toast]);

  const getPionIcon = (type: string) => {
    switch (type) {
      case 'photo': return <Image className="h-4 w-4" />;
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'url': return <Link className="h-4 w-4" />;
      case 'youtube': return <Video className="h-4 w-4" />;
      case 'brand': return <ShoppingBag className="h-4 w-4" />;
      case 'receipt': return <Receipt className="h-4 w-4" />;
      case 'card': return <CreditCard className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const renderPionContent = (pion: Pion) => {
    const detailedPion = loadedPions.get(pion.id);
    const hasDetailedData = detailedPion !== undefined;

    const renderBasicContent = () => {
      switch (pion.type) {
        case 'photo':
          return <PhotoPionRenderer pion={pion} detailed={false} />;
        case 'note':
          return <NotePionRenderer pion={pion} detailed={false} />;
        case 'brand':
          return <BrandPionRenderer pion={pion} detailed={false} />;
        case 'url':
        case 'youtube':
          return <GenericPionRenderer pion={pion} />;
        case 'pdf':
          return <PDFPionRenderer pion={pion} detailed={false} />;
        case 'card':
          return (
            (() => {
              const refId = (pion as any)?.cardReference?.id
                || (detailedPion as any)?.cardReference?.id
                || (pion as any)?.payload?.cardUUID
                || (pion as any)?.payload?.cardUuid
                || (pion as any)?.payload?.cardId;

              if (!refId) {
                return (
                  <Card className="opacity-75">
                    <CardContent className="p-3">
                      <div className="space-y-1">
                        <div className="w-full h-6 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">Missing reference</div>
                        <p className="text-sm text-muted-foreground">Card reference not found</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              }

              return (
                <CardPion
                  cardId={refId}
                  homeId={homeId}
                  onCardClick={(clickedCardId) => {
                    onClose?.();
                    onCardClick?.(clickedCardId);
                  }}
                />
              );
            })()
          );
        default:
          return <p className="text-muted-foreground">No preview available</p>;
      }
    };

    const renderDetailedContent = () => {
      if (!detailedPion) return null;

      switch (detailedPion.type) {
        case 'brand':
          return <BrandPionRenderer pion={detailedPion} detailed />;
        case 'photo':
          return <PhotoPionRenderer pion={detailedPion} detailed />;
        case 'pdf':
          return <PDFPionRenderer pion={detailedPion} detailed />;
        case 'note':
          return <NotePionRenderer pion={detailedPion} detailed />;
        default:
          return <p className="text-muted-foreground">Detailed content not available for this type</p>;
      }
    };

    return (
      <div className="space-y-3">
        {/* Always show detailed content if available, otherwise show basic content */}
        {hasDetailedData ? (
          <div className="space-y-4">
            {renderDetailedContent()}
          </div>
        ) : (
          <div>{renderBasicContent()}</div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading card details...</p>
          {loadingAllPions && pionLoadProgress.total > 0 && (
            <p className="text-sm text-muted-foreground">
              Loading content: {pionLoadProgress.loaded} of {pionLoadProgress.total}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Error
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
            <Button className="mt-4" onClick={onClose}>
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!card) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-0">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col min-h-0">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <CardTitle className="text-2xl">{card.title || "Untitled Card"}</CardTitle>
              {card.subtitle && (
                <p className="text-muted-foreground">{card.subtitle}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(card.updatedAt).toLocaleDateString()}
                </div>
                {card.unreadPions > 0 && (
                  <Badge variant="destructive">
                    {card.unreadPions} unread
                  </Badge>
                )}
              </div>
              {card.tags && card.tags.length > 0 ? (
                 <div className="flex items-center gap-2 flex-wrap">
                   <TagIcon className="h-4 w-4 text-muted-foreground" />
                   {card.tags.map((tag) => (
                      <Badge 
                        key={tag.id} 
                        variant="secondary"
                        className={onTagClick ? "cursor-pointer hover:bg-primary/20 transition-colors" : ""}
                        onClick={onTagClick ? () => {
                          onClose(); // Close current modal
                          onTagClick(tag.id); // Open card with this tag
                        } : undefined}
                      >
                       {tag.title}
                     </Badge>
                   ))}
                   <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => setEditTagsOpen(true)}
                     className="h-6 px-2 text-xs"
                   >
                     <Edit className="h-3 w-3 mr-1" />
                     Edit
                   </Button>
                 </div>
              ) : (
                <div className="flex items-center gap-2">
                  <TagIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">No tags</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditTagsOpen(true)}
                    className="h-6 px-2 text-xs"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Add Tags
                  </Button>
                </div>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="flex-1 min-h-0 p-0 overflow-y-auto">
          <div className="p-6">
            {card.headerImage && (
              <div className="mb-6">
                <img
                  src={card.headerImage.mediumUrl || card.headerImage.url}
                  alt={card.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            <div className="space-y-6">
              {/* Content Section - Non-card pions */}
              {(() => {
                const nonCardPions = card.pions?.filter(pion => pion.type !== 'card') || [];
                return nonCardPions.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Content ({nonCardPions.length} items)
                    </h3>
                    
                    <div className="space-y-4">
                      {nonCardPions.map((pion) => (
                        <Card key={pion.id} className="relative">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-1">
                                {getPionIcon(pion.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-medium flex-1">
                                    {pion.title || `${pion.type.charAt(0).toUpperCase() + pion.type.slice(1)} Content`}
                                  </h4>
                                  <Badge variant="outline" className="text-xs">
                                    {pion.type}
                                  </Badge>
                                  {!pion.read && (
                                    <Badge variant="destructive" className="text-xs">
                                      New
                                    </Badge>
                                  )}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                     <DropdownMenuContent align="end" className="w-56 z-50">
                                      <DropdownMenuItem
                                        onClick={() => {
                                          window.open(`/pion/${pion.id}`, '_blank');
                                        }}
                                      >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        View Standalone
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedPion(pion);
                                          setEditPionTitleOpen(true);
                                        }}
                                      >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Title
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setEditTagsOpen(true);
                                        }}
                                      >
                                        <Tags className="h-4 w-4 mr-2" />
                                        Edit Tags
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedPion(pion);
                                          setDeletePionOpen(true);
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                      {pion.type === 'pdf' && (() => {
                                        const detailedPion = loadedPions.get(pion.id) as any;
                                        const fileUrl = detailedPion?.file?.url || (pion as any)?.file?.url;
                                        return fileUrl ? (
                                          <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem asChild>
                                              <a
                                                href={fileUrl}
                                                download
                                                className="flex items-center"
                                              >
                                                <Download className="h-4 w-4 mr-2" />
                                                Download
                                              </a>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                              onClick={() => {
                                                navigator.clipboard.writeText(fileUrl);
                                                toast({
                                                  title: "Link Copied",
                                                  description: "PDF link copied to clipboard.",
                                                });
                                              }}
                                            >
                                              <Copy className="h-4 w-4 mr-2" />
                                              Copy link
                                            </DropdownMenuItem>
                                          </>
                                        ) : null;
                                      })()}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                {isPionDataComplete(pion) ? (
                                  renderPionContent(pion)
                                ) : (
                                  <div className="text-muted-foreground italic">
                                    Content preview not available - incomplete data
                                  </div>
                                )}
                                {pion.createdBy && pion.createdBy.firstName ? (
                                  <div className="mt-2 text-xs text-muted-foreground">
                                    By {pion.createdBy.firstName} {pion.createdBy.lastName}
                                  </div>
                                ) : (
                                  <div className="mt-2 text-xs text-muted-foreground">
                                    By Unknown User
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Card Content Section - Card-type pions in grid layout */}
              {(() => {
                const cardPions = card.pions?.filter(pion => pion.type === 'card') || [];
                return cardPions.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Card Content ({cardPions.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                         {cardPions.map((pion) => {
                           // Resolve referenced card ID: prefer explicit cardReference from API, then payload fallbacks
                           const detailed = loadedPions.get(pion.id) as any;
                           const payload = (detailed?.payload ?? (pion as any)?.payload) as any;
                           
                           const referencedCardId =
                             (pion as any)?.cardReference?.id ||
                             (detailed as any)?.cardReference?.id ||
                             payload?.cardUUID ||
                             payload?.cardUuid ||
                             payload?.card?.id ||
                             payload?.cardId ||
                             payload?.card ||
                             payload?.id ||
                             (typeof payload === 'string' ? payload : null);
                           
                           console.log('Card pion:', pion.id, { cardReference: (pion as any)?.cardReference, payloadKeys: Object.keys(payload || {}), referencedCardId });
                         
                         // If we still don't have a valid card ID, show placeholder
                         if (!referencedCardId) {
                           return (
                             <Card key={pion.id} className="opacity-50">
                               <CardContent className="p-3">
                                 <div className="space-y-2">
                                   <div className="w-full h-15 rounded overflow-hidden bg-muted flex items-center justify-center">
                                     <span className="text-muted-foreground text-xs">Missing reference</span>
                                   </div>
                                   <div className="space-y-1">
                                     <h4 className="text-sm font-medium">{pion.title}</h4>
                                     <p className="text-xs text-muted-foreground">Card reference not found</p>
                                   </div>
                                 </div>
                               </CardContent>
                             </Card>
                           );
                         }
                         
                          return (
                            <CardPion 
                              key={pion.id}
                              cardId={referencedCardId}
                              homeId={card.home}
                              onCardClick={(clickedCardId) => {
                                onClose?.();
                                onCardClick?.(clickedCardId);
                              }}
                            />
                          );
                       })}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* File Upload Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Files
                </h3>
                <FileUpload 
                  homeId={homeId}
                  cardId={card.id}
                  onUploadComplete={handleUploadComplete}
                />
              </div>

              {/* Related Cards Section */}
              <RelatedCards
                currentCard={card}
                allCards={cards}
                onCardClick={(clickedCardId) => {
                  onClose?.();
                  onCardClick?.(clickedCardId);
                }}
              />
             </div>
             </div>
        </CardContent>
      </Card>
      
      {/* Edit Tags Dialog */}
      {card && (
        <EditTagsDialog
          open={editTagsOpen}
          onOpenChange={setEditTagsOpen}
          currentCard={card}
          allCards={cards}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
        />
      )}

      {/* Edit Pion Title Dialog */}
      {selectedPion && (
        <EditPionTitleDialog
          open={editPionTitleOpen}
          onOpenChange={setEditPionTitleOpen}
          currentTitle={selectedPion.title || ''}
          onSave={handleUpdatePionTitle}
        />
      )}

      {/* Delete Pion Dialog */}
      {selectedPion && (
        <DeletePionDialog
          open={deletePionOpen}
          onOpenChange={setDeletePionOpen}
          pionTitle={selectedPion.title || 'this item'}
          onConfirm={handleDeletePion}
        />
      )}
    </div>
  );
};