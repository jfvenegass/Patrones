import { useEffect, useMemo, useState } from 'react';
import { api } from './api';
import type { TableReport } from './types';

type SortKey = 'studentCode' | 'studentName' | 'assessmentType' | 'score' | 'maxScore' | 'percentage';

export default function App() {
  // Inputs
  const [nrcId, setNrcId] = useState('');
  const [title, setTitle] = useState('Reporte de Calificaciones');

  // Data & loading
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TableReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [q, setQ] = useState(''); // búsqueda por nombre/código
  const [assessment, setAssessment] = useState<'all' | string>('all');
  const [minPerc, setMinPerc] = useState(0);
  const [maxPerc, setMaxPerc] = useState(100);
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(100);

  // Orden
  const [sortBy, setSortBy] = useState<SortKey>('studentName');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Paginación
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Traer reporte
  const fetchReport = async () => {
    if (!nrcId) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await api.get<TableReport>('/reports/generate', { 
        params: { nrcId, title, pageSize: 10 } 
      });
      console.log('API URL:', res.request?.responseURL || api.defaults.baseURL);
      console.log('filasBack:', res.data.rows.length, 'metaTotal:', res.data.meta.total);
      setData(res.data);
      // Ajustar rangos a los valores reales
      const sMax = Math.max(...res.data.rows.map(r => r.score), 0);
      setMaxScore(Math.max(100, Math.ceil(sMax)));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Error al cargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  // Reset de filtros al cambiar de NRC
  useEffect(() => {
    setQ('');
    setAssessment('all');
    setMinPerc(0);
    setMaxPerc(100);
    setMinScore(0);
    setMaxScore(100);
    setPage(1);
  }, [nrcId]);

  // Valores únicos de evaluación
  const assessmentOptions = useMemo(() => {
    if (!data) return [];
    const set = new Set(data.rows.map(r => r.assessmentType));
    return Array.from(set);
  }, [data]);

  // Filtrado + orden + paginado (memo)
  const filteredSortedPaged = useMemo(() => {
    if (!data) return { rows: [], total: 0 };
    const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

    const rows = data.rows
      .filter(r => (assessment === 'all' ? true : r.assessmentType === assessment))
      .filter(r => r.percentage >= minPerc && r.percentage <= maxPerc)
      .filter(r => r.score >= minScore && r.score <= maxScore)
      .filter(r => {
        if (!q.trim()) return true;
        const needle = norm(q);
        return norm(r.studentName).includes(needle) || norm(r.studentCode).includes(needle);
      })
      .sort((a, b) => {
        const dir = sortDir === 'asc' ? 1 : -1;
        const va = a[sortBy];
        const vb = b[sortBy];
        if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
        return String(va).localeCompare(String(vb)) * dir;
      });

    const total = rows.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return { rows: rows.slice(start, end), total };
  }, [data, assessment, minPerc, maxPerc, minScore, maxScore, q, sortBy, sortDir, page, pageSize]);

  const totalPages = useMemo(() => {
    if (!data) return 1;
    const totalFiltered = filteredSortedPaged.total;
    return Math.max(1, Math.ceil(totalFiltered / pageSize));
  }, [filteredSortedPaged.total, pageSize, data]);

  const changeSort = (key: SortKey) => {
    if (key === sortBy) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(key);
      setSortDir('asc');
    }
  };

  // Exportar CSV / JSON
  const downloadCSV = () => {
    if (!data) return;
    const header = ['Codigo', 'Estudiante', 'Evaluacion', 'Puntaje', 'Maximo', 'Porcentaje'];
    const rows = data.rows.map(r => [r.studentCode, r.studentName, r.assessmentType, r.score, r.maxScore, r.percentage + '%']);
    const csv = [header, ...rows].map(line => line.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, `${data.meta.title.replace(/\s+/g, '_')}_${data.meta.nrcId}.csv`);
  };

  const downloadJSON = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    triggerDownload(blob, `${data.meta.title.replace(/\s+/g, '_')}_${data.meta.nrcId}.json`);
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setQ('');
    setAssessment('all');
    setMinPerc(0);
    setMaxPerc(100);
    setMinScore(0);
    setMaxScore(100);
    setSortBy('studentName');
    setSortDir('asc');
    setPage(1);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container">
          <h1>Reportes Académicos</h1>
          <p className="muted">
            Ingresa un <b>nrcId</b> y genera el reporte.
          </p>

          <div className="grid">
            <input
              className="input"
              placeholder="nrcId (UUID)"
              value={nrcId}
              onChange={(e) => setNrcId(e.target.value)}
            />
            <input
              className="input"
              placeholder="Título del reporte"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button className="btn primary" onClick={fetchReport} disabled={!nrcId || loading}>
              {loading ? 'Cargando…' : 'Generar'}
            </button>
          </div>

          {error && <div className="alert">{error}</div>}
        </div>
      </header>

      {/* Contenido */}
      <main className="container">

        {data && (
          <>
            {/* Meta + acciones */}
            <section className="toolbar">
              <div>
                <h2 className="title">{data.meta.title}</h2>
                <div className="meta">
                  NRC: <b>{data.meta.nrcId}</b> • Total filas: <b>{data.meta.total}</b> • Promedio: <b>{data.meta.avgScore}</b>
                </div>
              </div>
              <div className="actions">
                <button className="btn ghost" onClick={downloadJSON}>Descargar JSON</button>
                <button className="btn ghost" onClick={downloadCSV}>Descargar CSV</button>
              </div>
            </section>

            {/* Filtros */}
            <section className="filters card">
              <div className="filters-row">
                <div className="filter">
                  <label>Búsqueda</label>
                  <input className="input" placeholder="Código o nombre…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
                </div>

                <div className="filter">
                  <label>Evaluación</label>
                  <select
                    className="input"
                    value={assessment}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(e) => { setAssessment(e.target.value as any); setPage(1); }}
                  >
                    <option value="all">Todas</option>
                    {assessmentOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="filter">
                  <label>Porcentaje ({minPerc}%–{maxPerc}%)</label>
                  <div className="range">
                    <input type="range" min={0} max={100} value={minPerc} onChange={e => { setMinPerc(Number(e.target.value)); setPage(1); }} />
                    <input type="range" min={0} max={100} value={maxPerc} onChange={e => { setMaxPerc(Number(e.target.value)); setPage(1); }} />
                  </div>
                </div>

                <div className="filter">
                  <label>Puntaje ({minScore}–{maxScore})</label>
                  <div className="range">
                    <input type="range" min={0} max={100} value={minScore} onChange={e => { setMinScore(Number(e.target.value)); setPage(1); }} />
                    <input type="range" min={0} max={100} value={maxScore} onChange={e => { setMaxScore(Number(e.target.value)); setPage(1); }} />
                  </div>
                </div>

                <div className="filter">
                  <label>Orden</label>
                  <div className="row">
                    <select className="input" value={sortBy} onChange={e => setSortBy(e.target.value as SortKey)}>
                      <option value="studentName">Estudiante</option>
                      <option value="studentCode">Código</option>
                      <option value="assessmentType">Evaluación</option>
                      <option value="score">Puntaje</option>
                      <option value="maxScore">Máximo</option>
                      <option value="percentage">% Nota</option>
                    </select>
                    <button className="btn small" onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}>
                      {sortDir === 'asc' ? 'Asc' : 'Desc'}
                    </button>
                  </div>
                </div>

                <div className="filter">
                  <label>Página</label>
                  <div className="row">
                    <button className="btn small" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>{'<'}</button>
                    <span className="pager">{page}/{totalPages}</span>
                    <button className="btn small" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>{'>'}</button>
                  </div>
                </div>

                <div className="filter">
                  <label>Filas</label>
                  <select className="input" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <div className="filter">
                  <label>&nbsp;</label>
                  <button className="btn danger" onClick={resetFilters}>Limpiar filtros</button>
                </div>
              </div>
            </section>

            {/* Tabla */}
            <section className="table-wrap card">
              <div className="table-scroll">
                <table className="table">
                  <thead>
                    <tr>
                      <Th label="Código" sortKey="studentCode" sortBy={sortBy} sortDir={sortDir} onSort={changeSort} />
                      <Th label="Estudiante" sortKey="studentName" sortBy={sortBy} sortDir={sortDir} onSort={changeSort} />
                      <Th label="Evaluación" sortKey="assessmentType" sortBy={sortBy} sortDir={sortDir} onSort={changeSort} />
                      <Th label="Puntaje" sortKey="score" sortBy={sortBy} sortDir={sortDir} onSort={changeSort} />
                      <Th label="Máximo" sortKey="maxScore" sortBy={sortBy} sortDir={sortDir} onSort={changeSort} />
                      <Th label="%" sortKey="percentage" sortBy={sortBy} sortDir={sortDir} onSort={changeSort} />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSortedPaged.rows.map((r, i) => (
                      <tr key={i}>
                        <td>{r.studentCode}</td>
                        <td>{r.studentName}</td>
                        <td><span className="tag">{r.assessmentType}</span></td>
                        <td>{r.score}</td>
                        <td>{r.maxScore}</td>
                        <td><b className={r.percentage >= 60 ? 'ok' : 'bad'}>{r.percentage}%</b></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredSortedPaged.total === 0 && (
                <div className="empty">No hay resultados con los filtros actuales.</div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function Th({
  label, sortKey, sortBy, sortDir, onSort,
}: {
  label: string;
  sortKey: SortKey;
  sortBy: SortKey;
  sortDir: 'asc' | 'desc';
  onSort: (k: SortKey) => void;
}) {
  const active = sortKey === sortBy;
  return (
    <th onClick={() => onSort(sortKey)} className={active ? 'th-active' : ''}>
      <span>{label}</span>
      <span className="sort">{active ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
    </th>
  );
}
