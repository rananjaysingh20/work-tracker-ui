
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import { Calendar, Clock, Pencil, Plus, Search, Trash2 } from "lucide-react";

interface TimeEntry {
  id: string;
  date: string;
  project: string;
  client: string;
  description: string;
  hours: number;
  billable: boolean;
}

const TimeEntries = () => {
  // Sample time entry data - would come from your data store
  const timeEntries: TimeEntry[] = [
    {
      id: "1",
      date: "May 10, 2025",
      project: "Website Redesign",
      client: "Acme Inc",
      description: "Homepage layout implementation",
      hours: 2.5,
      billable: true
    },
    {
      id: "2",
      date: "May 10, 2025",
      project: "Mobile App Development",
      client: "TechCo",
      description: "API integration",
      hours: 3.0,
      billable: true
    },
    {
      id: "3",
      date: "May 9, 2025",
      project: "Website Redesign",
      client: "Acme Inc",
      description: "Client meeting and feedback",
      hours: 1.0,
      billable: true
    },
    {
      id: "4",
      date: "May 9, 2025",
      project: "Brand Identity",
      client: "StartupX",
      description: "Logo concepts",
      hours: 2.5,
      billable: true
    },
    {
      id: "5",
      date: "May 8, 2025",
      project: "Mobile App Development",
      client: "TechCo",
      description: "UI design review",
      hours: 1.5,
      billable: false
    },
    {
      id: "6",
      date: "May 8, 2025",
      project: "Website Redesign",
      client: "Acme Inc",
      description: "Responsive testing",
      hours: 1.5,
      billable: true
    },
  ];

  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);

  const toggleSelectEntry = (id: string) => {
    if (selectedEntries.includes(id)) {
      setSelectedEntries(selectedEntries.filter(entryId => entryId !== id));
    } else {
      setSelectedEntries([...selectedEntries, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedEntries.length === timeEntries.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(timeEntries.map(entry => entry.id));
    }
  };

  // Calculate total hours
  const totalHours = timeEntries.reduce((total, entry) => total + entry.hours, 0);
  const selectedHours = timeEntries
    .filter(entry => selectedEntries.includes(entry.id))
    .reduce((total, entry) => total + entry.hours, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Time Entries</h1>
        <Link to="/time-entries/new">
          <Button className="bg-brand-blue hover:bg-brand-blue/90 flex items-center gap-2">
            <Plus size={16} />
            New Entry
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search time entries..."
            className="pl-10"
          />
        </div>

        <div className="flex gap-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="1">Website Redesign</SelectItem>
              <SelectItem value="2">Mobile App Development</SelectItem>
              <SelectItem value="3">Brand Identity</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="flex items-center gap-2">
            <Calendar size={16} />
            This Week
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock className="text-brand-blue" />
            <h2 className="font-semibold">
              {selectedEntries.length > 0 ? (
                <span>{selectedEntries.length} entries selected ({selectedHours.toFixed(1)} hours)</span>
              ) : (
                <span>All time entries ({totalHours.toFixed(1)} hours)</span>
              )}
            </h2>
          </div>

          {selectedEntries.length > 0 && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Pencil size={14} />
                Edit
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1 border-red-200 text-red-600 hover:bg-red-50">
                <Trash2 size={14} />
                Delete
              </Button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Input 
                    type="checkbox" 
                    className="w-4 h-4"
                    checked={selectedEntries.length === timeEntries.length && timeEntries.length > 0}
                    onChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[200px]">Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="w-[250px]">Description</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Billable</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <Input 
                      type="checkbox" 
                      className="w-4 h-4" 
                      checked={selectedEntries.includes(entry.id)}
                      onChange={() => toggleSelectEntry(entry.id)}
                    />
                  </TableCell>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell>{entry.project}</TableCell>
                  <TableCell>{entry.client}</TableCell>
                  <TableCell className="max-w-[250px] truncate">{entry.description}</TableCell>
                  <TableCell>{entry.hours.toFixed(1)}</TableCell>
                  <TableCell>
                    {entry.billable ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Yes</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">No</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default TimeEntries;
