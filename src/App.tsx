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
import Repository from "./pages/Repository";
import Tags from "./pages/Tags";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/projects" element={<Layout><Projects /></Layout>} />
          <Route path="/projects/:id" element={<Layout><ProjectView /></Layout>} />
          <Route path="/projects/:id/details" element={<Layout><ProjectInfo /></Layout>} />
          <Route path="/sources" element={<Layout><KnowledgeSources /></Layout>} />
          <Route path="/sources/:id" element={<SourceDetail />} />
          <Route path="/repository" element={<Layout><Repository /></Layout>} />
          <Route path="/tags" element={<Layout><Tags /></Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
