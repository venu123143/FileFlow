
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  // const location = useLocation();

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{
        backgroundImage: "url('https://res.cloudinary.com/dsnq9xdwt/image/upload/v1752988858/404_uutoev.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0" style={{ backgroundColor: 'hsl(var(--background) / 0.8)', backdropFilter: 'blur(4px)' }}></div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl w-full text-center">
        {/* 404 Title */}
        <div className="mb-8">
          <h1 className="text-8xl md:text-9xl font-bold mb-4" style={{ color: 'hsl(var(--primary) / 0.2)' }}>
            404
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'hsl(var(--foreground))' }}>
            Oops! Page Not Found
          </h2>
        </div>

        {/* Description */}
        <p className="text-lg leading-relaxed mb-12 max-w-lg mx-auto" style={{ color: 'hsl(var(--muted-foreground))' }}>
          The page you're looking for seems to have wandered off into the digital void.
          Don't worry though, even the best explorers sometimes take a wrong turn.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button variant="default" asChild size="lg" className="px-8">
            <Link to="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Go Back Home
            </Link>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
            className="px-8 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </div>

        {/* Fun fact */}
        <div className="mt-12 p-4 rounded-lg backdrop-blur-sm border" style={{
          backgroundColor: 'hsl(var(--card) / 0.5)',
          borderColor: 'hsl(var(--border) / 0.5)'
        }}>
          <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
            <span className="font-semibold">Fun fact:</span> The first 404 error was discovered at CERN in 1992.
            You're now part of internet history!
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;