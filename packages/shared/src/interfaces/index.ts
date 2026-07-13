export interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findMany(filter?: Record<string, unknown>): Promise<T[]>;
  save(entity: T): Promise<void>;
  softDelete(id: string): Promise<void>;
}

export interface GraphNode {
  id: string;
  type: string;
  labels: string[];
  properties: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface GraphEdge {
  id: string;
  type: string;
  sourceId: string;
  targetId: string;
  properties: Record<string, unknown>;
  createdAt: Date;
}

export interface GraphQuery {
  match: {
    source?: { type: string; conditions?: Record<string, unknown> };
    target?: { type: string; conditions?: Record<string, unknown> };
    edge?: { type: string; conditions?: Record<string, unknown> };
    maxDepth?: number;
  };
  return: string[];
  orderBy?: string;
  limit?: number;
}

export interface GraphRepository {
  getNode(id: string): Promise<GraphNode | null>;
  getNeighbors(nodeId: string, edgeTypes?: string[]): Promise<GraphNode[]>;
  findPath(sourceId: string, targetId: string, maxDepth: number): Promise<GraphEdge[]>;
  query(query: GraphQuery): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }>;
  createNode(node: GraphNode): Promise<GraphNode>;
  createEdge(edge: GraphEdge): Promise<GraphEdge>;
}
