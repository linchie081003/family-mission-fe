import { useEffect, useState } from 'react'
import { api } from '../../api'
import { PlatformAuditEntry } from '../../types'

export default function PlatformAuditPage() {
  const [logs, setLogs] = useState<PlatformAuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.platformAudit(200)
      .then(setLogs)
      .catch(err => setError(err instanceof Error ? err.message : 'Gagal memuat audit trail'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Memuat audit trail...</div>
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Audit Trail Super Admin</h2>
        </div>
        <div className="card text-center text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Audit Trail Super Admin</h2>
        <p className="text-sm text-gray-500 mt-1">
          Riwayat enable/disable fitur tenant oleh Super Admin
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="card text-center text-gray-400">Belum ada perubahan fitur</div>
      ) : (
        <div className="space-y-2 max-h-[70vh] overflow-y-auto">
          {logs.map(log => (
            <div key={log.id} className="card py-3 border border-slate-100">
              <div className="flex justify-between items-start gap-2">
                <p className="text-sm font-semibold text-slate-800">{log.summary}</p>
                <span className={`text-[10px] uppercase font-bold shrink-0 ${log.enabled ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {log.enabled ? 'ON' : 'OFF'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Fitur: {log.feature_key} · Tenant #{log.family_id}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                {new Date(log.created_at).toLocaleString('id-ID')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
