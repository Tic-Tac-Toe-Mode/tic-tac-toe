import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface VolumeControlProps {
  volume: number;
  setVolume: (value: number) => void;
  isMuted: boolean;
  setIsMuted: (value: boolean) => void;
}

export const VolumeControl = ({ volume, setVolume, isMuted, setIsMuted }: VolumeControlProps) => {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setIsMuted(!isMuted)}
      >
        {isMuted ? (
          <VolumeX className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Volume2 className="h-4 w-4 text-primary" />
        )}
      </Button>
      <Slider
        value={[isMuted ? 0 : volume * 100]}
        onValueChange={(value) => {
          if (isMuted && value[0] > 0) setIsMuted(false);
          setVolume(value[0] / 100);
        }}
        max={100}
        step={1}
        className="w-20"
      />
    </div>
  );
};
