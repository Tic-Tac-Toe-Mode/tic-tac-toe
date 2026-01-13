import { ArrowLeft, Gamepad2, Star, Users, Trophy, Heart, Mail, Globe, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import logo from "@/assets/logo.jpg";

const About = () => {
  const navigate = useNavigate();
  const appVersion = "1.0.0";
  const appName = "Tic-Tac-Toe";
  const developerName = "Alameen Koko";
  const contactEmail = "support@tictactoe-game.com";

  const features = [
    {
      icon: Gamepad2,
      title: "Multiple Game Modes",
      description: "Play against AI with various difficulty levels or challenge friends locally"
    },
    {
      icon: Users,
      title: "Online Multiplayer",
      description: "Compete with players worldwide in real-time matches"
    },
    {
      icon: Trophy,
      title: "Rankings & Leaderboards",
      description: "Climb the global leaderboard with ELO-based ranking system"
    },
    {
      icon: Star,
      title: "Tournaments",
      description: "Join exciting tournaments and prove you're the best"
    }
  ];

  const stats = [
    { label: "AI Difficulties", value: "3" },
    { label: "Game Modes", value: "4" },
    { label: "Themes", value: "5+" },
    { label: "Players", value: "∞" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              About
            </h1>
            <p className="text-sm text-muted-foreground">
              Version {appVersion}
            </p>
          </div>
        </div>

        {/* App Info Card */}
        <Card className="p-6 shadow-lg">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="shrink-0">
              <img 
                src={logo} 
                alt={appName} 
                className="w-24 h-24 md:w-32 md:h-32 rounded-2xl shadow-xl"
              />
            </div>
            <div className="text-center md:text-left space-y-3">
              <h2 className="text-2xl font-bold">{appName}</h2>
              <p className="text-muted-foreground leading-relaxed">
                The classic game of Tic-Tac-Toe, reimagined with modern design, 
                smooth animations, and exciting multiplayer features. Challenge 
                yourself against our intelligent AI or compete with players from 
                around the world!
              </p>
              <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground">
                <Smartphone className="h-4 w-4" />
                <span>Available on Android</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="p-4 text-center shadow-lg hover:shadow-xl transition-shadow">
              <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Features */}
        <Card className="p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Features
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="p-2 rounded-full bg-primary/10 shrink-0">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Developer */}
        <Card className="p-6 shadow-lg bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Made with ❤️ by</h3>
              <p className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {developerName}
              </p>
            </div>
          </div>
        </Card>

        {/* Contact */}
        <Card className="p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Contact & Support</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{contactEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Website</p>
                <p className="font-medium">www.tictactoe-game.com</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Credits */}
        <Card className="p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Credits</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Built with React and TypeScript</p>
            <p>• UI components from shadcn/ui</p>
            <p>• Icons from Lucide React</p>
            <p>• Animations powered by Framer Motion</p>
            <p>• Backend powered by Lovable Cloud</p>
          </div>
        </Card>

        <Separator />

        {/* Footer Navigation */}
        <div className="flex flex-wrap justify-center gap-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/privacy")}>
            Privacy Policy
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/terms")}>
            Terms of Service
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            Back to Game
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground pb-4">
          © {new Date().getFullYear()} {developerName}. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default About;
