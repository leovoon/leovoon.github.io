import { LazyMotion, m, domAnimation } from 'motion/react';
import { useMemo, type ReactElement } from 'react';
import './ProgressStarFlight.css';

export type ProgressStarFlightRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type ProgressStarFlightEvent = {
  id: number;
  sourceCellId: string;
  sourceRect: ProgressStarFlightRect;
  targetRect: ProgressStarFlightRect;
};

type Point = {
  x: number;
  y: number;
};

const MIN_ARC_Y = 48;

function getRectCenter(rect: ProgressStarFlightRect): Point {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

function getArcPoint(start: Point, end: Point): Point {
  const distance = Math.hypot(end.x - start.x, end.y - start.y);
  const lift = Math.min(64, Math.max(28, distance * 0.075));

  return {
    x: start.x + (end.x - start.x) * 0.45,
    y: Math.max(MIN_ARC_Y, start.y + (end.y - start.y) * 0.45 - lift),
  };
}

function getDuration(start: Point, end: Point): number {
  const distance = Math.hypot(end.x - start.x, end.y - start.y);

  return Math.min(0.82, Math.max(0.56, distance / 950));
}

function ProgressStarFlightLayer({
  flight,
  onComplete,
}: {
  flight: ProgressStarFlightEvent;
  onComplete: () => void;
}): ReactElement {
  const path = useMemo(() => {
    const start = getRectCenter(flight.sourceRect);
    const end = getRectCenter(flight.targetRect);
    const arc = getArcPoint(start, end);
    const duration = getDuration(start, end);

    return { start, arc, end, duration };
  }, [flight]);

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className="progress-star-flight"
        aria-hidden="true"
        initial={{
          x: path.start.x,
          y: path.start.y,
          scale: 0.22,
          opacity: 0,
          rotate: -18,
        }}
        animate={{
          x: [path.start.x, path.arc.x, path.end.x],
          y: [path.start.y, path.arc.y, path.end.y],
          scale: [0.28, 1, 0.16],
          opacity: [0, 1, 0],
          rotate: [-14, 24, 68],
        }}
        transition={{
          duration: path.duration,
          times: [0, 0.62, 1],
          ease: 'easeInOut',
        }}
        onAnimationComplete={onComplete}
      >
        <span className="progress-star-flight-glow" />
        <svg
          className="progress-star-flight-star"
          viewBox="0 0 24 24"
          focusable="false"
        >
          <path d="m12 2.4 2.66 5.63 6.09.93-4.42 4.38 1.04 6.18L12 16.58 6.63 19.52l1.04-6.18-4.42-4.38 6.09-.93L12 2.4Z" />
        </svg>
      </m.div>
    </LazyMotion>
  );
}

export default function ProgressStarFlight({
  flight,
  onComplete,
}: {
  flight: ProgressStarFlightEvent | null;
  onComplete: () => void;
}): ReactElement | null {
  if (!flight) {
    return null;
  }

  return (
    <ProgressStarFlightLayer
      key={flight.id}
      flight={flight}
      onComplete={onComplete}
    />
  );
}
