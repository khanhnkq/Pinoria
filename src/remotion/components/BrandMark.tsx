import { CanvasImage, staticFile } from 'remotion'

export const BrandMark = ({ size = 92 }: { readonly size?: number }) => {
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 2,
        width: size,
        height: size,
        display: 'grid',
        placeItems: 'center',
        borderRadius: size * 0.27,
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(22, 136, 248, 0.24)',
        backgroundColor: '#ffffff',
      }}
    >
      <CanvasImage src={staticFile('icons/icon-128.png')} style={{ width: size, height: size }} />
    </div>
  )
}
