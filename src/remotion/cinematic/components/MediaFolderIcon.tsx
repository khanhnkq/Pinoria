export const MediaFolderIcon = ({ color, id, width = 174 }: { readonly color: string; readonly id: string; readonly width?: number }) => {
  const height = width * (130 / 174)
  const gradientId = `media-folder-${id}`
  const shineId = `media-folder-shine-${id}`
  return (
    <svg width={width} height={height} viewBox="0 0 174 130" fill="none" aria-hidden="true" style={{ overflow: 'visible', filter: `drop-shadow(0 ${width * 0.11}px ${width * 0.13}px ${color}32)` }}>
      <defs>
        <linearGradient id={gradientId} x1="20" y1="12" x2="150" y2="122" gradientUnits="userSpaceOnUse">
          <stop stopColor={color} stopOpacity="0.68" />
          <stop offset="0.48" stopColor={color} stopOpacity="0.88" />
          <stop offset="1" stopColor={color} />
        </linearGradient>
        <linearGradient id={shineId} x1="22" y1="32" x2="152" y2="96" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M10 31C10 22.7 16.7 16 25 16H66C73 16 77 18.2 81.6 23.4L89 32H154C162.3 32 169 38.7 169 47V111C169 119.3 162.3 126 154 126H20C11.7 126 5 119.3 5 111V46C5 38.8 6.4 34.3 10 31Z" fill={`url(#${gradientId})`} />
      <path d="M10 48C10 39.7 16.7 33 25 33H154C162.3 33 169 39.7 169 48V111C169 119.3 162.3 126 154 126H20C11.7 126 5 119.3 5 111V48H10Z" fill={`url(#${shineId})`} />
      <rect x="32" y="101" width="110" height="9" rx="4.5" fill="#ffffff" fillOpacity="0.74" />
    </svg>
  )
}
