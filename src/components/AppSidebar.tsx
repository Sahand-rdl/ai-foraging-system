import { useEffect, useState } from "react";
import { Home, FolderOpen, FileText, Database, ChevronRight } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { fetchProjects } from "@/services/api";
import { type Project } from "@/types/source";

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
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await fetchProjects();
        setProjects(data);
      } catch (error) {
        console.error("Failed to load projects for sidebar", error);
      }
    }
    loadProjects();
  }, []);

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
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
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
    </Sidebar>
  );
}
