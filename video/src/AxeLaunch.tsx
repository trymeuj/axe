import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export const AxeLaunch: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const entrance = spring({frame, fps, config: {damping: 16, stiffness: 110}});
  const glow = interpolate(frame, [0, 90, 180, 299], [0.3, 0.75, 0.45, 0.3]);

  return (
    <AbsoluteFill className="canvas">
      <div className="grid" />
      <div className="orb" style={{opacity: glow}} />
      <main
        className="hero"
        style={{
          opacity: entrance,
          transform: `translateY(${(1 - entrance) * 48}px) scale(${0.96 + entrance * 0.04})`,
        }}
      >
        <div className="eyebrow">INTRODUCING</div>
        <h1>AXE</h1>
        <p>Your unfair advantage on X.</p>
      </main>
      <div className="frame-count">{String(frame).padStart(3, '0')}</div>
    </AbsoluteFill>
  );
};
