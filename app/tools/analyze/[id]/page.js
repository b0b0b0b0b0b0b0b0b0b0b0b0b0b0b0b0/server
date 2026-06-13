import AnalyzeResultsClient from '@/app/components/analyze/AnalyzeResultsClient';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { runAnalysis } from '@/lib/tools/analyze/runAnalysis';

export async function generateMetadata({ params }) {
  const { id } = await params;
  return buildPageMetadata({
    title: `Server Analysis — ${id}`,
    description: 'Spark profile and Paper timings optimization recommendations for your Minecraft server.',
    path: `/tools/analyze/${id}`,
  });
}

export default async function AnalyzeIdPage({ params }) {
  const { id } = await params;
  const results = await runAnalysis(decodeURIComponent(id));
  return <AnalyzeResultsClient id={id} results={results} />;
}
