import analyzeProfile from '@/lib/tools/analyze/functions/analyzeProfile';
import analyzeTimings from '@/lib/tools/analyze/functions/analyzeTimings';

export async function runAnalysis(id) {
  const cleanId = id.trim();
  if (cleanId.length < 30) {
    return analyzeProfile(cleanId);
  }
  return analyzeTimings(cleanId);
}
