import { useEffect, useState } from 'react'

import { api } from '../../../api'

import { Plan, formatRupiah } from '../../../types'

import {

  PLAN_FEATURE_TOGGLES,

  PlanFeatureKey,

  defaultFeaturePreset,

  featuresFromPreset,

} from '../../../utils/planFeatures'



type FeatureForm = Record<PlanFeatureKey, boolean> & { daily_mission_limit: string }



function presetToForm(preset: Record<string, unknown>): FeatureForm {

  return {

    rewards_enabled: Boolean(preset.rewards_enabled ?? true),

    mission_evidence_enabled: Boolean(preset.mission_evidence_enabled),

    quiz_enabled: Boolean(preset.quiz_enabled),

    chat_enabled: Boolean(preset.chat_enabled),

    agenda_enabled: Boolean(preset.agenda_enabled),

    daily_mission_limit:

      preset.daily_mission_limit != null ? String(preset.daily_mission_limit) : '',

  }

}



function formToPreset(form: FeatureForm): Record<string, unknown> {

  const raw = form.daily_mission_limit.trim()

  return {

    rewards_enabled: form.rewards_enabled,

    mission_evidence_enabled: form.mission_evidence_enabled,

    quiz_enabled: form.quiz_enabled,

    chat_enabled: form.chat_enabled,

    agenda_enabled: form.agenda_enabled,

    daily_mission_limit: raw === '' ? null : Number(raw),

  }

}



export default function PlatformPlansPage() {

  const [plans, setPlans] = useState<Plan[]>([])

  const [loading, setLoading] = useState(true)

  const [editId, setEditId] = useState<number | null>(null)

  const [form, setForm] = useState({

    price_monthly: 0,

    price_yearly: 0,

    trial_days: 14,

    name: '',

    description: '',

  })

  const [featureForm, setFeatureForm] = useState<FeatureForm>(presetToForm(defaultFeaturePreset('basic')))



  const load = () => {

    setLoading(true)

    api.platformPlans().then(setPlans).finally(() => setLoading(false))

  }



  useEffect(() => { load() }, [])



  const startEdit = (plan: Plan) => {

    const preset = plan.feature_preset && Object.keys(plan.feature_preset).length > 0

      ? plan.feature_preset

      : defaultFeaturePreset(plan.slug)

    setEditId(plan.id)

    setForm({

      price_monthly: plan.price_monthly,

      price_yearly: plan.price_yearly,

      trial_days: plan.trial_days,

      name: plan.name,

      description: plan.description || '',

    })

    setFeatureForm(presetToForm(preset))

  }



  const save = async (plan: Plan) => {

    await api.platformUpdatePlan(plan.id, {

      ...form,

      feature_preset: formToPreset(featureForm),

    })

    setEditId(null)

    load()

  }



  const toggle = async (plan: Plan) => {

    await api.platformTogglePlan(plan.id, !plan.is_active)

    load()

  }



  if (loading) return <div className="text-center py-8 text-gray-400">Memuat paket...</div>



  return (

    <div className="space-y-3">

      {plans.map(plan => {

        const preset = plan.feature_preset && Object.keys(plan.feature_preset).length > 0

          ? plan.feature_preset

          : defaultFeaturePreset(plan.slug)

        const summary = featuresFromPreset(preset)



        return (

          <div key={plan.id} className="card space-y-2">

            <div className="flex justify-between items-start">

              <div>

                <p className="font-bold">{plan.name} <span className="text-xs text-gray-400">({plan.slug})</span></p>

                <p className="text-sm text-gray-500">{plan.description}</p>

                <p className="text-xs text-gray-400 mt-1">{plan.subscriber_count} subscriber · trial {plan.trial_days} hari</p>

              </div>

              <span className={`text-xs font-bold uppercase ${plan.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>

                {plan.is_active ? 'Aktif' : 'Off'}

              </span>

            </div>



            {editId !== plan.id && summary.ok.length > 0 && (

              <div className="flex flex-wrap gap-1">

                {summary.ok.map(f => (

                  <span key={f} className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">{f}</span>

                ))}

              </div>

            )}



            {editId === plan.id ? (

              <div className="space-y-2">

                <input className="input w-full" placeholder="Nama paket" value={form.name}

                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />

                <input className="input w-full" placeholder="Deskripsi" value={form.description}

                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

                <input type="number" className="input w-full" placeholder="Harga bulanan" value={form.price_monthly}

                  onChange={e => setForm(f => ({ ...f, price_monthly: Number(e.target.value) }))} />

                <input type="number" className="input w-full" placeholder="Harga tahunan" value={form.price_yearly}

                  onChange={e => setForm(f => ({ ...f, price_yearly: Number(e.target.value) }))} />

                <input type="number" className="input w-full" placeholder="Trial days" value={form.trial_days}

                  onChange={e => setForm(f => ({ ...f, trial_days: Number(e.target.value) }))} />



                <p className="text-sm font-semibold pt-1">Detail Fitur</p>

                {PLAN_FEATURE_TOGGLES.map(f => (

                  <button

                    key={f.key}

                    type="button"

                    onClick={() => setFeatureForm(ff => ({ ...ff, [f.key]: !ff[f.key] }))}

                    className={`w-full flex justify-between items-center rounded-lg px-3 py-2 border text-xs font-semibold ${

                      featureForm[f.key]

                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'

                        : 'bg-slate-50 border-slate-200 text-slate-600'

                    }`}

                  >

                    {f.label}

                    <span>{featureForm[f.key] ? 'ON' : 'OFF'}</span>

                  </button>

                ))}

                <input

                  type="number"

                  min={1}

                  className="input w-full"

                  placeholder="Batas misi/hari (kosong = unlimited)"

                  value={featureForm.daily_mission_limit}

                  onChange={e => setFeatureForm(ff => ({ ...ff, daily_mission_limit: e.target.value }))}

                />



                <div className="flex gap-2">

                  <button type="button" className="btn-primary flex-1 text-sm" onClick={() => save(plan)}>Simpan</button>

                  <button type="button" className="btn-secondary flex-1 text-sm" onClick={() => setEditId(null)}>Batal</button>

                </div>

              </div>

            ) : (

              <div className="flex justify-between items-center">

                <p className="text-sm">{formatRupiah(plan.price_monthly)}/bln · {formatRupiah(plan.price_yearly)}/thn</p>

                <div className="flex gap-2">

                  <button type="button" className="text-xs text-indigo-600 font-semibold" onClick={() => startEdit(plan)}>

                    Edit

                  </button>

                  <button type="button" className="text-xs text-slate-500 font-semibold" onClick={() => toggle(plan)}>

                    {plan.is_active ? 'Nonaktifkan' : 'Aktifkan'}

                  </button>

                </div>

              </div>

            )}

          </div>

        )

      })}

    </div>

  )

}


