import { ArrowLeft, Shield, Eye, Database, Share2, Lock, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const lastUpdated = "January 13, 2026";
  const appName = "Tic-Tac-Toe";
  const developerName = "Alameen Koko";
  const contactEmail = "support@tictactoe-game.com";

  const sections = [
    {
      icon: Eye,
      title: "Information We Collect",
      content: [
        "Display Name: When you play online multiplayer, we collect the display name you choose to identify you to other players.",
        "Game Statistics: We collect gameplay data including wins, losses, draws, and ELO ratings to provide leaderboards and rankings.",
        "Device Information: We may collect device identifiers for analytics and to improve game performance.",
        "Usage Data: We collect anonymous usage statistics to understand how players interact with the game."
      ]
    },
    {
      icon: Database,
      title: "How We Use Your Information",
      content: [
        "To provide and maintain the game service",
        "To enable multiplayer functionality and matchmaking",
        "To display leaderboards and player rankings",
        "To improve game performance and user experience",
        "To send important updates about the game (with your consent)"
      ]
    },
    {
      icon: Share2,
      title: "Information Sharing",
      content: [
        "We do not sell your personal information to third parties.",
        "Your display name and game statistics are visible to other players in leaderboards and multiplayer games.",
        "We may share anonymized, aggregated data for analytics purposes.",
        "We may disclose information if required by law or to protect our rights."
      ]
    },
    {
      icon: Lock,
      title: "Data Security",
      content: [
        "We implement industry-standard security measures to protect your data.",
        "All data transmissions are encrypted using SSL/TLS protocols.",
        "We regularly review and update our security practices.",
        "While we strive to protect your information, no method of transmission over the Internet is 100% secure."
      ]
    },
    {
      icon: Shield,
      title: "Advertising",
      content: [
        "This app displays advertisements provided by Google AdMob.",
        "AdMob may collect device identifiers and usage data to serve relevant ads.",
        "You can opt out of personalized advertising in your device settings.",
        "For more information, please review Google's Privacy Policy."
      ]
    },
    {
      icon: Clock,
      title: "Data Retention",
      content: [
        "We retain your game data as long as your account is active.",
        "You can request deletion of your data by contacting us.",
        "Upon account deletion, your personal data will be removed within 30 days.",
        "Some anonymized data may be retained for analytical purposes."
      ]
    }
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
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>

        {/* Introduction */}
        <Card className="p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Welcome to {appName}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {developerName} ("we", "us", or "our") operates the {appName} mobile application. 
                This page informs you of our policies regarding the collection, use, and disclosure 
                of personal data when you use our app and the choices you have associated with that data.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                By using the app, you agree to the collection and use of information in accordance 
                with this policy.
              </p>
            </div>
          </div>
        </Card>

        {/* Policy Sections */}
        <div className="grid gap-4">
          {sections.map((section, index) => (
            <Card key={index} className="p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-accent/10 shrink-0">
                  <section.icon className="h-5 w-5 text-accent" />
                </div>
                <div className="space-y-3 flex-1">
                  <h3 className="text-lg font-semibold">{section.title}</h3>
                  <ul className="space-y-2">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-primary mt-1.5">•</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Children's Privacy */}
        <Card className="p-6 shadow-lg border-yellow-500/20 bg-yellow-500/5">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Shield className="h-5 w-5 text-yellow-500" />
            Children's Privacy
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Our app is designed to be family-friendly and does not knowingly collect personal 
            information from children under 13. If you are a parent or guardian and you are aware 
            that your child has provided us with personal data, please contact us. If we become 
            aware that we have collected personal data from children without verification of 
            parental consent, we take steps to remove that information from our servers.
          </p>
        </Card>

        {/* Your Rights */}
        <Card className="p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-3">Your Rights</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Depending on your location, you may have certain rights regarding your personal data:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "Right to access your data",
              "Right to correct inaccurate data",
              "Right to delete your data",
              "Right to data portability",
              "Right to withdraw consent",
              "Right to object to processing"
            ].map((right, index) => (
              <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm">{right}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Contact */}
        <Card className="p-6 shadow-lg bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Contact Us</h3>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <p className="text-primary font-medium">{contactEmail}</p>
            </div>
          </div>
        </Card>

        <Separator />

        {/* Footer Navigation */}
        <div className="flex flex-wrap justify-center gap-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/terms")}>
            Terms of Service
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/about")}>
            About
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

export default PrivacyPolicy;
