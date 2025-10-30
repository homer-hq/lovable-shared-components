import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

type AnalysisType = 'summary' | 'tags' | 'title' | 'extract';

interface AnalysisResult {
  result: string;
  analysisType: AnalysisType;
}

export const useContentAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const { toast } = useToast();

  const analyzeContent = useCallback(async (
    content: string,
    contentType: string,
    analysisType: AnalysisType
  ): Promise<string | null> => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    const ANALYZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-content`;

    try {
      const response = await fetch(ANALYZE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ content, contentType, analysisType }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: "Rate Limit Exceeded",
            description: "Too many requests. Please try again in a moment.",
            variant: "destructive",
          });
          setIsAnalyzing(false);
          return null;
        }
        
        if (response.status === 402) {
          toast({
            title: "Credits Exhausted",
            description: "Please add AI credits to continue using this feature.",
            variant: "destructive",
          });
          setIsAnalyzing(false);
          return null;
        }
        
        throw new Error('Analysis failed');
      }

      const data: AnalysisResult = await response.json();
      setAnalysisResult(data.result);
      setIsAnalyzing(false);
      return data.result;
    } catch (error) {
      console.error('Content analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze content. Please try again.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
      return null;
    }
  }, [toast]);

  const clearAnalysis = useCallback(() => {
    setAnalysisResult(null);
  }, []);

  return {
    isAnalyzing,
    analysisResult,
    analyzeContent,
    clearAnalysis,
  };
};
