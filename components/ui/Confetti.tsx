import * as React from 'react';

const Confetti: React.FC = () => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        let containerSize = container.getBoundingClientRect();
        canvas.width = containerSize.width;
        canvas.height = containerSize.height;

        const colors = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
        let confetti: {
            x: number;
            y: number;
            w: number;
            h: number;
            color: string;
            vx: number;
            vy: number;
            angle: number;
            angularVelocity: number;
            life: number;
        }[] = [];
        const confettiCount = 100;

        for (let i = 0; i < confettiCount; i++) {
            confetti.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                w: Math.random() * 10 + 5,
                h: Math.random() * 10 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                vx: Math.random() * 4 - 2,
                vy: Math.random() * 5 + 2,
                angle: Math.random() * Math.PI * 2,
                angularVelocity: Math.random() * 0.1 - 0.05,
                life: 1, // Start with full life
            });
        }
        
        let animationFrameId: number;
        let startTime = Date.now();

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const elapsedTime = (Date.now() - startTime) / 1000;
            const duration = 3; // 3 seconds

            if (elapsedTime > duration) {
                 if (animationFrameId) cancelAnimationFrame(animationFrameId);
                 return;
            }

            confetti.forEach(p => {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle);
                ctx.fillStyle = p.color;
                
                // Fade out effect
                const remainingLife = 1 - (elapsedTime / duration);
                ctx.globalAlpha = Math.max(0, remainingLife);

                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();

                p.x += p.vx;
                p.y += p.vy;
                p.angle += p.angularVelocity;
                p.vy += 0.1; // Gravity
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, []);

    return (
        <div ref={containerRef} className="absolute inset-0 pointer-events-none z-50">
            <canvas ref={canvasRef} />
        </div>
    );
};

export default Confetti;
