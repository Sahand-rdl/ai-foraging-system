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
  trustworthinessReason?: string;
  projectId: number; // PID
  isFavourite: boolean;
  path?: string; // Path to raw PDF
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
  { id: 4, name: "Dr. David Brown", email: "david.brown@tech.com" },
  { id: 5, name: "Dr. Elena Rodriguez", email: "elena.r@global.org" },
  { id: 6, name: "Mr. Frank Miller", email: "frank.miller@lab.io" },
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
  {
    id: 3,
    name: "Natural Language Processing for Finance",
    mlProjectDefinition: "Developing specialized language models for financial sentiment analysis and automated report generation.",
    knowledgeSourceIds: [5, 6, 7],
    researcherIds: [1, 4, 5],
    tags: ["nlp", "finance", "sentiment analysis", "bert"],
  },
  {
    id: 4,
    name: "Robotics and Control Systems",
    mlProjectDefinition: "Applying reinforcement learning to complex robotic manipulation tasks and autonomous navigation.",
    knowledgeSourceIds: [8, 9, 10],
    researcherIds: [3, 6],
    tags: ["robotics", "reinforcement learning", "control systems", "automation"],
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
  {
    id: 5,
    metadata: {
      title: "FinBERT: Financial Sentiment Analysis with Pre-trained Language Models",
      authors: "Araci",
      date: "2019-08-27",
      venue: "arXiv",
      url: "https://arxiv.org/abs/1908.09822",
    },
    rawText: "FinBERT is a pre-trained NLP model to analyze sentiment of financial text. It is built by further training the BERT language model in the finance domain, using a large financial corpus...",
    knowledgeArtifactIds: [7, 8],
    trustworthiness: "High",
    projectId: 3,
    isFavourite: true,
  },
  {
    id: 6,
    metadata: {
      title: "Language Models for Finance",
      authors: "Various",
      date: "2021-03-15",
      venue: "Financial AI Journal",
    },
    rawText: "The application of large-scale language models to financial data presents unique challenges, including specialized terminology and the need for temporal awareness...",
    knowledgeArtifactIds: [9],
    trustworthiness: "Medium",
    projectId: 3,
    isFavourite: false,
  },
  {
    id: 7,
    metadata: {
      title: "Sentiment Analysis in Financial Documents",
      authors: "Loughran, McDonald",
      date: "2011-02-01",
      venue: "Journal of Finance",
    },
    rawText: "We show that word lists developed for other disciplines often misclassify sentiment in financial contexts. We provide a new financial word list that better captures sentiment...",
    knowledgeArtifactIds: [10],
    trustworthiness: "High",
    projectId: 3,
    isFavourite: false,
  },
  {
    id: 8,
    metadata: {
      title: "Proximal Policy Optimization Algorithms",
      authors: "Schulman, Wolski, Dhariwal, Radford, Klimov",
      date: "2017-07-20",
      venue: "OpenAI",
      url: "https://arxiv.org/abs/1707.06347",
    },
    rawText: "We propose a new family of policy gradient methods for reinforcement learning, which alternate between sampling data through interaction with the environment, and optimizing a 'surrogate' objective function using stochastic gradient ascent...",
    knowledgeArtifactIds: [11, 12],
    trustworthiness: "High",
    projectId: 4,
    isFavourite: true,
  },
  {
    id: 9,
    metadata: {
      title: "Reinforcement Learning for Robotic Manipulation",
      authors: "Levine, Finn, Darrell, Abbeel",
      date: "2016-01-01",
      venue: "JMLR",
    },
    rawText: "We propose a method for learning vision-based control policies for robotic manipulation tasks. The method uses a guide-policy search algorithm that can efficiently learn complex behaviors...",
    knowledgeArtifactIds: [13],
    trustworthiness: "High",
    projectId: 4,
    isFavourite: false,
  },
  {
    id: 10,
    metadata: {
      title: "Autonomous Navigation in Complex Environments",
      authors: "Thrun, Burgard, Fox",
      date: "2005-01-01",
      venue: "MIT Press",
    },
    rawText: "This book provides a comprehensive introduction to the field of autonomous navigation. It covers topics such as mapping, localization, and path planning...",
    knowledgeArtifactIds: [14, 15],
    trustworthiness: "Medium",
    projectId: 4,
    isFavourite: true,
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
  {
    id: 7,
    type: "Algo",
    title: "FinBERT Training Procedure",
    content: "Fine-tune BERT on TRC2-financial and Reuters datasets with a classification head.",
    status: "final",
    tags: ["finbert", "training", "nlp"],
    notes: "Requires domain-specific tokenization consideration.",
    knowledgeSourceId: 5,
    isBookmarked: true,
    chatHistory: [],
  },
  {
    id: 8,
    type: "Tech",
    title: "Sentiment Scoring Formula",
    content: "Score = (Pos - Neg) / (Pos + Neg + 1)",
    status: "suggestion",
    tags: ["sentiment", "scoring"],
    notes: "Basic heuristic for initial testing.",
    knowledgeSourceId: 5,
    isBookmarked: false,
    chatHistory: [],
  },
  {
    id: 9,
    type: "Def",
    title: "Domain Adaptation in Finance",
    content: "The process of adapting a general-purpose model to the specific nuances of financial language.",
    status: "final",
    tags: ["domain adaptation", "terminology"],
    notes: "",
    knowledgeSourceId: 6,
    isBookmarked: false,
    chatHistory: [],
  },
  {
    id: 10,
    type: "Table",
    title: "Financial Lexicon Performance",
    content: "Loughran-McDonald lexicon outperforms generic Harvard IV-4 lexicon by 12% on earnings calls.",
    status: "final",
    tags: ["lexicon", "benchmark", "finance"],
    notes: "Benchmark results confirm importance of domain-specific lists.",
    knowledgeSourceId: 7,
    isBookmarked: true,
    chatHistory: [],
  },
  {
    id: 11,
    type: "Algo",
    title: "PPO Clip Objective",
    content: "L = E[min(r_t * A_t, clip(r_t, 1-e, 1+e) * A_t)]",
    status: "final",
    tags: ["ppo", "rl", "algorithm"],
    notes: "Prevents large policy updates, ensuring stability.",
    knowledgeSourceId: 8,
    isBookmarked: true,
    chatHistory: [],
  },
  {
    id: 12,
    type: "Figure",
    title: "PPO Training Curves",
    content: "Comparison of PPO vs TRPO and vanilla Policy Gradient on MuJoCo tasks.",
    status: "final",
    tags: ["ppo", "results", "mujoco"],
    notes: "PPO shows faster convergence in most environments.",
    knowledgeSourceId: 8,
    isBookmarked: false,
    chatHistory: [],
  },
  {
    id: 13,
    type: "Tech",
    title: "Reward Shaping for Manipulation",
    content: "R = d_goal - d_current + alpha * (velocity alignment)",
    status: "suggestion",
    tags: ["reward shaping", "robotics"],
    notes: "Need to tune alpha for different arm configurations.",
    knowledgeSourceId: 9,
    isBookmarked: false,
    chatHistory: [],
  },
  {
    id: 14,
    type: "Def",
    title: "SLAM",
    content: "Simultaneous Localization and Mapping: building a map of an unknown environment while keeping track of current location.",
    status: "final",
    tags: ["slam", "navigation"],
    notes: "",
    knowledgeSourceId: 10,
    isBookmarked: true,
    chatHistory: [],
  },
  {
    id: 15,
    type: "Figure",
    title: "Autonomous Path Planning Diagram",
    content: "A* algorithm search tree on a occupancy grid map.",
    status: "suggestion",
    tags: ["path planning", "a*", "navigation"],
    notes: "Visual representation of the search space.",
    knowledgeSourceId: 10,
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
    5: "FinBERT: Financial Sentiment Analysis with Pre-trained Language Models",
    6: "Language Models for Finance",
    7: "Sentiment Analysis in Financial Documents",
    8: "Proximal Policy Optimization Algorithms",
    9: "Reinforcement Learning for Robotic Manipulation",
    10: "Autonomous Navigation in Complex Environments",
  };
  return titles[id] || `Knowledge Source ${id}`;
}
