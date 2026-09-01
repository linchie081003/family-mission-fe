import { Link } from 'react-router-dom'

interface Props {
  message?: string
}

export default function FeatureUpgradeBanner({ message }: Props) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p className="font-semibold">Fitur premium belum aktif</p>
      <p className="mt-1 text-amber-800">
        {message || 'Upgrade paket keluarga Anda untuk mengaktifkan fitur ini.'}
      </p>
      <Link to="/parent/upgrade" className="inline-block mt-2 text-xs font-semibold text-indigo-700">
        Lihat paket upgrade →
      </Link>
    </div>
  )
}
