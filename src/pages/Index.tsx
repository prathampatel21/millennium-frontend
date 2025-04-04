
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { BarChart3, TrendingUp, ShieldCheck, ArrowRight, Earth } from 'lucide-react';

const Index = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Initial resize
    resizeCanvas();

    // Update on window resize
    window.addEventListener('resize', resizeCanvas);

    // Particle configuration
    const particlesArray: Particle[] = [];
    const numberOfParticles = 80;
    const maxDistance = 100;
    const mouseRadius = 100;

    // Mouse position tracking
    let mouse = {
      x: null as number | null,
      y: null as number | null,
    };

    window.addEventListener('mousemove', (event) => {
      mouse.x = event.x;
      mouse.y = event.y;
    });

    window.addEventListener('mouseout', () => {
      mouse.x = null;
      mouse.y = null;
    });

    // Particle class
    class Particle {
      x: number;
      y: number;
      size: number;
      baseX: number;
      baseY: number;
      density: number;
      color: string;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 2 + 1;
        this.baseX = x;
        this.baseY = y;
        this.density = (Math.random() * 30) + 1;
        this.color = '#3b82f6';
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }

      update() {
        // Mouse interaction
        if (mouse.x != null && mouse.y != null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < mouseRadius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const maxDistance = mouseRadius;
            const force = (maxDistance - distance) / maxDistance;
            const directionX = forceDirectionX * force * this.density;
            const directionY = forceDirectionY * force * this.density;
            
            this.x -= directionX;
            this.y -= directionY;
          }
        }

        // Move particles back to original position
        let dx = this.baseX - this.x;
        let dy = this.baseY - this.y;
        this.x += dx * 0.05;
        this.y += dy * 0.05;

        // Add some natural movement
        this.x += Math.random() * 0.5 - 0.25;
        this.y += Math.random() * 0.5 - 0.25;

        this.draw();
      }
    }

    // Create particles
    function init() {
      particlesArray.length = 0;
      for (let i = 0; i < numberOfParticles; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particlesArray.push(new Particle(x, y));
      }
    }

    // Connect nearby particles with lines
    function connect() {
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          const dx = particlesArray[a].x - particlesArray[b].x;
          const dy = particlesArray[a].y - particlesArray[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            if (!ctx) return;
            ctx.strokeStyle = `rgba(59, 130, 246, ${(maxDistance - distance) / maxDistance * 0.8})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }
    }

    // Animation function
    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
      }
      connect();
      requestAnimationFrame(animate);
    }

    // Initialize and start animation
    init();
    animate();

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', () => {});
      window.removeEventListener('mouseout', () => {});
    };
  }, []);

  return (
    <div className="min-h-screen overflow-hidden flex flex-col items-center">
      <Header />
      
      {/* Dynamic constellation background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-50 to-gray-100">
        <canvas 
          ref={canvasRef} 
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
      
      <main className="pt-20 pb-16 relative w-full">
        {/* Hero Section */}
        <section className="container mx-auto px-4 md:px-6 pt-12 md:pt-20 pb-16 relative z-10 flex justify-center">
          <div className="max-w-3xl animate-fade-in text-center">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              Advanced Trading Platform
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Trade with precision and <span className="text-primary">confidence</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Experience seamless order management with our intuitive trading platform,
              designed to help you execute trades efficiently and track performance in real-time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/create-order"
                className="btn-primary flex items-center group"
              >
                Create Your First Order
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/orders"
                className="btn-secondary"
              >
                View Orders
              </Link>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="bg-gray-50/80 py-16 relative z-10 w-full">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Features</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our platform offers everything you need for efficient and effective trading operations
              </p>
            </div>
            
            <div className="flex items-center justify-center mb-16">
              <Earth className="h-6 w-6 text-primary mr-2" />
              <h3 className="text-xl font-semibold">Global Trading Activity</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="glass rounded-2xl p-6 card-hover">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Real-Time Tracking</h3>
                <p className="text-gray-600">
                  Monitor your orders in real-time with instant status updates and detailed performance metrics.
                </p>
              </div>
              
              <div className="glass rounded-2xl p-6 card-hover">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Advanced Orders</h3>
                <p className="text-gray-600">
                  Create sophisticated trading strategies with our advanced order types and execution options.
                </p>
              </div>
              
              <div className="glass rounded-2xl p-6 card-hover">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Trading</h3>
                <p className="text-gray-600">
                  Trade with confidence on our secure platform with robust protection for your account and transactions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
