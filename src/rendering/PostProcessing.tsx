// ============================================================
// SnowRush — Post Processing Pipeline
// ============================================================

import React from 'react';
import { EffectComposer, Bloom, Vignette, DepthOfField } from '@react-three/postprocessing';
import { useSettingsStore } from '../store/settingsStore';
import { BlendFunction } from 'postprocessing';

const PostProcessing: React.FC = () => {
  const quality = useSettingsStore((s) => s.quality);

  if (quality === 'LOW') return null;

  return (
    <EffectComposer disableNormalPass multisampling={quality === 'HIGH' ? 4 : 0}>
      <Bloom
        intensity={0.8}
        luminanceThreshold={0.8}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      
      {quality === 'HIGH' && (
        <DepthOfField
          focusDistance={0.01}
          focalLength={0.02}
          bokehScale={2}
        />
      )}
      
      <Vignette
        offset={0.4}
        darkness={0.5}
        blendFunction={BlendFunction.MULTIPLY}
      />
    </EffectComposer>
  );
};

export default PostProcessing;
