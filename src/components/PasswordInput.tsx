import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { checkPasswordStrength, isPasswordStrong } from '../utils/passwordPolicy'

interface PasswordInputProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  showStrength?: boolean
  confirmWith?: string
  id?: string
  required?: boolean
}

export default function PasswordInput({
  value,
  onChange,
  placeholder = 'Password',
  showStrength = false,
  confirmWith,
  id,
  required = true,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const checks = showStrength ? checkPasswordStrength(value) : null
  const mismatch = confirmWith !== undefined && value.length > 0 && confirmWith.length > 0 && value !== confirmWith

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          id={id}
          className="input pr-10"
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          required={required}
          minLength={showStrength ? 8 : undefined}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          onClick={() => setVisible(v => !v)}
          aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {showStrength && value.length > 0 && checks && (
        <ul className="text-xs space-y-0.5 text-gray-500">
          <li className={checks.length ? 'text-green-600' : ''}>Min. 8 karakter</li>
          <li className={checks.upper ? 'text-green-600' : ''}>Huruf besar (A-Z)</li>
          <li className={checks.lower ? 'text-green-600' : ''}>Huruf kecil (a-z)</li>
          <li className={checks.digit ? 'text-green-600' : ''}>Angka (0-9)</li>
          <li className={checks.special ? 'text-green-600' : ''}>Karakter khusus (!@#$...)</li>
        </ul>
      )}
      {confirmWith !== undefined && mismatch && (
        <p className="text-xs text-red-500">Konfirmasi password tidak cocok</p>
      )}
      {showStrength && value.length > 0 && !isPasswordStrong(value) && (
        <p className="text-xs text-amber-600">Password belum memenuhi standar keamanan</p>
      )}
    </div>
  )
}
