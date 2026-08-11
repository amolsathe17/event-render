import React, { useEffect, useRef } from 'react';

export default function WaterRippleBackground({ imageUrl = '/hero-bg.jpg', className = '' }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    let animFrameId = null;
    let width = 0;
    let height = 0;
    let simWidth = 0;
    let simHeight = 0;
    const scale = 0.75; // Higher resolution scale factor for razor-sharp visuals

    let currentBuffer = null;
    let previousBuffer = null;
    let imgData = null;
    let targetImgData = null;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    let imgLoaded = false;

    const sourceCanvas = document.createElement('canvas');
    const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
    if (sourceCtx) {
      sourceCtx.imageSmoothingEnabled = true;
      sourceCtx.imageSmoothingQuality = 'high';
    }

    const initBuffers = () => {
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;

      if (width === 0 || height === 0) return;

      canvas.width = width;
      canvas.height = height;

      simWidth = Math.floor(width * scale);
      simHeight = Math.floor(height * scale);

      currentBuffer = new Float32Array(simWidth * simHeight);
      previousBuffer = new Float32Array(simWidth * simHeight);

      sourceCanvas.width = simWidth;
      sourceCanvas.height = simHeight;

      if (imgLoaded) {
        drawScaledSource();
      }
    };

    const drawScaledSource = () => {
      if (!sourceCtx || !img.width || !img.height) return;

      const imgAspect = img.width / img.height;
      const simAspect = simWidth / simHeight;
      let drawW, drawH, drawX, drawY;

      if (simAspect > imgAspect) {
        drawW = simWidth;
        drawH = simWidth / imgAspect;
        drawX = 0;
        drawY = (simHeight - drawH) / 2;
      } else {
        drawH = simHeight;
        drawW = simHeight * imgAspect;
        drawX = (simWidth - drawW) / 2;
        drawY = 0;
      }

      sourceCtx.clearRect(0, 0, simWidth, simHeight);
      sourceCtx.drawImage(img, drawX, drawY, drawW, drawH);

      try {
        imgData = sourceCtx.getImageData(0, 0, simWidth, simHeight);
        targetImgData = ctx.createImageData(simWidth, simHeight);
      } catch (e) {
        console.error('Canvas getImageData failed:', e);
      }
    };

    img.onload = () => {
      imgLoaded = true;
      initBuffers();
    };

    const dropRipple = (x, y, radius = 5, strength = 450) => {
      if (!currentBuffer) return;
      const simX = Math.floor((x / width) * simWidth);
      const simY = Math.floor((y / height) * simHeight);

      for (let rY = -radius; rY <= radius; rY++) {
        for (let rX = -radius; rX <= radius; rX++) {
          const pX = simX + rX;
          const pY = simY + rY;
          if (pX >= 0 && pX < simWidth && pY >= 0 && pY < simHeight) {
            if (rX * rX + rY * rY <= radius * radius) {
              const idx = pY * simWidth + pX;
              currentBuffer[idx] += strength;
            }
          }
        }
      }
    };

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      dropRipple(x, y, 4, 300);
    };

    const handlePointerClick = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      dropRipple(x, y, 8, 900);
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 0) return;
      const rect = container.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      dropRipple(x, y, 5, 400);
    };

    // Ambient raindrop generator
    const autoDropTimer = setInterval(() => {
      if (width > 0 && height > 0) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        dropRipple(x, y, 5, 400);
      }
    }, 2200);

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    const updateAndRender = () => {
      if (!imgData || !targetImgData || !currentBuffer || !previousBuffer) {
        animFrameId = requestAnimationFrame(updateAndRender);
        return;
      }

      const damping = 0.965;
      const srcData = imgData.data;
      const dstData = targetImgData.data;

      // Wave propagation simulation
      for (let y = 1; y < simHeight - 1; y++) {
        const row = y * simWidth;
        for (let x = 1; x < simWidth - 1; x++) {
          const i = row + x;
          const wave =
            (previousBuffer[i - 1] +
              previousBuffer[i + 1] +
              previousBuffer[i - simWidth] +
              previousBuffer[i + simWidth]) /
              2 -
            currentBuffer[i];

          currentBuffer[i] = wave * damping;
        }
      }

      // Refraction rendering step
      for (let y = 1; y < simHeight - 1; y++) {
        const row = y * simWidth;
        for (let x = 1; x < simWidth - 1; x++) {
          const i = row + x;

          const xOffset = Math.floor(currentBuffer[i - 1] - currentBuffer[i + 1]);
          const yOffset = Math.floor(currentBuffer[i - simWidth] - currentBuffer[i + simWidth]);

          let targetX = x + xOffset;
          let targetY = y + yOffset;

          if (targetX < 0) targetX = 0;
          if (targetX >= simWidth) targetX = simWidth - 1;
          if (targetY < 0) targetY = 0;
          if (targetY >= simHeight) targetY = simHeight - 1;

          const srcIdx = (targetY * simWidth + targetX) * 4;
          const dstIdx = (y * simWidth + x) * 4;

          dstData[dstIdx] = srcData[srcIdx];
          dstData[dstIdx + 1] = srcData[srcIdx + 1];
          dstData[dstIdx + 2] = srcData[srcIdx + 2];
          dstData[dstIdx + 3] = 255;
        }
      }

      // Swap buffers
      const temp = previousBuffer;
      previousBuffer = currentBuffer;
      currentBuffer = temp;

      // Draw simulated frame to offscreen canvas and stretch to fit display canvas smooth
      tempCanvas.width = simWidth;
      tempCanvas.height = simHeight;
      if (tempCtx) {
        tempCtx.putImageData(targetImgData, 0, 0);
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(tempCanvas, 0, 0, width, height);
      }

      animFrameId = requestAnimationFrame(updateAndRender);
    };

    window.addEventListener('resize', initBuffers);
    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('click', handlePointerClick);
    container.addEventListener('touchmove', handleTouchMove);

    initBuffers();
    animFrameId = requestAnimationFrame(updateAndRender);

    return () => {
      cancelAnimationFrame(animFrameId);
      clearInterval(autoDropTimer);
      window.removeEventListener('resize', initBuffers);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('click', handlePointerClick);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, [imageUrl]);

  return (
    <div ref={containerRef} className={`absolute inset-0 z-0 overflow-hidden ${className}`}>
      {/* High-resolution sharp background image matching Landing.jsx */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `url('${imageUrl}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Dark overlay matching Landing.jsx */}
      <div className="absolute inset-0 z-0 bg-black/50 pointer-events-none" />

      {/* Dot grid texture matching Landing.jsx */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 w-full h-full object-cover block opacity-40 mix-blend-overlay pointer-events-none"
      />
    </div>
  );
}
