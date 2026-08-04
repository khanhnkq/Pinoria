import { AbsoluteFill, Easing, Interactive, interpolate } from 'remotion'
import { Backdrop } from '../components/Backdrop'
import { BrandMark } from '../components/BrandMark'
import { Cursor } from '../components/Cursor'
import { useFrameAt30 } from '../utils/useFrameAt30'

const FolderRow = ({ color, name }: { readonly color: string; readonly name: string }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '58px 1fr 58px', gap: 12, alignItems: 'center' }}>
      <div style={{ height: 58, borderRadius: 15, backgroundColor: color, border: '1px solid rgba(0,0,0,0.08)' }} />
      <div style={{ height: 58, display: 'flex', alignItems: 'center', borderRadius: 15, border: '1px solid #d4d7dc', overflow: 'hidden', backgroundColor: '#ffffff', fontSize: 18 }}>
        <span style={{ paddingLeft: 16, color: '#8a9099' }}>Downloads/</span>
        <strong style={{ fontWeight: 600, color: '#151a22' }}>{name}</strong>
      </div>
      <div style={{ height: 58, display: 'grid', placeItems: 'center', borderRadius: 15, backgroundColor: '#f0f1f3', color: '#4d5663', fontSize: 26 }}>×</div>
    </div>
  )
}

export const SettingsScene = () => {
  const frame = useFrameAt30()
  const fps = 30

  return (
    <AbsoluteFill style={{ fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif', color: '#0d1726' }}>
      <Backdrop />
      <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 1540, display: 'grid', gridTemplateColumns: '0.86fr 1.14fr', gap: 110, alignItems: 'center' }}>
          <div>
            <Interactive.Div
              name="Scene number"
              style={{
                color: '#1688f8',
                fontSize: 25,
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                opacity: interpolate(frame, [0, 0.5 * fps], [0, 1], {
                  extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1),
                }),
              }}
            >
              01 · Cấu hình một lần
            </Interactive.Div>
            <Interactive.Div
              name="Settings headline"
              style={{
                marginTop: 22,
                fontSize: 90,
                lineHeight: 1.02,
                fontWeight: 850,
                letterSpacing: '-0.065em',
                opacity: interpolate(frame, [0.12 * fps, 0.78 * fps], [0, 1], {
                  extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1),
                }),
                translate: interpolate(frame, [0.12 * fps, 0.78 * fps], ['0px 34px', '0px 0px'], {
                  extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1),
                }),
              }}
            >
              Mỗi màu.
              <br />Một folder.
            </Interactive.Div>
            <Interactive.Div
              name="Settings subtitle"
              style={{
                marginTop: 28,
                width: 580,
                color: '#647184',
                fontSize: 36,
                lineHeight: 1.34,
                fontWeight: 520,
                letterSpacing: '-0.02em',
                opacity: interpolate(frame, [0.6 * fps, 1.15 * fps], [0, 1], {
                  extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1),
                }),
              }}
            >
              Phân loại nội dung ngay khi tải, không cần dọn lại sau đó.
            </Interactive.Div>
          </div>

          <Interactive.Div
            name="Extension popup"
            style={{
              position: 'relative',
              width: 650,
              padding: 34,
              borderRadius: 34,
              backgroundColor: '#ffffff',
              border: '1px solid rgba(20, 31, 50, 0.08)',
              boxShadow: '0 45px 100px rgba(18, 41, 74, 0.18), 0 10px 30px rgba(18, 41, 74, 0.08)',
              opacity: interpolate(frame, [0.25 * fps, 1 * fps], [0, 1], {
                extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
              scale: interpolate(frame, [0.25 * fps, 1 * fps], [0.88, 1], {
                extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.spring({ damping: 200 }), output: 'perceptual-scale',
              }),
              translate: interpolate(frame, [0.25 * fps, 1 * fps], ['70px 0px', '0px 0px'], {
                extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
            }}
          >
            <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 30 }}>
              <BrandMark size={66} />
              <div>
                <div style={{ fontSize: 28, fontWeight: 820, letterSpacing: '-0.035em' }}>Phân loại tải xuống</div>
                <div style={{ marginTop: 4, color: '#707985', fontSize: 18 }}>Mỗi màu tương ứng với một folder.</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 18, fontWeight: 760 }}>
              <span>Folder &amp; màu nút</span><span style={{ color: '#8a9099', fontWeight: 600 }}>3/6</span>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              <FolderRow color="#e60023" name="Moodboard" />
              <FolderRow color="#1688f8" name="References" />
              <FolderRow color="#08a76c" name="Campaign" />
            </div>
            <div style={{ marginTop: 14, height: 56, display: 'grid', placeItems: 'center', borderRadius: 16, backgroundColor: '#eff1f3', fontSize: 18, fontWeight: 760 }}>＋ Thêm folder</div>
            <div style={{ margin: '18px 4px 22px', color: '#7b8490', fontSize: 16, lineHeight: 1.42 }}>Mỗi folder tự phân loại thành Ảnh, Video và GIF.</div>
            <div
              style={{
                height: 62,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 18,
                backgroundColor: '#e60023',
                color: '#ffffff',
                fontSize: 19,
                fontWeight: 800,
                scale: interpolate(frame, [76, 82, 90], [1, 0.97, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
              }}
            >
              Lưu các nút tải
            </div>
            <div style={{ height: 28, paddingTop: 10, color: '#168052', textAlign: 'center', fontSize: 17, fontWeight: 650, opacity: interpolate(frame, [88, 104], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
              Đã cập nhật các nút tải trên Pinterest.
            </div>
          </Interactive.Div>
        </div>
      </AbsoluteFill>
      <Cursor mode="settings" />
    </AbsoluteFill>
  )
}
