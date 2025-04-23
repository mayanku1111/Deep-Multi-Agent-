import React from 'react';
import { Markdown } from '@/components/ui/markdown';
import remarkGfm from 'remark-gfm';

const ResearchReport: React.FC = () => {
  const report = "This is a sample report. It includes a <report> section and a </report> section.";

  return (
    <Markdown
      className="prose-pre:max-h-[500px] prose-pre:overflow-auto prose lg:prose-xl"
      remarkPlugins={[remarkGfm]}
      components={{
        // ... existing code ...
      }}
    >
      {report && report.includes("<report>") 
        ? report.split("<report>")[1].split("</report>")[0]
        : report || "No report available yet."}
    </Markdown>
  );
};

export default ResearchReport; 