import { useEffect, useRef } from "react";

export default function Game() {
  const canvasRef = useRef(null);

  const player = useRef({ x: 80, y: 0, w: 45, h: 45, vy: 0 });
  const obstacles = useRef([]);

  const speed = useRef(6);
  const score = useRef(0);
  const gameOver = useRef(false);

  const gravity = 1;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ground = canvas.height - 80 - player.current.h;

    function glow(x, y, w, h, color) {
      ctx.shadowBlur = 20;
      ctx.shadowColor = color;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
      ctx.shadowBlur = 0;
    }

    function collide(a, b) {
      return (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
      );
    }

    function spawnObstacle() {
      obstacles.current.push({
        x: canvas.width,
        y: ground,
        w: 40,
        h: 40
      });
    }

    const spawnTimer = setInterval(spawnObstacle, 1400);

    function loop() {
      if (gameOver.current) {
        ctx.fillStyle = "white";
        ctx.font = "60px Arial";
        ctx.fillText("GAME OVER", canvas.width / 2 - 180, canvas.height / 2);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // gravity + movement
      player.current.vy += gravity;
      player.current.y += player.current.vy;

      if (player.current.y > ground) {
        player.current.y = ground;
        player.current.vy = 0;
      }

      // draw player
      glow(
        player.current.x,
        player.current.y,
        player.current.w,
        player.current.h,
        "cyan"
      );

      // obstacles
      obstacles.current.forEach(o => {
        o.x -= speed.current;

        glow(o.x, o.y, o.w, o.h, "magenta");

        if (collide(player.current, o)) {
          gameOver.current = true;
        }

        if (o.x + o.w < 0) {
          score.current++;
          speed.current += 0.2;
        }
      });

      ctx.fillStyle = "cyan";
      ctx.font = "24px Arial";
      ctx.fillText("Score: " + score.current, 20, 40);

      requestAnimationFrame(loop);
    }

    loop();

    function jump(e) {
      if ((e.code === "Space" || e.type === "touchstart") && player.current.vy === 0) {
        player.current.vy = -20;
      }
    }

    window.addEventListener("keydown", jump);
    window.addEventListener("touchstart", jump);

    return () => {
      clearInterval(spawnTimer);
      window.removeEventListener("keydown", jump);
      window.removeEventListener("touchstart", jump);
    };
  }, []);

  return <canvas ref={canvasRef}></canvas>;
}