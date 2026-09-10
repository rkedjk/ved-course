import confetti from "canvas-confetti";

export function fireConfetti(big = false) {
  confetti({
    particleCount: big ? 180 : 90,
    spread: big ? 100 : 70,
    origin: { y: 0.7 },
  });
}

export function fireCannons() {
  confetti({
    particleCount: 80,
    angle: 60,
    spread: 60,
    origin: { x: 0, y: 0.8 },
  });
  confetti({
    particleCount: 80,
    angle: 120,
    spread: 60,
    origin: { x: 1, y: 0.8 },
  });
}
