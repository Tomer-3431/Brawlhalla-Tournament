import React, { useEffect, useRef } from "react";

export const MoneyWaterRain: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        // Particle definitions
        const particles: Array<{
            x: number;
            y: number;
            speedY: number;
            speedX: number;
            size: number;
            type: "money" | "water" | "emoji";
            emoji?: string;
            opacity: number;
        }> = [];

        const emojis = ["💵", "💸", "💰", "💧", "💦"];

        for (let i = 0; i < 90; i++) {
            const isMoney = Math.random() > 0.4;
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                speedY: Math.random() * 4 + 2,
                speedX: Math.random() * 1.5 - 0.75,
                size: isMoney ? Math.random() * 20 + 20 : Math.random() * 12 + 8,
                type: isMoney ? "emoji" : "water",
                emoji: emojis[Math.floor(Math.random() * emojis.length)],
                opacity: Math.random() * 0.7 + 0.3,
            });
        }

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p) => {
                ctx.globalAlpha = p.opacity;

                if (p.type === "emoji" && p.emoji) {
                    ctx.font = `${p.size}px sans-serif`;
                    ctx.fillText(p.emoji, p.x, p.y);
                } else {
                    // Render water droplet
                    ctx.fillStyle = "#38bdf8";
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size / 3, 0, Math.PI * 2);
                    ctx.fill();
                }

                p.y += p.speedY;
                p.x += p.speedX;

                if (p.y > canvas.height) {
                    p.y = -20;
                    p.x = Math.random() * canvas.width;
                }
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-50 w-full h-full"
        />
    );
};