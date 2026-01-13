import { ArrowLeft, FileText, Shield, AlertTriangle, Scale, Ban, RefreshCw, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

const TermsOfService = () => {
  const navigate = useNavigate();
  const lastUpdated = "January 13, 2026";
  const appName = "Tic-Tac-Toe";
  const developerName = "Alameen Koko";
  const contactEmail = "support@tictactoe-game.com";

  const sections = [
    {
      icon: FileText,
      title: "Acceptance of Terms",
      content: [
        "By downloading, installing, or using the Tic-Tac-Toe app, you agree to be bound by these Terms of Service.",
        "If you do not agree to these terms, please do not use the app.",
        "We reserve the right to modify these terms at any time. Continued use of the app after changes constitutes acceptance of the new terms."
      ]
    },
    {
      icon: Shield,
      title: "Use License",
      content: [
        "We grant you a limited, non-exclusive, non-transferable license to use the app for personal, non-commercial purposes.",
        "You may not copy, modify, distribute, sell, or lease any part of the app.",
        "You may not reverse engineer or attempt to extract the source code of the app.",
        "This license shall automatically terminate if you violate any of these restrictions."
      ]
    },
    {
      icon: Ban,
      title: "Prohibited Conduct",
      content: [
        "Using the app for any illegal purpose or in violation of any laws",
        "Cheating, exploiting bugs, or using unauthorized third-party software",
        "Harassing, threatening, or abusing other players",
        "Impersonating any person or entity",
        "Interfering with or disrupting the app's servers or networks",
        "Creating multiple accounts to manipulate rankings"
      ]
    },
    {
      icon: Scale,
      title: "Fair Play",
      content: [
        "We are committed to providing a fair gaming experience for all players.",
        "Any form of cheating or exploitation will result in account suspension or termination.",
        "Rankings and statistics are based on legitimate gameplay only.",
        "We reserve the right to reset statistics if manipulation is detected."
      ]
    },
    {
      icon: AlertTriangle,
      title: "Disclaimer of Warranties",
      content: [
        "The app is provided 'as is' without warranties of any kind.",
        "We do not guarantee that the app will be error-free or uninterrupted.",
        "We are not responsible for any loss of data or progress.",
        "Your use of the app is at your sole risk."
      ]
    },
    {
      icon: RefreshCw,
      title: "Updates and Changes",
      content: [
        "We may update the app from time to time to add features or fix issues.",
        "We reserve the right to modify or discontinue the app at any time.",
        "We are not liable for any modification, suspension, or discontinuance of the app.",
        "Major changes will be communicated through the app or our website."
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
              Terms of Service
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
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Welcome to {appName}</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms of Service ("Terms") govern your access to and use of the {appName} 
                mobile application developed by {developerName}. Please read these Terms carefully 
                before using our app.
              </p>
            </div>
          </div>
        </Card>

        {/* Terms Sections */}
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

        {/* Limitation of Liability */}
        <Card className="p-6 shadow-lg border-orange-500/20 bg-orange-500/5">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Limitation of Liability
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            To the maximum extent permitted by law, {developerName} shall not be liable for any 
            indirect, incidental, special, consequential, or punitive damages, or any loss of 
            profits or revenues, whether incurred directly or indirectly, or any loss of data, 
            use, goodwill, or other intangible losses resulting from your use of the app.
          </p>
        </Card>

        {/* Governing Law */}
        <Card className="p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Governing Law
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            These Terms shall be governed by and construed in accordance with applicable laws, 
            without regard to conflict of law principles. Any disputes arising from these Terms 
            or your use of the app shall be resolved through binding arbitration or in the courts 
            of competent jurisdiction.
          </p>
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
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <p className="text-primary font-medium">{contactEmail}</p>
            </div>
          </div>
        </Card>

        <Separator />

        {/* Footer Navigation */}
        <div className="flex flex-wrap justify-center gap-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/privacy")}>
            Privacy Policy
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

export default TermsOfService;
