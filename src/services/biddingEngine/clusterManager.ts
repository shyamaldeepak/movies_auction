import { ClusterNode, BidRecord } from '../../types/auction';

export const CLUSTER_NODES: ClusterNode[] = [
  {
    id: 'node-us-east-1',
    name: 'US-East-Primary (Virginia)',
    region: 'North America',
    flag: '🇺🇸',
    status: 'online',
    latencyMs: 14,
    isLeader: true,
    lastHeartbeat: Date.now(),
    processedBids: 0,
  },
  {
    id: 'node-us-west-2',
    name: 'US-West-Replication (Oregon)',
    region: 'North America',
    flag: '🇺🇸',
    status: 'online',
    latencyMs: 38,
    isLeader: false,
    lastHeartbeat: Date.now(),
    processedBids: 0,
  },
  {
    id: 'node-eu-central-1',
    name: 'EU-Central-EMEA (Frankfurt)',
    region: 'Europe',
    flag: '🇩🇪',
    status: 'online',
    latencyMs: 52,
    isLeader: false,
    lastHeartbeat: Date.now(),
    processedBids: 0,
  },
  {
    id: 'node-ap-east-1',
    name: 'AP-East-APAC (Tokyo)',
    region: 'Asia Pacific',
    flag: '🇯🇵',
    status: 'online',
    latencyMs: 76,
    isLeader: false,
    lastHeartbeat: Date.now(),
    processedBids: 0,
  },
  {
    id: 'node-ap-south-1',
    name: 'AP-South-India (Mumbai)',
    region: 'South Asia',
    flag: '🇮🇳',
    status: 'online',
    latencyMs: 64,
    isLeader: false,
    lastHeartbeat: Date.now(),
    processedBids: 0,
  },
  {
    id: 'node-sa-east-1',
    name: 'SA-East-LatAm (São Paulo)',
    region: 'South America',
    flag: '🇧🇷',
    status: 'online',
    latencyMs: 88,
    isLeader: false,
    lastHeartbeat: Date.now(),
    processedBids: 0,
  },
  {
    id: 'node-edge-anycast-7',
    name: 'Edge-Relay-Anycast (Global Cloudflare/Cloud Edge)',
    region: 'Global Edge',
    flag: '🌐',
    status: 'online',
    latencyMs: 18,
    isLeader: false,
    lastHeartbeat: Date.now(),
    processedBids: 0,
  },
];

class ClusterEngine {
  private nodes: ClusterNode[] = [...CLUSTER_NODES];
  private bidCounter: number = 0;
  private listeners: ((nodes: ClusterNode[]) => void)[] = [];
  private heartbeatInterval: any = null;

  constructor() {
    this.startHeartbeatMonitor();
  }

  private startHeartbeatMonitor() {
    if (typeof window === 'undefined') return;
    this.heartbeatInterval = setInterval(() => {
      // Simulate realistic network jitter across cluster nodes
      this.nodes = this.nodes.map(node => {
        const jitter = (Math.random() - 0.5) * 6;
        const newLatency = Math.max(8, Math.round(node.latencyMs + jitter));
        return {
          ...node,
          latencyMs: newLatency,
          lastHeartbeat: Date.now(),
          status: node.status === 'degraded' ? (Math.random() > 0.8 ? 'online' : 'degraded') : 'online'
        };
      });
      this.notifyListeners();
    }, 3000);
  }

  public getNodes(): ClusterNode[] {
    return [...this.nodes];
  }

  public getLeader(): ClusterNode {
    return this.nodes.find(n => n.isLeader) || this.nodes[0];
  }

  public processIngressBid(bidData: Omit<BidRecord, 'id' | 'sequenceNumber' | 'clusterNodeId' | 'lockAcquisitionTimeMs'>): BidRecord {
    this.bidCounter++;
    // Ingress node is routed to edge or closest low-latency node, then replicated to leader
    const activeLeader = this.getLeader();
    const lockAcqMs = Math.round(activeLeader.latencyMs * 0.4 + Math.random() * 5);

    // Update node metrics
    this.nodes = this.nodes.map(n => {
      if (n.id === activeLeader.id) {
        return { ...n, processedBids: n.processedBids + 1 };
      }
      return n;
    });
    this.notifyListeners();

    const record: BidRecord = {
      ...bidData,
      id: `bid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sequenceNumber: this.bidCounter,
      clusterNodeId: activeLeader.id,
      lockAcquisitionTimeMs: lockAcqMs,
    };

    return record;
  }

  public switchLeader(targetNodeId: string) {
    this.nodes = this.nodes.map(n => ({
      ...n,
      isLeader: n.id === targetNodeId
    }));
    this.notifyListeners();
  }

  public subscribe(callback: (nodes: ClusterNode[]) => void) {
    this.listeners.push(callback);
    callback(this.getNodes());
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(cb => cb(this.getNodes()));
  }

  public destroy() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
  }
}

export const clusterManager = new ClusterEngine();

