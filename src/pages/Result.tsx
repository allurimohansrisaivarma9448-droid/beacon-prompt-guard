import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, AlertCircle, MapPin, Home } from "lucide-react";

type Priority = "red" | "yellow" | "green";

const PRIORITY_CONFIG = {
  red: {
    icon: AlertTriangle,
    title: "CRITICAL PRIORITY",
    description: "High-risk condition detected",
    message: "Emergency services dispatched immediately. Advanced life support en route.",
    bgClass: "priority-red",
    borderClass: "border-[hsl(var(--emergency-red))]",
  },
  yellow: {
    icon: AlertCircle,
    title: "URGENT PRIORITY",
    description: "Moderate-risk condition detected",
    message: "Emergency services notified. Medical assistance will arrive shortly.",
    bgClass: "priority-yellow",
    borderClass: "border-[hsl(var(--emergency-yellow))]",
  },
  green: {
    icon: CheckCircle2,
    title: "STANDARD PRIORITY",
    description: "Low-risk condition detected",
    message: "Basic emergency services dispatched. Help is on the way.",
    bgClass: "priority-green",
    borderClass: "border-[hsl(var(--emergency-green))]",
  },
};

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { priority, answers, location: locationData } = location.state || {};

  useEffect(() => {
    if (!priority || !localStorage.getItem("emergency_user")) {
      navigate("/dashboard");
    }
  }, [priority, navigate]);

  if (!priority) return null;

  const config = PRIORITY_CONFIG[priority as Priority];
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 flex items-center justify-center">
      <Card className={`w-full max-w-2xl ${config.borderClass} border-2`}>
        <CardHeader>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={`w-24 h-24 rounded-full ${config.bgClass} flex items-center justify-center emergency-pulse`}>
              <Icon className="w-12 h-12" />
            </div>
            <div>
              <CardTitle className="text-3xl mb-2">{config.title}</CardTitle>
              <CardDescription className="text-lg">{config.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 rounded-lg bg-muted/50 border border-border text-center">
            <p className="text-lg font-medium">{config.message}</p>
          </div>

          {locationData && (
            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location Transmitted
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Latitude:</span>{" "}
                    <span className="font-mono">{locationData.latitude.toFixed(6)}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Longitude:</span>{" "}
                    <span className="font-mono">{locationData.longitude.toFixed(6)}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Next Steps
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                Stay in your current location if safe to do so
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                Emergency services have your exact coordinates
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                Response team will contact you shortly
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">4.</span>
                Triage data has been sent to N8N workflow for processing
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/dashboard")}
            >
              <Home className="w-4 h-4 mr-2" />
              Return to Dashboard
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground pt-4 border-t">
            Emergency initiated at {new Date().toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Result;
