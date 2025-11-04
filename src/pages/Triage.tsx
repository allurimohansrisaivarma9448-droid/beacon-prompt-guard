import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Priority = "red" | "yellow" | "green";

interface Question {
  id: string;
  question: string;
  options: { value: string; label: string; weight: number }[];
}

const QUESTIONS: Question[] = [
  {
    id: "breathing",
    question: "Are you experiencing difficulty breathing?",
    options: [
      { value: "severe", label: "Severe difficulty", weight: 3 },
      { value: "moderate", label: "Moderate difficulty", weight: 2 },
      { value: "mild", label: "Mild difficulty", weight: 1 },
      { value: "none", label: "No difficulty", weight: 0 },
    ],
  },
  {
    id: "bleeding",
    question: "Are you experiencing internal or external bleeding?",
    options: [
      { value: "severe", label: "Severe bleeding", weight: 3 },
      { value: "moderate", label: "Moderate bleeding", weight: 2 },
      { value: "minor", label: "Minor bleeding", weight: 1 },
      { value: "none", label: "No bleeding", weight: 0 },
    ],
  },
  {
    id: "consciousness",
    question: "What is your level of consciousness?",
    options: [
      { value: "unconscious", label: "Unconscious/unresponsive", weight: 3 },
      { value: "confused", label: "Confused/disoriented", weight: 2 },
      { value: "drowsy", label: "Drowsy but responsive", weight: 1 },
      { value: "alert", label: "Fully alert", weight: 0 },
    ],
  },
  {
    id: "pain",
    question: "Rate your pain level:",
    options: [
      { value: "severe", label: "Severe (8-10)", weight: 3 },
      { value: "moderate", label: "Moderate (5-7)", weight: 2 },
      { value: "mild", label: "Mild (1-4)", weight: 1 },
      { value: "none", label: "No pain", weight: 0 },
    ],
  },
];

const TIMEOUT_SECONDS = 20;

const Triage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(TIMEOUT_SECONDS);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const locationData = location.state?.location;

  useEffect(() => {
    if (!localStorage.getItem("emergency_user")) {
      navigate("/");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion]);

  const handleTimeout = () => {
    setIsTimedOut(true);
    toast({
      title: "No Response",
      description: "Automatically classified as critical (RED priority)",
      variant: "destructive",
    });
    submitTriage("red");
  };

  const calculatePriority = (responses: Record<string, string>): Priority => {
    let totalWeight = 0;
    
    QUESTIONS.forEach((q) => {
      const answer = responses[q.id];
      if (answer) {
        const option = q.options.find((opt) => opt.value === answer);
        if (option) totalWeight += option.weight;
      }
    });

    // Classification logic
    if (totalWeight >= 9) return "red"; // High risk
    if (totalWeight >= 4) return "yellow"; // Medium risk
    return "green"; // Low risk
  };

  const submitTriage = async (priority: Priority) => {
    const triageWebhook = localStorage.getItem("n8n_triage_webhook");
    const username = localStorage.getItem("emergency_user");

    const triageData = {
      username,
      location: locationData,
      answers,
      priority,
      timestamp: new Date().toISOString(),
      timedOut: isTimedOut,
    };

    if (triageWebhook) {
      try {
        await fetch(triageWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "no-cors",
          body: JSON.stringify(triageData),
        });
      } catch (error) {
        console.error("Failed to send triage data:", error);
      }
    }

    navigate("/result", { state: { priority, answers, location: locationData } });
  };

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [QUESTIONS[currentQuestion].id]: value };
    setAnswers(newAnswers);

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(TIMEOUT_SECONDS);
    } else {
      // All questions answered
      const priority = calculatePriority(newAnswers);
      submitTriage(priority);
    }
  };

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  const question = QUESTIONS[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-2xl">Triage Assessment</CardTitle>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-xl font-bold">{timeLeft}s</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <CardDescription className="mt-2">
            Question {currentQuestion + 1} of {QUESTIONS.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <p className="font-medium text-lg">{question.question}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Select the option that best describes your condition
              </p>
            </div>
          </div>

          <RadioGroup onValueChange={handleAnswer} className="space-y-3">
            {question.options.map((option) => (
              <div
                key={option.value}
                className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer"
              >
                <RadioGroupItem value={option.value} id={option.value} />
                <Label
                  htmlFor={option.value}
                  className="flex-1 cursor-pointer text-base"
                >
                  {option.label}
                </Label>
                {option.weight === 3 && (
                  <span className="px-2 py-1 rounded text-xs font-medium priority-red">
                    Critical
                  </span>
                )}
                {option.weight === 2 && (
                  <span className="px-2 py-1 rounded text-xs font-medium priority-yellow">
                    Serious
                  </span>
                )}
                {option.weight === 1 && (
                  <span className="px-2 py-1 rounded text-xs font-medium priority-green">
                    Moderate
                  </span>
                )}
              </div>
            ))}
          </RadioGroup>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4" />
            Answer honestly - this determines your priority level for emergency services
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Triage;
