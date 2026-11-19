import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, KeyRound, Loader2, RotateCcw, Send, Shuffle, Terminal } from 'lucide-react';
import Seo from '../../../components/common/Seo';
import { callMockApi, ME, ME_PIN, resetMock, type ApiRequest, type ApiResponse } from '../sandbox/dompetkuMockApi';

// QA Simulator practice target for phase "api-testing": a Postman-lite
// console over the in-browser DompetKu mock API (build api-rc1, intentionally
// buggy — see sandbox/dompetkuMockApi.ts). Styled as a separate dev tool, not
// the Labs workspace.

const BUILD = 'api-rc1' as const;

interface Endpoint {
  method: 'GET' | 'POST';
  path: string;
  label: string;
  body?: Record<string, unknown>;
  auth: boolean;
  idempotency?: boolean;
}

const ENDPOINTS: Endpoint[] = [
  { method: 'POST', path: '/v1/auth/login', label: 'Login', body: { phone: ME, pin: ME_PIN }, auth: false },
  { method: 'GET', path: '/v1/wallet/balance', label: 'Cek saldo', auth: true },
  { method: 'POST', path: '/v1/topup', label: 'Top up', body: { amount: 50000, method: 'va_bca' }, auth: true },
  { method: 'POST', path: '/v1/transfer/inquiry', label: 'Cek penerima', body: { to_phone: '081234567890', amount: 25000 }, auth: true },
  { method: 'POST', path: '/v1/transfer', label: 'Transfer', body: { to_phone: '081234567890', amount: 25000, pin: ME_PIN, note: 'Patungan makan' }, auth: true, idempotency: true },
  { method: 'GET', path: '/v1/transactions?limit=20&page=1', label: 'Riwayat', auth: true },
];

interface HistoryEntry { req: ApiRequest; res: ApiResponse; at: string }

const METHOD_CLS: Record<string, string> = {
  GET: 'bg-emerald-500/15 text-emerald-300',
  POST: 'bg-amber-500/15 text-amber-300',
};
const statusCls = (s: number) =>
  s >= 500 ? 'bg-red-500/15 text-red-300' : s >= 400 ? 'bg-amber-500/15 text-amber-300' : 'bg-emerald-500/15 text-emerald-300';
const newKey = () => `idem-${Math.random().toString(36).slice(2, 10)}`;
const pretty = (v: unknown) => JSON.stringify(v, null, 2);

const INPUT = 'w-full rounded-sm border border-white/10 bg-[#0f1117] px-3 py-2 text-[13px] font-ld-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400';

const DompetKuApiSandboxPage: React.FC = () => {
  const [active, setActive] = useState(2);
  const [path, setPath] = useState(ENDPOINTS[2].path);
  const [useAuth, setUseAuth] = useState(true);
  const [token, setToken] = useState('');
  const [authHeader, setAuthHeader] = useState('');
  const [idemKey, setIdemKey] = useState(newKey());
  const [sendIdem, setSendIdem] = useState(true);
  const [bodyText, setBodyText] = useState(pretty(ENDPOINTS[2].body));
  const [bodyError, setBodyError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [res, setRes] = useState<ApiResponse | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const ep = ENDPOINTS[active];

  const pick = (i: number) => {
    const e = ENDPOINTS[i];
    setActive(i);
    setPath(e.path);
    setBodyText(e.body ? pretty(e.body) : '');
    setBodyError(null);
    setUseAuth(e.auth);
    setRes(null);
  };

  const send = async () => {
    let body: unknown;
    if (ep.method === 'POST') {
      try {
        body = bodyText.trim() ? JSON.parse(bodyText) : {};
        setBodyError(null);
      } catch {
        setBodyError('Body bukan JSON yang valid.');
        return;
      }
    }
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const auth = authHeader.trim() || (token ? `Bearer ${token}` : '');
    if (useAuth && auth) headers.Authorization = auth;
    if (ep.idempotency && sendIdem && idemKey.trim()) headers['Idempotency-Key'] = idemKey.trim();
    const req: ApiRequest = { method: ep.method, path: path.trim(), headers, body };

    setSending(true);
    const r = await callMockApi(BUILD, req);
    setSending(false);
    setRes(r);
    setHistory((h) => [{ req, res: r, at: new Date().toLocaleTimeString('id-ID') }, ...h].slice(0, 12));
    // Convenience: remember the token from a successful login.
    const t = (r.body as { data?: { token?: string } })?.data?.token;
    if (ep.path === '/v1/auth/login' && r.status === 200 && t) {
      setToken(t);
      setAuthHeader('');
    }
  };

  const reset = () => {
    resetMock(BUILD);
    setToken('');
    setAuthHeader('');
    setHistory([]);
    setRes(null);
  };

  return (
    <div className="min-h-screen bg-[#0b0d12] text-slate-200 font-ld-sans">
      <Seo path="/qa-simulator/sandbox/dompetku-api" title="DompetKu API Console (Simulasi) | QA Simulator" description="Environment latihan API testing QA Simulator." noindex />

      <div className="sticky top-0 z-50 bg-amber-400 text-amber-950 text-xs">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
          <span className="font-semibold tracking-wide">STAGING · DompetKu API · api-rc1</span>
          <Link to="/qa-simulator/ewallet?phase=api-testing" className="inline-flex items-center gap-1 text-amber-950 no-underline font-medium hover:underline">
            <ArrowLeft size={12} /> QA Simulator
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-5">
        <header className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <Terminal size={18} className="text-sky-300 shrink-0" />
            <div>
              <p className="m-0 text-base font-semibold text-white">DompetKu API Console</p>
              <p className="m-0 text-[11px] text-slate-400">Simulasi di browser · data tersimpan di browser ini saja · bukan API asli</p>
            </div>
          </div>
          <button onClick={reset} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-white/10 bg-transparent text-xs text-slate-300 hover:bg-white/5 cursor-pointer">
            <RotateCcw size={12} /> Reset data uji
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-4">
          {/* endpoints */}
          <nav aria-label="Endpoint" className="rounded-md border border-white/10 bg-[#11141b] p-2 h-fit">
            <p className="m-0 px-2 pt-1 pb-2 text-xs font-medium text-slate-400">Endpoint</p>
            <ul className="m-0 p-0 list-none space-y-0.5">
              {ENDPOINTS.map((e, i) => (
                <li key={e.path}>
                  <button
                    onClick={() => pick(i)}
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded-sm text-left border-none cursor-pointer ${i === active ? 'bg-white/10' : 'bg-transparent hover:bg-white/5'}`}
                  >
                    <span className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold font-ld-mono ${METHOD_CLS[e.method]}`}>{e.method}</span>
                    <span className="min-w-0">
                      <span className="block text-xs text-slate-200 truncate">{e.label}</span>
                      <span className="block text-[10px] font-ld-mono text-slate-500 truncate">{e.path.split('?')[0]}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-2 mx-2 mb-1 pt-2 border-t border-white/10 text-[11px] text-slate-400 leading-relaxed">
              Akun uji: <span className="font-ld-mono text-slate-200">{ME}</span> · PIN <span className="font-ld-mono text-slate-200">{ME_PIN}</span>. Lihat kontrak lengkap di PRD v1.2.
            </div>
          </nav>

          <div className="space-y-4 min-w-0">
            {/* request */}
            <section className="rounded-md border border-white/10 bg-[#11141b] p-4 space-y-3">
              <div className="flex gap-2">
                <span className={`shrink-0 inline-flex items-center px-2.5 rounded-sm text-xs font-bold font-ld-mono ${METHOD_CLS[ep.method]}`}>{ep.method}</span>
                <input aria-label="Path" className={INPUT} value={path} onChange={(e) => setPath(e.target.value)} />
                <button
                  onClick={send}
                  disabled={sending}
                  className="shrink-0 inline-flex items-center gap-1.5 px-4 rounded-sm bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-white text-sm font-medium border-none cursor-pointer"
                >
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Send
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-2 mb-1.5 text-xs font-medium text-slate-400">
                    <input type="checkbox" checked={useAuth} onChange={(e) => setUseAuth(e.target.checked)} /> Authorization
                  </label>
                  <input
                    className={INPUT}
                    disabled={!useAuth}
                    placeholder={token ? `Bearer ${token}` : 'Login dulu, atau isi manual: Bearer <token>'}
                    value={authHeader}
                    onChange={(e) => setAuthHeader(e.target.value)}
                  />
                  <p className="m-0 mt-1 text-[10px] text-slate-500">
                    {token ? <>Kosongkan untuk memakai token login terakhir.</> : <>Belum login. Jalankan endpoint Login dulu.</>}
                  </p>
                </div>
                {ep.idempotency && (
                  <div>
                    <label className="flex items-center gap-2 mb-1.5 text-xs font-medium text-slate-400">
                      <input type="checkbox" checked={sendIdem} onChange={(e) => setSendIdem(e.target.checked)} /> Idempotency-Key
                    </label>
                    <div className="flex gap-2">
                      <input className={INPUT} disabled={!sendIdem} value={idemKey} onChange={(e) => setIdemKey(e.target.value)} />
                      <button title="Generate key baru" onClick={() => setIdemKey(newKey())} className="shrink-0 px-2.5 rounded-sm border border-white/10 bg-transparent text-slate-300 hover:bg-white/5 cursor-pointer">
                        <Shuffle size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {ep.method === 'POST' && (
                <div>
                  <p className="m-0 mb-1.5 text-xs font-medium text-slate-400">Body (JSON)</p>
                  <textarea
                    aria-label="Body JSON"
                    className={`${INPUT} min-h-[140px] resize-y leading-relaxed`}
                    spellCheck={false}
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                  />
                  {bodyError && <p className="m-0 mt-1 text-xs text-red-300">{bodyError}</p>}
                </div>
              )}
            </section>

            {/* response */}
            <section className="rounded-md border border-white/10 bg-[#11141b] p-4" aria-live="polite">
              <div className="flex items-center justify-between mb-2">
                <p className="m-0 text-xs font-medium text-slate-400">Response</p>
                {res && (
                  <span className="flex items-center gap-2 text-xs">
                    <span className={`px-2 py-0.5 rounded-sm font-ld-mono font-bold ${statusCls(res.status)}`}>{res.status}</span>
                    <span className="text-slate-500">{res.ms} ms</span>
                  </span>
                )}
              </div>
              {res ? (
                <pre className="m-0 max-h-[360px] overflow-auto rounded-sm bg-[#0f1117] p-3 text-[12.5px] leading-relaxed font-ld-mono text-slate-100 whitespace-pre-wrap break-all">{pretty(res.body)}</pre>
              ) : (
                <p className="m-0 py-8 text-center text-sm text-slate-500"><KeyRound size={16} className="inline -mt-0.5 mr-1" /> Kirim request untuk melihat response.</p>
              )}
            </section>

            {/* history */}
            {history.length > 0 && (
              <section className="rounded-md border border-white/10 bg-[#11141b] p-4">
                <p className="m-0 mb-2 text-xs font-medium text-slate-400">Riwayat request</p>
                <ul className="m-0 p-0 list-none divide-y divide-white/5">
                  {history.map((h, i) => (
                    <li key={i} className="flex items-center gap-2 py-1.5 text-xs">
                      <span className="text-slate-500 w-16 shrink-0">{h.at}</span>
                      <span className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold font-ld-mono ${METHOD_CLS[h.req.method]}`}>{h.req.method}</span>
                      <span className="font-ld-mono text-slate-300 truncate flex-1 min-w-0">{h.req.path}</span>
                      <span className={`px-1.5 py-0.5 rounded-sm font-ld-mono font-bold ${statusCls(h.res.status)}`}>{h.res.status}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DompetKuApiSandboxPage;
