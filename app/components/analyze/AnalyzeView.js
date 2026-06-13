import { Zap } from 'lucide-react';
import AnalyzeForm from '@/app/components/analyze/AnalyzeForm';
import AnalyzeFinding, { parseFinding } from '@/app/components/analyze/AnalyzeFinding';
import AnalyzeReportBar from '@/app/components/analyze/AnalyzeReportBar';
import { ANALYZE_GUIDE_URL, ANALYZE_SPARK_URL } from '@/lib/config/analyze';
import { SITE_ORIGIN } from '@/lib/config/site';

export default function AnalyzeLanding({ t }) {
  return (
    <section className="tool-page analyze-page">
      <header className="tool-page-head">
        <h1 className="tool-page-title">
          <span className="tool-page-title-icon tool-page-title-icon--yellow">
            <Zap size={20} />
          </span>
          {t('tools.analyze.title')}
        </h1>
        <p className="tool-page-desc">{t('tools.analyze.description')}</p>
      </header>

      <p className="analyze-disclaimer">
        {t('tools.analyze.disclaimer')}{' '}
        <a href={ANALYZE_GUIDE_URL} target="_blank" rel="noopener noreferrer" className="analyze-link">
          {t('tools.analyze.guideLink')}
        </a>
      </p>

      <div className="analyze-steps">
        <p>
          1. <a href={ANALYZE_SPARK_URL} target="_blank" rel="noopener noreferrer" className="analyze-link">{t('tools.analyze.stepInstall')}</a>
          <br />
          <span className="analyze-steps-note">{t('tools.analyze.stepInstallNote')}</span>
          <br />
          2. {t('tools.analyze.stepProfiler')}
          <br />
          3. {t('tools.analyze.stepStop')}
        </p>
      </div>

      <AnalyzeForm />

      <p className="analyze-share">
        {t('tools.analyze.shareHint')}
        <br />
        <span className="analyze-share-url">{`${SITE_ORIGIN}/tools/analyze/[id]`}</span>
      </p>
    </section>
  );
}

export function AnalyzeResultsView({ t, id, results, showAnother = true }) {
  const issueCount = results.filter((field) => parseFinding(field.name).severity === 'issue').length;
  const okCount = results.filter((field) => parseFinding(field.name).severity === 'ok').length;

  return (
    <section className="tool-page analyze-page">
      <header className="tool-page-head">
        <h1 className="tool-page-title">
          <span className="tool-page-title-icon tool-page-title-icon--yellow">
            <Zap size={20} />
          </span>
          {t('tools.analyze.title')}
        </h1>
        <p className="tool-page-desc">{t('tools.analyze.description')}</p>
      </header>

      <p className="analyze-disclaimer">
        {t('tools.analyze.disclaimer')}{' '}
        <a href={ANALYZE_GUIDE_URL} target="_blank" rel="noopener noreferrer" className="analyze-link">
          {t('tools.analyze.guideLink')}
        </a>
      </p>

      <div className="analyze-report">
        <AnalyzeReportBar id={id} issueCount={issueCount} okCount={okCount} />

        <ul className="analyze-findings">
          {results.map((field, index) => (
            <AnalyzeFinding key={`${field.name}-${index}`} field={field} />
          ))}
        </ul>
      </div>

      {showAnother && (
        <div className="analyze-rerun">
          <p className="analyze-another">{t('tools.analyze.another')}</p>
          <AnalyzeForm autoFocus />
        </div>
      )}

      <p className="analyze-share">
        {t('tools.analyze.shareHint')}
        <br />
        <span className="analyze-share-url">{`${SITE_ORIGIN}/tools/analyze/${id}`}</span>
      </p>
    </section>
  );
}
