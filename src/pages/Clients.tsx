
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { FolderKanban, Mail, Phone, Plus, Search, User } from "lucide-react";

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  projects: number;
  totalEarnings: string;
}

const Clients = () => {
  // Sample client data - would come from your data store
  const clients: Client[] = [
    {
      id: "1",
      name: "John Smith",
      company: "Acme Inc",
      email: "john@acme.com",
      phone: "(555) 123-4567",
      projects: 3,
      totalEarnings: "$4,500",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      company: "TechCo",
      email: "sarah@techco.com",
      phone: "(555) 987-6543",
      projects: 2,
      totalEarnings: "$3,200",
    },
    {
      id: "3",
      name: "Michael Brown",
      company: "StartupX",
      email: "michael@startupx.com",
      phone: "(555) 456-7890",
      projects: 1,
      totalEarnings: "$1,800",
    },
    {
      id: "4",
      name: "Emily Davis",
      company: "Design Studio",
      email: "emily@designstudio.com",
      phone: "(555) 789-0123",
      projects: 2,
      totalEarnings: "$2,700",
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Clients</h1>
        <Link to="/clients/new">
          <Button className="bg-brand-blue hover:bg-brand-blue/90 flex items-center gap-2">
            <Plus size={16} />
            Add Client
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search clients..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client) => (
          <Link key={client.id} to={`/clients/${client.id}`}>
            <Card className="hover:border-brand-blue/20 hover:shadow-md transition-all duration-200">
              <CardContent className="p-5">
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{client.name}</h3>
                      <p className="text-gray-500 text-sm">{client.company}</p>
                    </div>
                    <div className="p-2 bg-brand-light text-brand-blue rounded-full">
                      <User size={20} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={14} className="text-gray-400" />
                      <span>{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={14} className="text-gray-400" />
                      <span>{client.phone}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-1 text-sm">
                      <FolderKanban size={14} className="text-gray-400" />
                      <span>{client.projects} Projects</span>
                    </div>
                    <span className="font-semibold text-brand-blue">{client.totalEarnings}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Clients;
