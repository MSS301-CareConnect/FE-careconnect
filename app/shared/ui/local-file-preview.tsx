import { useEffect, useRef } from 'react'

export function LocalFilePreview({ file, label, image = false }: { file: File; label: string; image?: boolean }) {
  const imageRef = useRef<HTMLImageElement>(null)
  const linkRef = useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    const url = URL.createObjectURL(file)
    if (imageRef.current) imageRef.current.src = url
    if (linkRef.current) linkRef.current.href = url
    return () => URL.revokeObjectURL(url)
  }, [file])
  return image ? (
    <img ref={imageRef} alt={label} className='h-32 w-full rounded-xl object-cover' />
  ) : (
    <a
      ref={linkRef}
      className='break-all text-sm font-semibold text-primary underline'
      rel='noopener noreferrer'
      target='_blank'
    >
      {label}
    </a>
  )
}
