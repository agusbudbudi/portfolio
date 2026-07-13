import React from 'react';
import type { ToolConfig } from '../../../../types/portfolio';

const TOOLS_LIMIT = 20;

const BioAndToolsPanel: React.FC<{ bio: string; tools: ToolConfig[] }> = ({ bio, tools }) => {
  const hasMoreTools = tools.length > TOOLS_LIMIT;
  const visibleTools = hasMoreTools ? tools.slice(0, TOOLS_LIMIT - 1) : tools;
  const remainingToolsCount = tools.length - visibleTools.length;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-16 mb-14">
      <div className="lg:col-span-3 flex flex-col gap-8">
        <div className="max-w-[800px] text-base text-ld-slate leading-relaxed">
          <p className="whitespace-pre-line">{bio}</p>
        </div>
      </div>

      {tools.length > 0 && (
        <div className="lg:col-span-2">
          <div className="grid grid-cols-5 gap-3">
            {visibleTools.map((tool) => (
              <div
                key={tool.id}
                className="aspect-square flex items-center justify-center rounded-2xl border border-ld-ash/50 p-1 transition-shadow hover:shadow-ld-subtle-3"
              >
                {tool.logo ? (
                  <img src={tool.logo} alt={tool.name} title={tool.name} loading="lazy" decoding="async" className="w-1/2 h-1/2 object-contain" />
                ) : (
                  <span className="text-[10px] font-medium text-ld-graphite text-center leading-tight">{tool.name}</span>
                )}
              </div>
            ))}
            {remainingToolsCount > 0 && (
              <div className="aspect-square flex items-center justify-center rounded-2xl border border-ld-ash/50 p-1">
                <span className="text-sm font-semibold text-ld-violet text-center leading-tight">+{remainingToolsCount}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default BioAndToolsPanel;
