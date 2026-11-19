import React from 'react';

// Numbered two-column table for short checklists in the workspace
// (phase objectives, expected outputs). Bordered grid table in a rounded frame.
const NumberedTable: React.FC<{ label: string; items: string[] }> = ({ label, items }) => (
  <div className="overflow-hidden rounded-lg border border-ld-frost">
    {/* border-hidden: drop the cells' outer edges so they don't double the rounded wrapper border */}
    <table className="w-full text-sm border-collapse border-hidden">
      <thead>
        <tr className="bg-ld-cloud text-left">
          <th scope="col" className="w-10 border border-ld-frost px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-ld-steel">#</th>
          <th scope="col" className="border border-ld-frost px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-ld-steel">{label}</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={item} className="align-top">
            <td className="border border-ld-frost px-3 py-2.5 font-ld-mono text-xs text-ld-fog">{String(i + 1).padStart(2, '0')}</td>
            <td className="border border-ld-frost px-3 py-2.5 text-ld-slate leading-relaxed">{item}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default NumberedTable;
