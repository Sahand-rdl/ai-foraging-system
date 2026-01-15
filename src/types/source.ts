// ============================================
// Database Types for AI Foraging Application
// Based on whiteboard schema
// ============================================

// --- Researcher (RID) ---
export interface Researcher {
  id: number; // RID
  name: string;
  email: string;
}

// --- Project (PID) ---
export interface Project {
  id: number; // PID
  name: string;
  mlProjectDefinition: string;
  knowledgeSourceIds: number[]; // List of KSID
  researcherIds: number[]; // List of RID
  tags: string[]; // From TF-IDF
}

// --- Knowledge Source (KSID) ---
export type Trustworthiness = "High" | "Medium" | "Low";

export interface KnowledgeSourceMetadata {
  title?: string;
  authors?: string;
  date?: string;
  venue?: string;
  doi?: string;
  url?: string;
  [key: string]: unknown; // Allow additional JSON fields
}

export interface KnowledgeSource {
  id: number; // KSID
  metadata: KnowledgeSourceMetadata; // JSON
  rawText: string;
  knowledgeArtifactIds: number[]; // List of KAID
  trustworthiness: Trustworthiness;
  projectId: number; // PID
  isFavourite: boolean;
}

// --- Knowledge Artifact (KAID) ---
export type KAType = "Figure" | "Table" | "Algo" | "Def" | "Tech";
export type KAStatus = "suggestion" | "final";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface KnowledgeArtifact {
  id: number; // KAID
  type: KAType;
  title: string;
  content: string;
  status: KAStatus;
  tags: string[];
  notes: string;
  knowledgeSourceId: number; // KSID
  externalLink?: string;
  isBookmarked: boolean;
  chatHistory: ChatMessage[];
}

// ============================================
// Mock Data
// ============================================

export const mockResearchers: Researcher[] = [
  { id: 1, name: "Dr. Alice Chen", email: "alice.chen@university.edu" },
  { id: 2, name: "Prof. Bob Martinez", email: "bob.martinez@research.org" },
  { id: 3, name: "Dr. Carol Williams", email: "carol.w@institute.edu" },
];

export const mockProjects: Project[] = [
  {
    id: 1,
    name: "Machine Learning in Healthcare",
    mlProjectDefinition: "Exploring ML applications in diagnostics and treatment planning using transformer-based models for medical image analysis.",
    knowledgeSourceIds: [1, 2],
    researcherIds: [1, 2],
    tags: ["machine learning", "healthcare", "diagnostics", "transformer"],
  },
  {
    id: 2,
    name: "Computer Vision Research",
    mlProjectDefinition: "Investigating state-of-the-art vision architectures including ResNets and Vision Transformers for image classification.",
    knowledgeSourceIds: [3, 4],
    researcherIds: [2, 3],
    tags: ["computer vision", "deep learning", "image classification"],
  },
];

export const mockKnowledgeSources: KnowledgeSource[] = [
  {
    id: 1,
    metadata: {
      title: "Attention Is All You Need",
      authors: "Vaswani, Shazeer, Parmar, Uszkoreit, Jones, Gomez, Kaiser, Polosukhin",
      date: "2017-06-12",
      venue: "NIPS 2017",
      url: "https://arxiv.org/abs/1706.03762",
    },
    rawText: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely...",
    knowledgeArtifactIds: [1, 2],
    trustworthiness: "High",
    projectId: 1,
    isFavourite: true,
  },
  {
    id: 2,
    metadata: {
      title: "BERT: Pre-training of Deep Bidirectional Transformers",
      authors: "Devlin, Chang, Lee, Toutanova",
      date: "2018-10-11",
      venue: "NAACL 2019",
      url: "https://arxiv.org/abs/1810.04805",
    },
    rawText: "We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers...",
    knowledgeArtifactIds: [3],
    trustworthiness: "High",
    projectId: 1,
    isFavourite: false,
  },
  {
    id: 3,
    metadata: {
      title: "Deep Residual Learning for Image Recognition",
      authors: "He, Zhang, Ren, Sun",
      date: "2015-12-10",
      venue: "CVPR 2016",
      url: "https://arxiv.org/abs/1512.03385",
    },
    rawText: "Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions with reference to the layer inputs, instead of learning unreferenced functions...",
    knowledgeArtifactIds: [4, 5],
    trustworthiness: "Medium",
    projectId: 2,
    isFavourite: true,
  },
  {
    id: 4,
    metadata: {
      title: "An Image is Worth 16x16 Words",
      authors: "Dosovitskiy et al.",
      date: "2020-10-22",
      venue: "ICLR 2021",
      url: "https://arxiv.org/abs/2010.11929",
    },
    rawText: "While the Transformer architecture has become the de-facto standard for natural language processing tasks, its applications to computer vision remain limited. In vision, attention is either applied in conjunction with convolutional networks, or used to replace certain components of convolutional networks while keeping their overall structure in place...",
    knowledgeArtifactIds: [6],
    trustworthiness: "Low",
    projectId: 2,
    isFavourite: false,
  },
];

export const mockKnowledgeArtifacts: KnowledgeArtifact[] = [
  {
    id: 1,
    type: "Algo",
    title: "Scaled Dot-Product Attention",
    content: "Attention(Q, K, V) = softmax(QK^T / sqrt(d_k))V",
    status: "final",
    tags: ["attention", "transformer", "algorithm"],
    notes: "Core attention mechanism used in transformer architecture.",
    knowledgeSourceId: 1,
    isBookmarked: true,
    chatHistory: [],
  },
  {
    id: 2,
    type: "Figure",
    title: "Transformer Architecture Diagram",
    content: "Multi-head attention layers with encoder-decoder structure.",
    status: "final",
    tags: ["architecture", "diagram"],
    notes: "",
    knowledgeSourceId: 1,
    externalLink: "https://arxiv.org/abs/1706.03762#fig1",
    isBookmarked: false,
    chatHistory: [],
  },
  {
    id: 3,
    type: "Def",
    title: "BERT Pre-training Objectives",
    content: "Masked Language Model (MLM) and Next Sentence Prediction (NSP).",
    status: "suggestion",
    tags: ["bert", "pre-training"],
    notes: "Need to verify NSP contribution to downstream tasks.",
    knowledgeSourceId: 2,
    isBookmarked: false,
    chatHistory: [
      { role: "user", content: "What is the purpose of NSP?", timestamp: "2024-01-10T10:00:00Z" },
      { role: "assistant", content: "NSP helps BERT understand sentence relationships.", timestamp: "2024-01-10T10:00:05Z" },
    ],
  },
  {
    id: 4,
    type: "Tech",
    title: "Residual Connection Formula",
    content: "y = F(x, {W_i}) + x, where F is the residual mapping.",
    status: "final",
    tags: ["resnet", "residual", "skip connection"],
    notes: "Key innovation enabling very deep networks.",
    knowledgeSourceId: 3,
    isBookmarked: true,
    chatHistory: [],
  },
  {
    id: 5,
    type: "Table",
    title: "ImageNet Classification Results",
    content: "ResNet-152 achieves 3.57% top-5 error on ImageNet.",
    status: "final",
    tags: ["results", "imagenet", "benchmark"],
    notes: "",
    knowledgeSourceId: 3,
    isBookmarked: false,
    chatHistory: [],
  },
  {
    id: 6,
    type: "Algo",
    title: "Vision Transformer Patch Embedding",
    content: "Image is split into 16x16 patches, linearly projected to embedding dimension.",
    status: "suggestion",
    tags: ["vit", "embedding", "patch"],
    notes: "Consider comparing with convolutional stem alternatives.",
    knowledgeSourceId: 4,
    isBookmarked: false,
    chatHistory: [],
  },
];

// ============================================
// Legacy type alias for backward compatibility
// ============================================

/** @deprecated Use KnowledgeSource instead */
export type Source = {
  id: number;
  type: "PDF" | "Link";
  title: string;
  authors: string;
  date: string;
  venue: string;
  trustworthiness: Trustworthiness;
  rating: number;
  tags: string[];
  abstract: string;
  url?: string;
  projectId?: number;
};

/** @deprecated Use mockKnowledgeSources instead */
export const mockSources: Source[] = mockKnowledgeSources.map((ks) => ({
  id: ks.id,
  type: ks.metadata.url?.includes("arxiv") ? "Link" : "PDF",
  title: getKSTitleFromId(ks.id),
  authors: ks.metadata.authors || "",
  date: ks.metadata.date || "",
  venue: ks.metadata.venue || "",
  trustworthiness: ks.trustworthiness,
  rating: ks.isFavourite ? 5 : 3,
  tags: mockProjects.find((p) => p.id === ks.projectId)?.tags.slice(0, 3) || [],
  abstract: ks.rawText,
  url: ks.metadata.url,
  projectId: ks.projectId,
}));

function getKSTitleFromId(id: number): string {
  const titles: Record<number, string> = {
    1: "Attention Is All You Need",
    2: "BERT: Pre-training of Deep Bidirectional Transformers",
    3: "Deep Residual Learning for Image Recognition",
    4: "An Image is Worth 16x16 Words",
  };
  return titles[id] || `Knowledge Source ${id}`;
}
