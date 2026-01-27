import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectView from "./pages/ProjectView";
import ProjectInfo from "./pages/ProjectInfo";
import KnowledgeSources from "./pages/KnowledgeSources";
import SourceDetail from "./pages/SourceDetail";



import NotFound from "./pages/NotFound";
import Artifacts from "./pages/Artifacts";
import Search from "./pages/Search";
import { ProjectsProvider } from "./contexts/ProjectsContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ProjectsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><Dashboard /></Layout>} />
            <Route path="/projects" element={<Layout><Projects /></Layout>} />
            <Route path="/projects/:id" element={<Layout><ProjectView /></Layout>} />
            <Route path="/projects/:id/details" element={<Layout><ProjectInfo /></Layout>} />
            <Route path="/sources" element={<Layout><KnowledgeSources /></Layout>} />
            <Route path="/sources/:id" element={<SourceDetail />} />
            <Route path="/projects/:projectId/sources/:id" element={<SourceDetail />} />
            <Route path="/search" element={<Layout><Search /></Layout>} />
            <Route path="/artifacts" element={<Layout><Artifacts /></Layout>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ProjectsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
