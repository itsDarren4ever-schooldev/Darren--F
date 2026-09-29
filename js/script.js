console.log("script.js is connected!");

// ===== ROCK PHYSICS ENGINE =====
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Physics constants
const GRAVITY = 0.1;
const FRICTION = 1;
const BOUNCE = 1.01;
const EXPLOSION_SPEED_THRESHOLD = 150; // Speed at which ball explodes
const MAX_SPEED = 12; // Maximum speed the ball can reach

// Rock object
const rock = {
  x: canvas.width / 1,
  y: canvas.height / 1,
  vx: 0,
  vy: 0,
  radius: 10,
  mass: 1,
  isHeld: false,
  prevX: canvas.width / 2,
  prevY: canvas.height / 2
};

// Trail system
const trail = [];

// Particle system for explosions
const particles = [];
const MAX_TRAIL_LENGTH = 15;

// Mouse tracking
let mouseX = 0;
let mouseY = 0;
let mouseDown = false;
let throwVelocityX = 0;
let throwVelocityY = 0;

// Event listeners
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('mouseleave', handleMouseUp);

// Reset button listener
const resetBtn = document.getElementById('resetBtn');
if (resetBtn) {
  resetBtn.addEventListener('click', resetRock);
}

// Reset rock function
function resetRock() {
  rock.x = canvas.width / 2;
  rock.y = canvas.height / 2;
  rock.vx = 0;
  rock.vy = 0;
  rock.isHeld = false;
  rock.prevX = canvas.width / 2;
  particles.length = 0; // Clear particles
  rock.prevY = canvas.height / 2;
  mouseDown = false;
  trail.length = 0; // Clear trail
}

function handleMouseDown(e) {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;

  // Check if mouse is over rock
  const dx = mouseX - rock.x;
  const dy = mouseY - rock.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < rock.radius + 10) {
    rock.isHeld = true;
    mouseDown = true;
  }
}

function handleMouseMove(e) {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;

  if (rock.isHeld) {
    // Move rock with mouse
    rock.x = mouseX;
    rock.y = mouseY;
    rock.vx = 0;
    rock.vy = 0;
  }
}

function handleMouseUp(e) {
  if (rock.isHeld && mouseDown) {
    // Calculate throw velocity
    const dx = rock.x - rock.prevX;
    const dy = rock.y - rock.prevY;
    rock.vx = dx * 0.8; // Dampen the throw
    rock.vy = dy * 0.8;
  }

  rock.isHeld = false;
  mouseDown = false;
}

// Update rock physics
function updateRock() {
  if (!rock.isHeld) {
    // Apply gravity
    rock.vy += GRAVITY;

    // Apply friction
    rock.vx *= FRICTION;
    rock.vy *= FRICTION;

    // Limit maximum speed
    const speed = Math.sqrt(rock.vx * rock.vx + rock.vy * rock.vy);
    if (speed > MAX_SPEED) {
      const ratio = MAX_SPEED / speed;
      rock.vx *= ratio;
      rock.vy *= ratio;
    }

    // Update position
    rock.x += rock.vx;
    rock.y += rock.vy;

    // Boundary collision
    // Bottom
    if (rock.y + rock.radius > canvas.height) {
      rock.y = canvas.height - rock.radius;
      rock.vy *= -BOUNCE;
    }
    // Top
    if (rock.y - rock.radius < 0) {
      rock.y = rock.radius;
      rock.vy *= -BOUNCE;
    }
    // Right
    if (rock.x + rock.radius > canvas.width) {
      rock.x = canvas.width - rock.radius;
      rock.vx *= -BOUNCE;
    }
    // Left
    if (rock.x - rock.radius < 0) {
      rock.x = rock.radius;
      rock.vx *= -BOUNCE;
    }
  }

  rock.prevX = rock.x;

  // Add to trail
  trail.push({ x: rock.x, y: rock.y });
  if (trail.length > MAX_TRAIL_LENGTH) {
    trail.shift();
  }
  rock.prevY = rock.y;
}

// Draw trail
function drawTrail() {
  for (let i = 0; i < trail.length; i++) {
    const opacity = i / trail.length; // Fade from transparent to opaque
    ctx.fillStyle = `rgba(139, 115, 85, ${opacity * 0.6})`; // Brown with fading alpha
    ctx.beginPath();
    ctx.arc(trail[i].x, trail[i].y, rock.radius * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Draw rock
function drawRock() {
  // Rock shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.ellipse(rock.x, canvas.height - 10, rock.radius + 2, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rock body
  ctx.fillStyle = '#8B7355';
  ctx.beginPath();
  ctx.arc(rock.x, rock.y, rock.radius, 0, Math.PI * 2);
  ctx.fill();

  // Rock shading for 3D effect
  ctx.fillStyle = '#A0826D';
  ctx.beginPath();
  ctx.arc(rock.x - 5, rock.y - 5, rock.radius * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Rock highlight
  ctx.strokeStyle = '#C0A080';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(rock.x, rock.y, rock.radius, 0, Math.PI * 2);
  ctx.stroke();
}

// Draw background and UI
function drawScene() {
  // Clear canvas
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Ground
  ctx.fillStyle = '#90EE90';
  ctx.fillRect(0, canvas.height - 30, canvas.width, 30);

  // Draw trail
  drawTrail();

  // Draw rock
  drawRock();

  // Draw instructions if rock is being held
  if (rock.isHeld) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.font = '16px Arial';
    ctx.fillText('Release to throw!', 20, 30);
  }
}

// Main game loop
function gameLoop() {
  updateRock();
  drawScene();
  requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();