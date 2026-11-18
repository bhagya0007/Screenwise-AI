import React, { useState } from 'react';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { FollowUpActionType, FollowUpPriority, FollowUpTaskCreateInput, ScreeningAssessment } from '../types';
import { followUpService } from '../services/followUpService';

interface NewFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: number;
  patientName: string;
  assessment?: ScreeningAssessment | null;
  onTaskCreated: () => void;
}

export const NewFollowUpModal: React.FC<NewFollowUpModalProps> = ({
  isOpen,
  onClose,
  patientId,
  patientName,
  assessment,
  onTaskCreated,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultActionType: FollowUpActionType = 
    assessment?.category === 'cancer_breast' ? 'imaging' :
    assessment?.category === 'cardiovascular' ? 'lab_test' :
    assessment?.category === 'diabetes' ? 'lab_test' :
    assessment?.category === 'cancer_cervical' ? 'consultation' : 'consultation';

  const defaultPriority: FollowUpPriority = 
    assessment?.status === 'flagged_risk' ? 'urgent' :
    assessment?.status === 'overdue' ? 'moderate' : 'routine';

  const defaultTitle = assessment?.suggested_next_steps?.[0] || 'Preventive Screening Follow-Up';

  const [formData, setFormData] = useState<FollowUpTaskCreateInput>({
    patient_id: patientId,
    screening_id: assessment?.id,
    title: defaultTitle,
    action_type: defaultActionType,
    status: 'pending',
    priority: defaultPriority,
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assigned_provider: '',
    clinical_notes: assessment?.flagged_reasons?.join('; ') || '',
  });

  // Keep synced if assessment changes
  React.useEffect(() => {
    if (assessment) {
      setFormData((prev) => ({
        ...prev,
        patient_id: patientId,
        screening_id: assessment.id,
        title: assessment.suggested_next_steps?.[0] || 'Screening Follow-up',
        action_type: defaultActionType,
        priority: defaultPriority,
        clinical_notes: assessment.flagged_reasons?.join('; ') || '',
      }));
    }
  }, [assessment, patientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.due_date) {
      setError('Title and Due Date are required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await followUpService.create(formData);
      onTaskCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule follow-up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create Follow-Up Care Action"
      description={`Schedule preventive next steps for ${patientName}`}
      maxWidth="lg"
    >
      {error && (
        <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Action Title / Order Name *"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g. Order Screening Mammogram, Fasting Lipid Panel, Colonoscopy Consult"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Action Type *"
            value={formData.action_type}
            onChange={(e) => setFormData({ ...formData, action_type: e.target.value as FollowUpActionType })}
            options={[
              { label: 'Lab Test (Blood / Stool / Urine)', value: 'lab_test' },
              { label: 'Diagnostic / Screening Imaging', value: 'imaging' },
              { label: 'Clinical Provider Consultation', value: 'consultation' },
              { label: 'Lifestyle / Nutrition Counseling', value: 'lifestyle' },
              { label: 'Immunization / Vaccine', value: 'vaccine' },
            ]}
          />

          <Select
            label="Clinical Priority *"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as FollowUpPriority })}
            options={[
              { label: 'Urgent (Flagged Clinical Risk)', value: 'urgent' },
              { label: 'Moderate (Overdue Screening)', value: 'moderate' },
              { label: 'Routine (Upcoming / Annual)', value: 'routine' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Target Due Date *"
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            required
          />

          <Input
            label="Assigned Clinic / Provider"
            value={formData.assigned_provider || ''}
            onChange={(e) => setFormData({ ...formData, assigned_provider: e.target.value })}
            placeholder="e.g. Main Hospital Lab, Dr. Smith"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Clinical Instructions / Rationale
          </label>
          <textarea
            rows={3}
            value={formData.clinical_notes || ''}
            onChange={(e) => setFormData({ ...formData, clinical_notes: e.target.value })}
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Patient notes, fasting instructions, preparation guidance..."
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={loading}>
            Schedule Action
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
