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
} from 'lucide-react';
import { followUpService } from '../services/followUpService';
import { FollowUpTask, FollowUpStatus } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const FollowUpsPage: React.FC = () => {
  const [tasks, setTasks] = useState<FollowUpTask[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const filter = statusFilter === 'all' ? undefined : statusFilter;
      const data = await followUpService.getAll(undefined, filter);
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter]);

  const handleStatusChange = async (taskId: number, newStatus: FollowUpStatus) => {
    try {
      await followUpService.update(taskId, {
        status: newStatus,
        completed_date: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : undefined,
      });
      fetchTasks();
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const handleDelete = async (taskId: number) => {
    if (!confirm('Are you sure you want to remove this follow-up action?')) return;
    try {
      await followUpService.delete(taskId);
      fetchTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-blue-600" />
            <span>Follow-Up Care Tracker</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track preventive screening follow-ups, diagnostic appointments, and test completions.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 text-xs">
        {[
          { label: 'All Tasks', value: 'all' },
          { label: 'Pending', value: 'pending' },
          { label: 'Scheduled', value: 'scheduled' },
          { label: 'Completed', value: 'completed' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              statusFilter === tab.value
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tasks Table / Cards */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            <p className="text-xs text-slate-400 mt-3">Loading follow-up tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-base font-semibold">No follow-up tasks found</p>
            <p className="text-xs text-slate-400 mt-1">
              Select a patient from the directory to assign follow-up care actions.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold text-[11px]">
                  <th className="py-3 px-4">Action / Test Name</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Type & Priority</th>
                  <th className="py-3 px-4">Target Date</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className={`font-semibold text-sm ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {task.title}
                      </p>
                      {task.clinical_notes && (
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {task.clinical_notes}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <Link
                        to={`/patients/${task.patient_id}`}
                        className="font-semibold text-blue-600 hover:text-blue-800"
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
                      <div>{task.due_date}</div>
                      {task.completed_date && (
                        <span className="text-[10px] text-emerald-600 font-semibold block">
                          Completed: {task.completed_date}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {task.status === 'completed' ? (
                        <Badge variant="success">Completed</Badge>
                      ) : task.status === 'scheduled' ? (
                        <Badge variant="info">Scheduled</Badge>
                      ) : (
                        <Badge variant="warning">Pending</Badge>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {task.status !== 'completed' ? (
                          <Button
                            variant="primary"
                            size="sm"
                            className="text-xs py-1 px-2.5"
                            onClick={() => handleStatusChange(task.id, 'completed')}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Complete</span>
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs py-1 px-2.5"
                            onClick={() => handleStatusChange(task.id, 'pending')}
                          >
                            Reopen
                          </Button>
                        )}

                        <button
                          onClick={() => handleDelete(task.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete action"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
