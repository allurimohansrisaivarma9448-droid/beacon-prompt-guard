import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Get N8N webhook URL from localStorage
    const loginWebhook = localStorage.getItem("n8n_login_webhook");

    try {
      if (loginWebhook) {
        // Send to N8N webhook
        await fetch(loginWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "no-cors",
          body: JSON.stringify({
            username,
            timestamp: new Date().toISOString(),
          }),
        });
      }

      // Store auth state
      localStorage.setItem("emergency_user", username);
      
      toast({
        title: "Login Successful",
        description: "Access granted to Emergency Response System",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "Login failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/10">
      <Card className="w-full max-w-md border-primary/20">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Emergency Response System</CardTitle>
          <CardDescription>Secure access for authorized personnel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                This system is for emergency response personnel only. Unauthorized access is prohibited.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Authenticating..." : "Access System"}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              className="w-full text-xs"
              onClick={() => navigate("/settings")}
            >
              Configure N8N Webhooks
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
