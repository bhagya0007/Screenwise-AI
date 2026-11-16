import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
  Calendar,
  Filter,
  PlusCircle,
  CalendarPlus,
} from 'lucide-react';
import { followUpService } from '../services/followUpService';
import { patientService } from '../services/patientService';
import { FollowUpTask, FollowUpStatus, Patient } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { NewFollowUpModal } from '../components/NewFollowUpModal';
import { ClinicalDisclaimer } from '../components/ClinicalDisclaimer';

export const FollowUpsPage: React.FC = () => {
  const [tasks, setTasks] = useState<FollowUpTask[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number>(1);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const [tasksData, patientsData] = await Promise.all([
        followUpService.getAll(),
        patientService.getAll(),
      ]);
      setTasks(tasksData);
      setPatients(patientsData);
      if (patientsData.length > 0) {
        setSelectedPatientId(patientsData[0].id);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return t.status === 'pending';
    if (statusFilter === 'scheduled') return t.status === 'scheduled';
    if (statusFilter === 'completed') return t.status === 'completed';
    if (statusFilter === 'overdue') return t.status !== 'completed' && t.due_date < todayStr;
    return true;
  });

  const handleStatusChange = async (taskId: number, newStatus: FollowUpStatus) => {
    try {
      await followUpService.update(taskId, {
        status: newStatus,
        completed_date: newStatus === 'completed' ? todayStr : undefined,
      });
      const updated = await followUpService.getAll();
      setTasks(updated);
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const handleDelete = async (taskId: number) => {
    if (!confirm('Are you sure you want to remove this follow-up action?')) return;
    try {
      await followUpService.delete(taskId);
      const updated = await followUpService.getAll();
      setTasks(updated);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const scheduledCount = tasks.filter((t) => t.status === 'scheduled').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const overdueCount = tasks.filter((t) => t.status !== 'completed' && t.due_date < todayStr).length;

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#173A56] flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-[#378C83]" />
            <span>Follow-Up Care Tracker</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Surveillance of pending orders, scheduled appointments, and completed preventive screening tests.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} variant="teal" size="sm">
          <CalendarPlus className="w-3.5 h-3.5" />
          <span>New Follow-Up Action</span>
        </Button>
      </div>

      <ClinicalDisclaimer variant="compact" />

      {/* 4 Summary Stat Mini-Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <Card className="p-3.5">
          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">Pending Actions</span>
          <span className="text-2xl font-bold text-[#173A56] mt-0.5 block">{pendingCount}</span>
          <span className="text-[11px] text-slate-500">Awaiting scheduling</span>
        </Card>
        <Card className="p-3.5">
          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">Scheduled</span>
          <span className="text-2xl font-bold text-[#244e73] mt-0.5 block">{scheduledCount}</span>
          <span className="text-[11px] text-slate-500">Appointment confirmed</span>
        </Card>
        <Card className="p-3.5">
          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">Completed</span>
          <span className="text-2xl font-bold text-[#378C83] mt-0.5 block">{completedCount}</span>
          <span className="text-[11px] text-slate-500">Results verified</span>
        </Card>
        <Card className="p-3.5">
          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">Past Target Date</span>
          <span className="text-2xl font-bold text-rose-600 mt-0.5 block">{overdueCount}</span>
          <span className="text-[11px] text-slate-500">Requires follow-up</span>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 text-xs">
        {[
          { label: `All Tasks (${tasks.length})`, value: 'all' },
          { label: `Pending (${pendingCount})`, value: 'pending' },
          { label: `Scheduled (${scheduledCount})`, value: 'scheduled' },
          { label: `Completed (${completedCount})`, value: 'completed' },
          { label: `Overdue (${overdueCount})`, value: 'overdue' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              statusFilter === tab.value
                ? 'bg-[#173A56] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-[#F6F8FB]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tasks Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#173A56] mx-auto" />
            <p className="text-xs text-slate-400 mt-3">Loading follow-ups...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CalendarCheck className="w-8 h-8 text-[#378C83] mx-auto mb-2 opacity-70" />
            <p className="text-sm font-semibold text-[#173A56]">No follow-up tasks in this category</p>
            <p className="text-xs text-slate-400 mt-1">
              Select another status filter or schedule a new preventive action.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F6F8FB] border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3 px-4">Action / Test Order</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Type & Priority</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map((task) => {
                  const isTaskOverdue = task.status !== 'completed' && task.due_date < todayStr;
                  return (
                    <tr key={task.id} className="hover:bg-[#F6F8FB] transition-colors">
                      <td className="py-3.5 px-4">
                        <p className={`font-semibold text-xs ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-[#173A56]'}`}>
                          {task.title}
                        </p>
                        {task.clinical_notes && (
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                            {task.clinical_notes}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <Link
                          to={`/patients/${task.patient_id}`}
                          className="font-semibold text-[#173A56] hover:text-[#378C83]"
                        >
                          {task.patient_name || `Patient #${task.patient_id}`}
                        </Link>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                            {task.action_type.replace('_', ' ')}
                          </span>
                          {task.priority === 'urgent' && (
                            <Badge variant="danger" size="sm">Urgent</Badge>
                          )}
                          {task.priority === 'moderate' && (
                            <Badge variant="warning" size="sm">Moderate</Badge>
                          )}
                          {task.priority === 'routine' && (
                            <Badge variant="secondary" size="sm">Routine</Badge>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div className={isTaskOverdue ? 'text-rose-600 font-bold' : ''}>
                          {task.due_date}
                        </div>
                        {task.completed_date && (
                          <span className="text-[10px] text-[#378C83] font-semibold block">
                            Done: {task.completed_date}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {task.status === 'completed' ? (
                          <Badge variant="teal">Completed</Badge>
                        ) : task.status === 'scheduled' ? (
                          <Badge variant="navy">Scheduled</Badge>
                        ) : isTaskOverdue ? (
                          <Badge variant="danger">Overdue</Badge>
                        ) : (
                          <Badge variant="warning">Pending</Badge>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {task.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleStatusChange(task.id, 'scheduled')}
                            >
                              Schedule
                            </Button>
                          )}
                          {task.status !== 'completed' ? (
                            <Button
                              variant="teal"
                              size="xs"
                              onClick={() => handleStatusChange(task.id, 'completed')}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Complete</span>
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleStatusChange(task.id, 'pending')}
                            >
                              Reopen
                            </Button>
                          )}

                          <button
                            onClick={() => handleDelete(task.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            title="Delete action"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Global new follow up modal */}
      {selectedPatient && (
        <NewFollowUpModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          patientId={selectedPatient.id}
          patientName={selectedPatient.full_name}
          onTaskCreated={() => fetchTasks()}
        />
      )}
    </div>
  );
};
