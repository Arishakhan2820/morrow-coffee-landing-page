import { useEffect, useRef, useState, type ReactNode } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const FRAME_COUNT = 240;
const MAX_CONCURRENT_FETCHES = 4;
const MAX_CONCURRENT_DECODES = 2;
const MAX_CACHED_BITMAPS = 12;

const chapters = [
  { end: 0.18, eyebrow: "01 — THE COFFEE", title: "Good coffee\nstarts with care." },
  { end: 0.4, eyebrow: "02 — SLOW BREWED", title: "Patiently brewed,\nserved over ice." },
  { end: 0.67, eyebrow: "03 — THE POUR", title: "Bold espresso,\nsoftened with milk." },
  { end: 0.85, eyebrow: "04 — THE FLAVOUR", title: "A little caramel,\na longer finish." },
  { end: 1, eyebrow: "05 — YOUR COFFEE MOMENT", title: "Your everyday\nritual, reimagined." },
];

interface ScrollSequenceProps {
  header: ReactNode;
  opening: ReactNode;
}

function getFramePath(frame: number) {
  return `/frames/frame_${String(frame).padStart(4, "0")}.webp?v=3`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function ScrollSequence({ header, opening }: ScrollSequenceProps) {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const openingRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [canvasReady, setCanvasReady] = useState(false);
  const [frameError, setFrameError] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const openingOverlay = openingRef.current;
    const titleOverlay = titleRef.current;
    const counter = counterRef.current;
    const context = canvas?.getContext("2d", { alpha: false });

    if (!track || !stage || !canvas || !openingOverlay || !titleOverlay || !context) {
      throw new Error("The cinematic canvas could not be initialized.");
    }

    const frameBlobs = new Map<number, Blob>();
    const bitmaps = new Map<number, ImageBitmap>();
    const loadingFrames = new Set<number>();
    const failedFrames = new Set<number>();
    const controllers = new Set<AbortController>();
    let urgentFrames: number[] = [];
    let currentFrame = 0;
    let currentProgress = 0;
    let nextBackgroundFrame = 0;
    let loadedFrames = 0;
    let activeFetches = 0;
    let activeDecodes = 0;
    let scheduledRender = 0;
    let hasDrawnFrame = false;
    let disposed = false;

    const trimBitmapCache = () => {
      const nearestFrames = Array.from(bitmaps.keys()).sort(
        (a, b) => Math.abs(a - currentFrame) - Math.abs(b - currentFrame),
      );

      for (const frame of nearestFrames.slice(MAX_CACHED_BITMAPS)) {
        bitmaps.get(frame)?.close();
        bitmaps.delete(frame);
      }
    };

    const drawFrame = () => {
      scheduledRender = 0;
      if (disposed || bitmaps.size === 0) return;

      const selectedFrame = bitmaps.has(currentFrame)
        ? currentFrame
        : Array.from(bitmaps.keys()).reduce((nearest, candidate) =>
            Math.abs(candidate - currentFrame) < Math.abs(nearest - currentFrame)
              ? candidate
              : nearest,
          );
      const bitmap = bitmaps.get(selectedFrame);

      if (!bitmap) return;

      const { width, height } = canvas;
      const scale = Math.max(width / bitmap.width, height / bitmap.height);
      const drawWidth = bitmap.width * scale;
      const drawHeight = bitmap.height * scale;
      context.drawImage(
        bitmap,
        (width - drawWidth) / 2,
        (height - drawHeight) / 2,
        drawWidth,
        drawHeight,
      );

      if (!hasDrawnFrame) {
        hasDrawnFrame = true;
        setCanvasReady(true);
      }
      if (stage.dataset.ready !== "true") stage.dataset.ready = "true";
    };

    const scheduleRender = () => {
      if (scheduledRender === 0) scheduledRender = window.requestAnimationFrame(drawFrame);
    };

    const pumpDecodes = () => {
      while (!disposed && activeDecodes < MAX_CONCURRENT_DECODES) {
        const nextFrame = wantedFrames.find(
          (frame) => frameBlobs.has(frame) && !bitmaps.has(frame) && !loadingFrames.has(frame),
        );

        if (nextFrame === undefined) return;

        const blob = frameBlobs.get(nextFrame);
        if (!blob) continue;

        loadingFrames.add(nextFrame);
        activeDecodes += 1;

        void createImageBitmap(blob)
          .then((bitmap) => {
            if (disposed) {
              bitmap.close();
              return;
            }

            bitmaps.set(nextFrame, bitmap);
            trimBitmapCache();
            scheduleRender();
          })
          .catch(() => {
            failedFrames.add(nextFrame);
            if (nextFrame === currentFrame) setFrameError(true);
          })
          .finally(() => {
            loadingFrames.delete(nextFrame);
            activeDecodes -= 1;
            pumpDecodes();
          });
      }
    };

    let wantedFrames: number[] = [];

    const pumpFetches = () => {
      while (!disposed && activeFetches < MAX_CONCURRENT_FETCHES) {
        let nextFrame: number | undefined;

        while (urgentFrames.length > 0 && nextFrame === undefined) {
          const candidate = urgentFrames.shift();
          if (
            candidate !== undefined &&
            !frameBlobs.has(candidate) &&
            !loadingFrames.has(candidate) &&
            !failedFrames.has(candidate)
          ) {
            nextFrame = candidate;
          }
        }

        while (nextFrame === undefined && nextBackgroundFrame < FRAME_COUNT) {
          const candidate = nextBackgroundFrame;
          nextBackgroundFrame += 1;

          if (
            !frameBlobs.has(candidate) &&
            !loadingFrames.has(candidate) &&
            !failedFrames.has(candidate)
          ) {
            nextFrame = candidate;
          }
        }

        if (nextFrame === undefined) return;

        const frame = nextFrame;
        const controller = new AbortController();
        controllers.add(controller);
        loadingFrames.add(frame);
        activeFetches += 1;

        void fetch(getFramePath(frame), { cache: "force-cache", signal: controller.signal })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Frame ${frame} returned HTTP ${response.status}.`);
            }
            return response.blob();
          })
          .then((blob) => {
            if (disposed) return;

            frameBlobs.set(frame, blob);
            loadedFrames += 1;
            if (loadedFrames === FRAME_COUNT || loadedFrames % 16 === 0) {
              setLoadedCount(loadedFrames);
              stage.style.setProperty("--frames-loaded", `${(loadedFrames / FRAME_COUNT) * 100}%`);
            }
          })
          .catch((error: unknown) => {
            if (error instanceof Error && error.name === "AbortError") return;

            failedFrames.add(frame);
            if (frame === currentFrame) setFrameError(true);
          })
          .finally(() => {
            controllers.delete(controller);
            loadingFrames.delete(frame);
            activeFetches -= 1;
            pumpDecodes();
            pumpFetches();
          });
      }
    };

    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(bounds.width * ratio));
      const height = Math.max(1, Math.round(bounds.height * ratio));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        context.fillStyle = "#080706";
        context.fillRect(0, 0, width, height);
        scheduleRender();
      }
    };

    const prioritizeFrames = (frame: number) => {
      if (failedFrames.has(frame)) setFrameError(true);

      wantedFrames = Array.from({ length: 15 }, (_, index) => frame + index - 6)
        .filter((candidate) => candidate >= 0 && candidate < FRAME_COUNT)
        .sort(
          (a, b) =>
            Math.abs(a - frame) + (a < frame ? 1 : 0) -
            (Math.abs(b - frame) + (b < frame ? 1 : 0)),
        );

      urgentFrames = [frame, frame + 1, frame - 1].filter(
        (candidate) => candidate >= 0 && candidate < FRAME_COUNT,
      );

      for (const candidate of wantedFrames) {
        if (!frameBlobs.has(candidate) && !loadingFrames.has(candidate)) {
          pumpFetches();
        }
      }

      pumpDecodes();
    };

    const updateProgress = (nextProgress: number) => {
      currentProgress = nextProgress;
      const counterValue = Math.round(nextProgress * 100);
      if (counter) counter.textContent = String(counterValue).padStart(2, "0");

      const heroOpacity = 1 - clamp(nextProgress / 0.075, 0, 1);
      openingOverlay.style.opacity = String(heroOpacity);
      openingOverlay.style.transform = `translateY(${-18 * nextProgress}vh)`;
      openingOverlay.style.pointerEvents = heroOpacity > 0.05 ? "auto" : "none";

      const chapterOpacity = clamp((nextProgress - 0.055) / 0.075, 0, 1);
      titleOverlay.style.opacity = String(chapterOpacity);
      titleOverlay.style.transform = `translateY(${14 * (1 - chapterOpacity)}px)`;
      titleOverlay.style.pointerEvents = chapterOpacity > 0.05 ? "auto" : "none";
      stage.style.setProperty("--sequence-progress", String(nextProgress));

      const nextChapterIndex = chapters.findIndex((chapter) => nextProgress < chapter.end);
      const resolvedChapterIndex = nextChapterIndex < 0 ? chapters.length - 1 : nextChapterIndex;
      setChapterIndex((previous) =>
        previous === resolvedChapterIndex ? previous : resolvedChapterIndex,
      );
    };

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas);
    resizeCanvas();

    prioritizeFrames(prefersReducedMotion ? FRAME_COUNT - 1 : 0);
    updateProgress(prefersReducedMotion ? 1 : 0);
    setLoadedCount(loadedFrames);

    const trigger = ScrollTrigger.create({
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        currentProgress = prefersReducedMotion ? 1 : self.progress;
        currentFrame = Math.min(
          FRAME_COUNT - 1,
          Math.round(currentProgress * (FRAME_COUNT - 1)),
        );

        if (Math.round(currentProgress * 100) !== Number(counter?.textContent)) {
          updateProgress(currentProgress);
        }

        scheduleRender();
        prioritizeFrames(currentFrame);
        trimBitmapCache();
      },
    });

    ScrollTrigger.refresh();

    return () => {
      disposed = true;
      trigger.kill();
      resizeObserver.disconnect();
      if (scheduledRender !== 0) window.cancelAnimationFrame(scheduledRender);
      controllers.forEach((controller) => controller.abort());
      bitmaps.forEach((bitmap) => bitmap.close());
      bitmaps.clear();
      frameBlobs.clear();
      loadingFrames.clear();
      urgentFrames = [];
      wantedFrames = [];
    };
  }, []);

  const activeChapter = chapters[chapterIndex] ?? chapters[0];

  return (
    <section
      ref={trackRef}
      className="sequence-track"
      aria-label="The making of a Morrow iced coffee"
      id="home"
    >
      <div ref={stageRef} className="sequence-stage" id="story">
        <img
          className="sequence-poster"
          src={getFramePath(0)}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
        />
        <canvas
          ref={canvasRef}
          className={`sequence-canvas${canvasReady ? " is-ready" : ""}`}
          aria-hidden="true"
          role="presentation"
        />
        <div className="sequence-vignette" aria-hidden="true" />
        <div className="sequence-grain" aria-hidden="true" />
        {header}
        <div className="opening-overlay" ref={openingRef}>
          {opening}
        </div>
        <div className="sequence-content">
          <div className="sequence-title" ref={titleRef}>
            <span className="chapter-label">{activeChapter.eyebrow}</span>
            <h2>{activeChapter.title}</h2>
          </div>
          <div className="sequence-bottom">
            <span className="sequence-caption">A slower kind of coffee</span>
            <div
              className="sequence-load"
              role="progressbar"
              aria-label="Frames loaded"
              aria-valuemin={0}
              aria-valuemax={FRAME_COUNT}
              aria-valuenow={loadedCount}
            >
              <span className="sequence-load-label">SEQUENCE</span>
              <span className="sequence-load-count">
                {String(loadedCount).padStart(3, "0")} / {FRAME_COUNT}
              </span>
            </div>
            <span className="scroll-cue">
              <span className="scroll-cue-line" />
              SCROLL TO SLOW DOWN
            </span>
            <span className="sequence-counter">
              <span ref={counterRef}>00</span>
              <span> / 100</span>
            </span>
          </div>
          <div className="frame-load-progress" aria-hidden="true">
            <span />
          </div>
          {frameError && (
            <p className="sequence-error" role="status">
              A few image frames could not load. Check your connection and refresh the page.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
