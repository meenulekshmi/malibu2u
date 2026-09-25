'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Save,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Send,
  AlertTriangle,
  FileText,
  HelpCircle,
  Check,
  RefreshCw,
} from 'lucide-react';

interface TemplateItem {
  id: string;
  eventKey: string;
  name: string;
  description: string;
  body: string;
  isActive: boolean;
  autoSend: boolean;
}

interface NotificationLogItem {
  id: string;
  event: string;
  templateKey?: string;
  recipientPhone: string;
  recipientName?: string;
  messageBody: string;
  status: string;
  createdAt: string;
  order?: {
    trackingNumber?: string;
    totalAmount?: number;
  };
}

const AVAILABLE_VARIABLES = [
  { key: '{{customer_name}}', label: 'Customer Name', example: 'Rahul Sharma' },
  { key: '{{customer_phone}}', label: 'Customer Phone', example: '+91 98765 43210' },
  { key: '{{order_number}}', label: 'Order ID / Tracking #', example: 'MB100025' },
  { key: '{{order_date}}', label: 'Order Date', example: '25 Sep 2026' },
  { key: '{{order_total}}', label: 'Total Value (₹)', example: '₹4,999' },
  { key: '{{amount_due}}', label: 'Amount Due (₹)', example: '₹4,999' },
  { key: '{{amount_paid}}', label: 'Amount Paid (₹)', example: '₹4,999' },
  { key: '{{remaining_amount}}', label: 'Remaining COD (₹)', example: '₹0' },
  { key: '{{payment_method}}', label: 'Payment Method', example: 'UPI' },
  { key: '{{payment_reference}}', label: 'Payment UTR/Ref', example: '41238992011' },
  { key: '{{upi_id}}', label: 'Store UPI ID', example: 'malibu2u@upi' },
  { key: '{{product_name}}', label: 'Primary Item Name', example: 'Spider-Man 2 PS5' },
  { key: '{{product_summary}}', label: 'Itemized Order Summary', example: '1. Spider-Man 2 (NEW) - ₹3,499' },
  { key: '{{delivery_address}}', label: 'Delivery Address', example: 'MG Road, Kochi - 682001' },
  { key: '{{tracking_number}}', label: 'Courier Tracking #', example: 'AWB-98712344' },
  { key: '{{store_name}}', label: 'Store Name', example: 'Malibu2u' },
  { key: '{{support_phone}}', label: 'Support Phone', example: '+91 80785 65355' },
  { key: '{{rejection_reason}}', label: 'Payment Rejection Reason', example: 'UTR not matched' },
];

export function WhatsAppMessageTemplatesManager() {
  const [subTab, setSubTab] = useState<'templates' | 'logs'>('templates');
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [logs, setLogs] = useState<NotificationLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<TemplateItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchTemplatesAndLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/whatsapp-templates');
      const data = await res.json();
      if (data.templates) setTemplates(data.templates);
      if (data.logs) setLogs(data.logs);
    } catch (e) {
      console.error('Failed to fetch WhatsApp templates:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplatesAndLogs();
  }, []);

  const handleOpenEdit = (tpl: TemplateItem) => {
    setEditingTemplate({ ...tpl });
    setAlertMsg(null);
  };

  const handleInsertVariable = (variableKey: string) => {
    if (!editingTemplate) return;
    setEditingTemplate({
      ...editingTemplate,
      body: `${editingTemplate.body} ${variableKey}`,
    });
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    setSaving(true);
    setAlertMsg(null);

    try {
      const res = await fetch('/api/admin/whatsapp-templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTemplate),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update template');
      }

      setAlertMsg({ type: 'success', text: `Template "${editingTemplate.name}" saved successfully!` });
      setTemplates(templates.map((t) => (t.id === editingTemplate.id ? editingTemplate : t)));
      setTimeout(() => setEditingTemplate(null), 1200);
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'Save error' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAutoSend = async (tpl: TemplateItem) => {
    try {
      const newAutoSend = !tpl.autoSend;
      const res = await fetch('/api/admin/whatsapp-templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tpl.id, autoSend: newAutoSend }),
      });

      if (res.ok) {
        setTemplates(templates.map((t) => (t.id === tpl.id ? { ...t, autoSend: newAutoSend } : t)));
      }
    } catch (e) {
      console.error('Failed to toggle autoSend:', e);
    }
  };

  const renderPreviewText = (body: string) => {
    let text = body;
    AVAILABLE_VARIABLES.forEach((v) => {
      text = text.split(v.key).join(v.example);
    });
    return text;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-[#111726] to-cyan-950/60 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
            <MessageCircle className="w-4 h-4" /> WhatsApp Automation Hub
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">Message Templates & Automation</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Customize automatic WhatsApp order receipts, payment requests, verification alerts, and courier tracking updates.
          </p>
        </div>

        {/* Subtab navigation */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setSubTab('templates')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              subTab === 'templates'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Templates ({templates.length})
          </button>
          <button
            onClick={() => setSubTab('logs')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              subTab === 'logs'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Notification Logs ({logs.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading WhatsApp configuration...</div>
      ) : subTab === 'templates' ? (
        /* Templates List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="p-5 rounded-2xl bg-[#111726] border border-slate-800 space-y-4 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-cyan-400 bg-cyan-950/40 px-2.5 py-0.5 rounded border border-cyan-500/30">
                    {tpl.eventKey}
                  </span>
                  <button
                    onClick={() => handleToggleAutoSend(tpl)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all border ${
                      tpl.autoSend
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    {tpl.autoSend ? 'Auto Send: ON' : 'Auto Send: OFF'}
                  </button>
                </div>

                <h3 className="font-extrabold text-white text-sm">{tpl.name}</h3>
                <p className="text-xs text-slate-400">{tpl.description}</p>

                {/* Snippet Preview */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-300 whitespace-pre-wrap line-clamp-3">
                  {tpl.body}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(tpl)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" /> Edit Template
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Notification Logs Table */
        <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 overflow-x-auto space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Live WhatsApp Notification Audit Trail</h3>
            <button
              onClick={fetchTemplatesAndLogs}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {logs.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">No WhatsApp notifications logged yet.</p>
          ) : (
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono">
                  <th className="py-3 px-2">Timestamp</th>
                  <th className="py-3 px-2">Order #</th>
                  <th className="py-3 px-2">Event Trigger</th>
                  <th className="py-3 px-2">Recipient</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2">Message Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/60">
                    <td className="py-3 px-2 font-mono text-slate-400 text-[10px]">
                      {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-2 font-mono font-bold text-white">
                      {log.order?.trackingNumber || 'N/A'}
                    </td>
                    <td className="py-3 px-2 font-mono text-cyan-400 text-[10px]">
                      {log.event}
                    </td>
                    <td className="py-3 px-2">
                      <p className="font-bold text-white text-xs">{log.recipientName || 'Customer'}</p>
                      <p className="text-[10px] font-mono text-slate-400">{log.recipientPhone}</p>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        log.status === 'SENT' || log.status === 'DELIVERED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 max-w-xs truncate text-[11px] text-slate-400 font-mono">
                      {log.messageBody}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Edit Template Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#111726] border border-slate-800 rounded-3xl max-w-3xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto my-auto shadow-2xl">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                  TEMPLATE EDITOR
                </span>
                <h3 className="text-lg font-extrabold text-white mt-0.5">{editingTemplate.name}</h3>
                <p className="text-xs text-slate-400">{editingTemplate.description}</p>
              </div>
              <button
                onClick={() => setEditingTemplate(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Close
              </button>
            </div>

            {alertMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-bold ${
                  alertMsg.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}
              >
                {alertMsg.text}
              </div>
            )}

            <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Template Display Name</label>
                <input
                  type="text"
                  required
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                />
              </div>

              {/* Dynamic Variable Chips */}
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Insert Dynamic Variables:
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 rounded-xl bg-slate-950 border border-slate-800">
                  {AVAILABLE_VARIABLES.map((v) => (
                    <button
                      key={v.key}
                      type="button"
                      onClick={() => handleInsertVariable(v.key)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-500/40 text-[11px] font-mono text-cyan-300 transition-colors"
                      title={`Example: ${v.example}`}
                    >
                      + {v.key}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Editor Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-bold">Message Content (WhatsApp Formatted)</label>
                  <button
                    type="button"
                    onClick={() => setPreviewOpen(!previewOpen)}
                    className="text-xs text-cyan-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> {previewOpen ? 'Hide Preview' : 'Show Realistic Preview'}
                  </button>
                </div>

                <textarea
                  rows={8}
                  required
                  value={editingTemplate.body}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs leading-relaxed focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Realistic Preview Dialog Box */}
              {previewOpen && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                      Realistic Customer WhatsApp Preview
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Sample Data Populated</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#075E54]/20 border border-emerald-500/20 text-emerald-100 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                    {renderPreviewText(editingTemplate.body)}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-bold">
                  <input
                    type="checkbox"
                    checked={editingTemplate.autoSend}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, autoSend: e.target.checked })
                    }
                    className="rounded accent-emerald-400 w-4 h-4"
                  />
                  <span>Automatically Send on Event Trigger</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingTemplate(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-slate-950 font-black shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Template'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
