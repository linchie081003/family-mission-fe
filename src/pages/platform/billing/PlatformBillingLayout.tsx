import { useEffect, useState } from 'react'

import { Link, Outlet, useLocation } from 'react-router-dom'

import { api } from '../../../api'

import { BillingStats, formatRupiah } from '../../../types'



const billingNav = [

  { to: '/admin/billing', label: 'Bisnis', end: true },

  { to: '/admin/billing/verification', label: 'Verifikasi', badgePending: true },

  { to: '/admin/billing/plans', label: 'Paket' },

  { to: '/admin/billing/payments', label: 'Pembayaran' },

  { to: '/admin/billing/trials', label: 'Trial' },

  { to: '/admin/billing/payment-settings', label: 'Metode Bayar' },

]



export default function PlatformBillingLayout() {

  const location = useLocation()

  const isDashboard = location.pathname === '/admin/billing'

  const [pendingCount, setPendingCount] = useState(0)



  useEffect(() => {

    api.platformPendingPaymentCount().then(r => setPendingCount(r.count)).catch(() => undefined)

  }, [location.pathname])



  return (

    <div className="space-y-4">

      <div>

        <h2 className="text-xl font-bold text-slate-900">Billing</h2>

        <div className="flex gap-2 mt-2 flex-wrap">

          {billingNav.map(item => {

            const active = item.end

              ? location.pathname === item.to

              : location.pathname.startsWith(item.to)

            return (

              <Link

                key={item.to}

                to={item.to}

                className={`px-3 py-1 rounded-full text-xs font-semibold relative ${

                  active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'

                }`}

              >

                {item.label}

                {item.badgePending && pendingCount > 0 && (

                  <span className="ml-1 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">

                    {pendingCount}

                  </span>

                )}

              </Link>

            )

          })}

        </div>

      </div>

      {isDashboard ? <BillingDashboard /> : <Outlet />}

    </div>

  )

}



function BillingDashboard() {

  const [stats, setStats] = useState<BillingStats | null>(null)

  const [loading, setLoading] = useState(true)



  useEffect(() => {

    api.platformBillingStats().then(setStats).finally(() => setLoading(false))

  }, [])



  if (loading) return <div className="text-center py-8 text-gray-400">Memuat...</div>



  if (!stats) return <div className="card text-gray-400 text-center py-8">Data billing belum tersedia</div>



  return (

    <div className="space-y-4">

      <div className="grid grid-cols-2 gap-2">

        <div className="card bg-slate-900 text-white">

          <p className="text-xs text-slate-300">MRR</p>

          <p className="text-lg font-bold">{formatRupiah(stats.mrr)}</p>

        </div>

        <div className="card">

          <p className="text-xs text-gray-500">Revenue Bulan Ini</p>

          <p className="text-lg font-bold">{formatRupiah(stats.revenue_this_month)}</p>

        </div>

        <div className="card">

          <p className="text-xs text-gray-500">Revenue Bulan Lalu</p>

          <p className="text-lg font-bold">{formatRupiah(stats.revenue_last_month)}</p>

        </div>

        <div className="card">

          <p className="text-xs text-gray-500">Trial Aktif</p>

          <p className="text-lg font-bold">{stats.trial_active_count}</p>

        </div>

        <div className="card col-span-2">

          <p className="text-xs text-gray-500">Konversi Trial → Bayar (30 hari)</p>

          <p className="text-lg font-bold">{stats.trial_conversion_rate}%</p>

        </div>

      </div>



      {stats.tier_breakdown.length > 0 && (

        <div className="card space-y-2">

          <h3 className="font-semibold text-sm">Breakdown per Tier</h3>

          {stats.tier_breakdown.map((tier: { plan_name: string; count: number; mrr: number }) => (

            <div key={tier.plan_name} className="flex justify-between text-sm">

              <span>{tier.plan_name} ({tier.count})</span>

              <span className="font-semibold">{formatRupiah(tier.mrr)} MRR</span>

            </div>

          ))}

        </div>

      )}

    </div>

  )

}


