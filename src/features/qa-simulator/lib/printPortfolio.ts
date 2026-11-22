import type { SimulatorProject } from '../../../types/qaSimulator';

export const portfolioDocTitle = (author: string, project: SimulatorProject) => `Portfolio QA - ${author} - ${project.product}`;

/** Browser print → "Save as PDF", with the document title as the default file name. */
export function printPortfolio(docTitle: string) {
  const prev = document.title;
  document.title = docTitle;
  const restore = () => { document.title = prev; window.removeEventListener('afterprint', restore); };
  window.addEventListener('afterprint', restore);
  window.print();
}
