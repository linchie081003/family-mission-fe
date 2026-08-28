interface Props {
  message?: string
}

export default function FeatureUpgradeBanner({ message }: Props) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p className="font-semibold">Fitur premium belum aktif</p>
      <p className="mt-1 text-amber-800">
        {message || 'Hubungi admin Family Mission untuk mengaktifkan fitur ini untuk keluarga Anda.'}
      </p>
    </div>
  )
}
