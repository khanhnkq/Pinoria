import { AbsoluteFill } from 'remotion'

export const CinematicBackground = ({ dark = false }: { readonly dark?: boolean }) => {
  return (
    <AbsoluteFill
      style={{ overflow: 'hidden', backgroundColor: dark ? '#05070a' : '#ffffff' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          color: dark ? '#ffffff' : '#111111',
          opacity: dark ? 0.028 : 0.024,
          backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
    </AbsoluteFill>
  );
}
