import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, MapPin, Settings, LogOut, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [username, setUsername] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const user = localStorage.getItem("emergency_user");
    if (!user) {
      navigate("/");
      return;
    }
    setUsername(user);
  }, [navigate]);

  const getLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const handleSOSActivation = async () => {
    setIsActivating(true);

    try {
      // Get location
      const location = await getLocation();
      
      toast({
        title: "Location Acquired",
        description: `Lat: ${location.latitude.toFixed(4)}, Lng: ${location.longitude.toFixed(4)}`,
      });

      // Get N8N webhook URL
      const sosWebhook = localStorage.getItem("n8n_sos_webhook");

      if (sosWebhook) {
        // Send SOS data to N8N
        await fetch(sosWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "no-cors",
          body: JSON.stringify({
            username,
            location,
            timestamp: new Date().toISOString(),
            status: "location_acquired",
          }),
        });

        toast({
          title: "SOS Signal Sent",
          description: "Verifying with seismic sensors...",
        });
      } else {
        toast({
          title: "Warning",
          description: "N8N webhook not configured. Configure in settings.",
          variant: "destructive",
        });
      }

      // Navigate to triage after a moment
      setTimeout(() => {
        navigate("/triage", { state: { location } });
      }, 2000);

    } catch (error) {
      console.error("SOS activation error:", error);
      toast({
        title: "Location Error",
        description: "Unable to acquire location. Please enable location services.",
        variant: "destructive",
      });
    } finally {
      setIsActivating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("emergency_user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Emergency Response</h1>
            <p className="text-muted-foreground">Operator: {username}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">Online</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ready</div>
              <p className="text-xs text-muted-foreground">GPS enabled</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                N8N Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {localStorage.getItem("n8n_sos_webhook") ? "Connected" : "Not Set"}
              </div>
              <p className="text-xs text-muted-foreground">
                {localStorage.getItem("n8n_sos_webhook") ? "Webhook configured" : "Configure in settings"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* SOS Button */}
        <Card className="border-primary/50 bg-gradient-to-br from-card to-primary/10">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Emergency Activation</CardTitle>
            <CardDescription className="text-center">
              Press the button below to activate emergency response protocol
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 py-8">
            <Button
              size="lg"
              onClick={handleSOSActivation}
              disabled={isActivating}
              className="w-48 h-48 rounded-full text-2xl font-bold emergency-pulse bg-primary hover:bg-primary/90 shadow-lg shadow-primary/50"
            >
              {isActivating ? (
                <div className="flex flex-col items-center gap-2">
                  <Activity className="w-12 h-12 animate-spin" />
                  <span className="text-lg">Activating...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <AlertTriangle className="w-12 h-12" />
                  <span>SOS</span>
                </div>
              )}
            </Button>
            <div className="text-center space-y-2 max-w-md">
              <p className="text-sm font-medium">Emergency Protocol</p>
              <p className="text-xs text-muted-foreground">
                Activating SOS will:
                <br />1. Capture your current location
                <br />2. Verify with seismic sensors
                <br />3. Initiate triage assessment
                <br />4. Dispatch emergency services
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
