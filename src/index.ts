import {
  balloonDefaultSize,
  createBallonElement,
  svgFiltersHtml,
} from "./balloonSvg";

const easings = [
  // easeOutQuint
  "cubic-bezier(0.22, 1, 0.36, 1)",
  // easeOutCubic
  "cubic-bezier(0.33, 1, 0.68, 1)",
];
const colorPairs = [
  // yellow
  ["#ffec37ee", "#f8b13dff"],
  // red
  ["#f89640ee", "#c03940ff"],
  //blue
  ["#3bc0f0ee", "#0075bcff"],
  // green
  ["#b0cb47ee", "#3d954bff"],
  // purple
  ["#cf85b8ee", "#a3509dff"],
];

function createBalloonAnimation({
  balloon,
  x,
  y,
  z,
  targetX,
  targetY,
  targetZ,
  zIndex,
}: {
  balloon: HTMLElement;
  x: number;
  y: number;
  z: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  zIndex: number;
}) {
  balloon.style.zIndex = zIndex.toString();
  // Add blur to the closes ballons for bokeh effect
  balloon.style.filter = `blur(${zIndex > 7 ? 8 : 0}px)`;
  const getAnimation = () => {
    const tiltAngle = Math.random() * (15 - 8) + 8; // Random tilt angle between 8 and 15 degrees
    const tiltDirection = Math.random() < 0.5 ? 1 : -1; // Random tilt direction
    return balloon.animate(
      [
        {
          transform: `translate(-50%, 0%) translate3d(${x}px, ${y}px, ${z}px) rotate3d(0, 0, 1, ${
            tiltDirection * -tiltAngle
          }deg)`,
          opacity: 1,
        },
        {
          transform: `translate(-50%, 0%) translate3d(${
            x + (targetX - x) / 2
          }px, ${y + (y + targetY * 5 - y) / 2}px, ${
            z + (targetZ - z) / 2
          }px) rotate3d(0, 0, 1, ${tiltDirection * tiltAngle}deg)`,
          opacity: 1,
          offset: 0.5,
        },
        {
          transform: `translate(-50%, 0%) translate3d(${targetX}px, ${
            y + targetY * 5
          }px, ${targetZ}px) rotate3d(0, 0, 1, ${
            tiltDirection * -tiltAngle
          }deg)`,
          opacity: 1,
        },
      ],
      {
        duration: (Math.random() * 1000 + 5000) * 5,
        easing: easings[Math.floor(Math.random() * easings.length)],
        delay: zIndex * 200,
      }
    );
  };
  return { balloon, getAnimation };
}

export function balloons(): Promise<void> {
  return new Promise((resolve) => {
    const balloonsContainer = document.createElement("balloons");

    Object.assign(balloonsContainer.style, {
      overflow: "hidden",
      position: "fixed",
      inset: "0",
      zIndex: "999",
      display: "inline-block",
      pointerEvents: "none",
      perspective: "1500px",
      perspectiveOrigin: "50vw 100vh",
      contain: "style, layout, paint",
    });

    document.documentElement.appendChild(balloonsContainer);

    const sceneSize = { width: window.innerWidth, height: window.innerHeight };
    // make balloon height relative to screen size for this nice bokeh/perspective effect
    const balloonHeight = Math.floor(
      Math.min(sceneSize.width, sceneSize.height) * 1
    );

    const balloonWidth =
      (balloonDefaultSize.width / balloonDefaultSize.height) * balloonHeight;
    let amount = Math.max(
      7,
      Math.round(window.innerWidth / (balloonWidth / 2))
    );
    // make max dist depend on number of balloons and their size for realistic effect
    // we dont want them to be too separated or too squeezed together
    const maxDist = Math.max(
      (amount * balloonWidth) / 2,
      (balloonWidth / 2) * 10
    );

    type BallonPosition = {
      x: number;
      y: number;
      z: number;
      targetX: number;
      targetY: number;
      targetZ: number;
    };

    let balloonPositions: BallonPosition[] = [];

    for (let i = 0; i < amount; i++) {
      const x = Math.round(sceneSize.width * Math.random());
      // make sure balloons first render below the bottom of the screen
      const y = window.innerHeight;
      const z = Math.round(-1 * (Math.random() * maxDist));

      const targetX = Math.round(
        x + Math.random() * balloonWidth * 6 * (Math.random() > 0.5 ? 1 : -1)
      );
      const targetY = -window.innerHeight;
      // balloons don't move in the Z direction
      const targetZ = z;
      balloonPositions.push({
        x,
        y,
        z,
        targetX,
        targetY,
        targetZ,
      });
    }

    balloonPositions = balloonPositions.sort((a, b) => a.z - b.z);
    const closestBallonPosition = balloonPositions[balloonPositions.length - 1];
    const farthestBallonPosition = balloonPositions[0];
    // console.log({ closestBallonPosition, farthestBallonPosition });
    balloonPositions = balloonPositions.map((pos) => ({
      ...pos,
      z: pos.z - closestBallonPosition.z,
      targetZ: pos.z - closestBallonPosition.z,
    }));

    const filtersElement = document.createElement("div");
    filtersElement.innerHTML = svgFiltersHtml;
    balloonsContainer.appendChild(filtersElement);

    let currentZIndex = 1;

    const animations = balloonPositions.map((pos, index) => {
      const colorPair = colorPairs[index % colorPairs.length];

      const balloon = createBallonElement({
        balloonColor: colorPair[1],
        lightColor: colorPair[0],
        width: balloonWidth,
      });
      balloonsContainer.appendChild(balloon);

      return createBalloonAnimation({
        balloon,
        ...pos,
        zIndex: currentZIndex++,
      });
    });

    // Wait a bit for the balloon prerender
    requestAnimationFrame(() => {
      const animationPromises = animations.map(({ balloon, getAnimation }) => {
        const a = getAnimation();
        return a.finished.then(() => {
          balloon.remove();
        });
      });

      Promise.all(animationPromises).then(() => {
        balloonsContainer.remove();
        resolve();
      });
    });
  });
}
