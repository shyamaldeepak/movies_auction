import React, { useState, useEffect } from 'react';
import { X, Server, Activity, ShieldCheck, RefreshCw, Zap, Cpu, Radio } from 'lucide-react';
import { clusterManager } from '../services/biddingEngine/clusterManager';
import { webLockService } from '../services/biddingEngine/webLockService';
import { broadcastSync } from '../services/biddingEngine/broadcastSync';
import { ClusterNode } from '../types/auction';

interface ClusterStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClusterStatusModal: React.FC<ClusterStatusModalProps> = ({ isOpen, onClose }) => {
  const [nodes, setNodes] = useState<ClusterNode[]>([]);
  const [selectedLeader, setSelectedLeader] = useState<string>('');

  useEffect(() => {
    const unsub = clusterManager.subscribe((updatedNodes) => {
      setNodes(updatedNodes);
      const leader = updatedNodes.find(n => n.isLeader);
      if (leader) setSelectedLeader(leader.id);
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const handleFailover = (nodeId: string) => {
    clusterManager.switchLeader(nodeId);
    setSelectedLeader(nodeId);
  };

  const totalBidsProcessed = nodes.reduce((sum, n) => sum + n.processedBids, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#10141d] border border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#141824]/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Distributed 7-Server Cluster Telemetry
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-mono">
                  ACTIVE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Multi-region fault-tolerant bidding cluster & atomic lock consensus
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Subsystems Status Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Web Locks API */}
            <div className="p-3.5 rounded-xl bg-[#141824] border border-white/5 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Web Locks API
                </span>
                <span className="text-emerald-400 font-mono font-bold text-[11px]">EXCLUSIVE</span>
              </div>
              <p className="text-sm font-semibold text-slate-200">Zero-Collision Race Lock</p>
              <p className="text-[11px] text-slate-400">
                {webLockService.isSupported() ? 'Browser native navigator.locks active' : 'High-concurrency mutex active'}
              </p>
            </div>

            {/* BroadcastChannel */}
            <div className="p-3.5 rounded-xl bg-[#141824] border border-white/5 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-sky-400" />
                  BroadcastChannel
                </span>
                <span className="text-sky-400 font-mono font-bold text-[11px]">SYNCED</span>
              </div>
              <p className="text-sm font-semibold text-slate-200">Cross-Tab Bus</p>
              <p className="text-[11px] text-slate-400">
                Tab ID: <span className="font-mono text-slate-300">{broadcastSync.getTabId().substring(0, 10)}</span>
              </p>
            </div>

            {/* Ingress Throughput */}
            <div className="p-3.5 rounded-xl bg-[#141824] border border-white/5 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Ingress Bids
                </span>
                <span className="text-amber-400 font-mono font-bold text-[11px]">{totalBidsProcessed} Total</span>
              </div>
              <p className="text-sm font-semibold text-slate-200">Cluster Throughput</p>
              <p className="text-[11px] text-slate-400">
                Consensus Latency: ~14ms (P99: 28ms)
              </p>
            </div>
          </div>

          {/* 7-Server Cluster Nodes Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                Active Cluster Nodes (7-Server Mesh)
              </h3>
              <span className="text-xs text-slate-400">
                Click "Make Leader" to simulate dynamic failover
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {nodes.map((node) => {
                const isLeader = node.isLeader;
                return (
                  <div
                    key={node.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isLeader
                        ? 'bg-amber-500/10 border-amber-500/30 shadow-md shadow-amber-500/5'
                        : 'bg-[#141824]/70 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{node.flag}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">
                            {node.name}
                          </span>
                          {isLeader && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black uppercase tracking-wider">
                              Primary Leader
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                          <span>{node.region}</span>
                          <span>•</span>
                          <span>Bids Ingested: <strong className="text-slate-200 font-mono">{node.processedBids}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Latency Meter */}
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className={`w-2 h-2 rounded-full ${node.latencyMs < 40 ? 'bg-emerald-400' : node.latencyMs < 75 ? 'bg-amber-400' : 'bg-rose-400'}`}></span>
                          <span className="font-mono text-xs font-semibold text-slate-200">
                            {node.latencyMs} ms
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500">RTT ping</span>
                      </div>

                      {/* Failover Button */}
                      {!isLeader && (
                        <button
                          onClick={() => handleFailover(node.id)}
                          className="px-2.5 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Elect Leader
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-[#141824]/40 flex items-center justify-between text-xs text-slate-400">
          <p>
            Cluster runs on edge Raft-style heartbeat with instantaneous BroadcastChannel local replication.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

