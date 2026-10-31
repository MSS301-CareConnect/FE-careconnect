export function validPassword(value: string) {
  return (
    value.length >= 8 &&
    new TextEncoder().encode(value).length <= 72 &&
    /[a-z]/.test(value) &&
    /[A-Z]/.test(value) &&
    /[0-9]/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  )
}
