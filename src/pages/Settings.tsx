import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Webhook, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loginWebhook, setLoginWebhook] = useState("");
  const [sosWebhook, setSosWebhook] = useState("");
  const [triageWebhook, setTriageWebhook] = useState("");

  useEffect(() => {
    // Load saved webhooks
    setLoginWebhook(localStorage.getItem("n8n_login_webhook") || "");
    setSosWebhook(localStorage.getItem("n8n_sos_webhook") || "");
    setTriageWebhook(localStorage.getItem("n8n_triage_webhook") || "");
  }, []);

  const handleSave = () => {
    localStorage.setItem("n8n_login_webhook", loginWebhook);
    localStorage.setItem("n8n_sos_webhook", sosWebhook);
    localStorage.setItem("n8n_triage_webhook", triageWebhook);
    
    toast({
      title: "Settings Saved",
      description: "N8N webhook URLs have been updated successfully",
    });
  };

  const handleClear = () => {
    setLoginWebhook("");
    setSosWebhook("");
    setTriageWebhook("");
    localStorage.removeItem("n8n_login_webhook");
    localStorage.removeItem("n8n_sos_webhook");
    localStorage.removeItem("n8n_triage_webhook");
    
    toast({
      title: "Settings Cleared",
      description: "All webhook URLs have been removed",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">System Settings</h1>
            <p className="text-muted-foreground">Configure N8N workflow integrations</p>
          </div>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="w-5 h-5" />
              N8N Webhook Configuration
            </CardTitle>
            <CardDescription>
              Set up webhook URLs for each stage of the emergency response workflow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Login Webhook */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="login-webhook" className="text-base">Login Webhook</Label>
                <p className="text-sm text-muted-foreground">
                  Triggered when a user logs into the system
                </p>
              </div>
              <Input
                id="login-webhook"
                type="url"
                placeholder="https://your-n8n-instance.com/webhook/login"
                value={loginWebhook}
                onChange={(e) => setLoginWebhook(e.target.value)}
              />
              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
                <strong>Payload:</strong> username, timestamp
              </div>
            </div>

            <Separator />

            {/* SOS Webhook */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="sos-webhook" className="text-base">SOS Activation Webhook</Label>
                <p className="text-sm text-muted-foreground">
                  Triggered when SOS button is pressed with location data
                </p>
              </div>
              <Input
                id="sos-webhook"
                type="url"
                placeholder="https://your-n8n-instance.com/webhook/sos"
                value={sosWebhook}
                onChange={(e) => setSosWebhook(e.target.value)}
              />
              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded space-y-1">
                <div><strong>Payload:</strong> username, location (latitude, longitude), timestamp, status</div>
                <div className="mt-2"><strong>N8N Flow:</strong></div>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Receive location data</li>
                  <li>Query seismic sensor API</li>
                  <li>If no seismic data, verify via satellite imagery API</li>
                  <li>If verified, trigger emergency services endpoint</li>
                  <li>Return verification status</li>
                </ol>
              </div>
            </div>

            <Separator />

            {/* Triage Webhook */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="triage-webhook" className="text-base">Triage Assessment Webhook</Label>
                <p className="text-sm text-muted-foreground">
                  Triggered after triage questionnaire is completed or times out
                </p>
              </div>
              <Input
                id="triage-webhook"
                type="url"
                placeholder="https://your-n8n-instance.com/webhook/triage"
                value={triageWebhook}
                onChange={(e) => setTriageWebhook(e.target.value)}
              />
              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded space-y-1">
                <div><strong>Payload:</strong> username, location, answers, priority (red/yellow/green), timestamp, timedOut</div>
                <div className="mt-2"><strong>Priority Levels:</strong></div>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><span className="priority-red px-2 py-0.5 rounded text-xs">RED</span> - Critical/High risk - Immediate dispatch</li>
                  <li><span className="priority-yellow px-2 py-0.5 rounded text-xs">YELLOW</span> - Urgent/Medium risk - Priority dispatch</li>
                  <li><span className="priority-green px-2 py-0.5 rounded text-xs">GREEN</span> - Standard/Low risk - Standard dispatch</li>
                </ul>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Save Configuration
              </Button>
              <Button variant="outline" onClick={handleClear}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Documentation Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Integration Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              To connect this frontend to your N8N workflows:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Create webhook trigger nodes in N8N for each endpoint</li>
              <li>Copy the webhook URLs from N8N</li>
              <li>Paste them into the corresponding fields above</li>
              <li>Build your workflows to process the data and trigger appropriate actions</li>
              <li>Test each webhook by using the emergency response system</li>
            </ol>
            <p className="mt-4 text-muted-foreground">
              <strong>Note:</strong> All webhooks use POST method with JSON payloads. 
              CORS mode is set to "no-cors" to handle cross-origin requests.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
