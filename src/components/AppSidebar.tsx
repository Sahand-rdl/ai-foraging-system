import { useState } from "react";
import { Home, FolderOpen, FileText, Database, ChevronRight, Plus, Search } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useProjects } from "@/contexts/ProjectsContext";
import { type Project } from "@/types/source";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { projects, refreshProjects } = useProjects();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleProjectCreated = () => {
    refreshProjects().catch(console.error);
  };

  return (
    <Sidebar className="w-60 sticky top-0 h-screen border-r bg-sidebar" collapsible="none">
      <SidebarContent>
        {/* Dashboard */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/" 
                    end 
                    className="hover:bg-accent/50"
                    activeClassName="bg-accent text-accent-foreground font-medium"
                  >
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Projects */}
        <SidebarGroup>
          <div className="flex items-center justify-between px-2">
            <SidebarGroupLabel className="px-0">Projects</SidebarGroupLabel>
            <button
              onClick={() => setIsCreateDialogOpen(true)}
              className="h-5 w-5 flex items-center justify-center rounded hover:bg-accent/50 transition-colors"
              title="Create new project"
            >
              <Plus className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/projects"
                    end
                    className="hover:bg-accent/50"
                    activeClassName="bg-accent text-accent-foreground font-medium"
                  >
                    <FolderOpen className="h-4 w-4" />
                    <span>All Projects</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {projects.map((project) => {
                return (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={`/projects/${project.id}`}
                        className="hover:bg-accent/50 pl-6"
                        activeClassName="bg-accent text-accent-foreground font-medium"
                      >
                        <span className="truncate">{project.name}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Repository (global views) */}
        <SidebarGroup>
          <SidebarGroupLabel>Repository</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/search" 
                    className="hover:bg-accent/50"
                    activeClassName="bg-accent text-accent-foreground font-medium"
                  >
                    <Search className="h-4 w-4" />
                    <span>Search</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/sources" 
                    className="hover:bg-accent/50"
                    activeClassName="bg-accent text-accent-foreground font-medium"
                  >
                    <FileText className="h-4 w-4" />
                    <span>All Knowledge Sources</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/artifacts" 
                    className="hover:bg-accent/50"
                    activeClassName="bg-accent text-accent-foreground font-medium"
                  >
                    <Database className="h-4 w-4" />
                    <span>All Knowledge Artifacts</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onProjectCreated={handleProjectCreated}
      />
    </Sidebar>
  );
}
