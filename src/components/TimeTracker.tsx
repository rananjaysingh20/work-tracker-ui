
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Play, Pause, Save } from "lucide-react";

const TimeTracker = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [time, setTime] = useState(0);
  const [selectedProject, setSelectedProject] = useState("");
  const [description, setDescription] = useState("");

  // Sample project data - would come from your data store
  const projects = [
    { id: "1", name: "Website Redesign", client: "Acme Inc" },
    { id: "2", name: "Mobile App Development", client: "TechCo" },
    { id: "3", name: "Brand Identity", client: "StartupX" },
  ];

  // Toggle time tracking
  const toggleTracking = () => {
    setIsTracking(!isTracking);
  };

  // Format seconds as HH:MM:SS
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [
      h.toString().padStart(2, "0"),
      m.toString().padStart(2, "0"),
      s.toString().padStart(2, "0"),
    ].join(":");
  };

  // Save time entry function (would connect to data storage)
  const saveTimeEntry = () => {
    if (time === 0 || !selectedProject) return;
    
    console.log("Saving time entry:", {
      project: selectedProject,
      duration: time,
      description,
      timestamp: new Date(),
    });

    // Reset the form
    setTime(0);
    setDescription("");
    setIsTracking(false);
  };

  return (
    <div className="bg-white p-5 rounded-lg border border-gray-200">
      <h2 className="font-semibold text-lg mb-4">Time Tracker</h2>
      
      <div className="space-y-4">
        <Select
          value={selectedProject}
          onValueChange={setSelectedProject}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name} ({project.client})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-4">
          <div className="text-3xl font-mono bg-gray-100 p-3 rounded-md flex-1 text-center">
            {formatTime(time)}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTracking}
            className={isTracking ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"}
          >
            {isTracking ? <Pause size={18} /> : <Play size={18} />}
          </Button>
        </div>

        <Textarea
          placeholder="What are you working on?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="resize-none"
        />

        <Button 
          onClick={saveTimeEntry} 
          className="w-full bg-brand-blue hover:bg-brand-blue/90"
          disabled={time === 0 || !selectedProject}
        >
          <Save size={16} className="mr-2" />
          Save Time Entry
        </Button>
      </div>
    </div>
  );
};

export default TimeTracker;
