export interface PasswordChecks {
  length: boolean
  upper: boolean
  lower: boolean
  digit: boolean
  special: boolean
}

export function checkPasswordStrength(password: string): PasswordChecks {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    digit: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>_\-\+=\[\]\\;/'`~]/.test(password),
  }
}

export function isPasswordStrong(password: string): boolean {
  const c = checkPasswordStrength(password)
  return c.length && c.upper && c.lower && c.digit && c.special
}

export function passwordsMatch(a: string, b: string): boolean {
  return a.length > 0 && a === b
}
