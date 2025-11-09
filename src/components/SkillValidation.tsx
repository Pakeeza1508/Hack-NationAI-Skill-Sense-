import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ThumbsUp, ThumbsDown, Edit, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SkillValidationProps {
  skill: {
    name: string;
    category: string;
    confidence: number;
    evidence?: string[];
    type?: string;
  };
  profileId?: string; // Optional: ID of the skill profile being validated
  onValidated?: () => void;
}

export const SkillValidation = ({ skill, profileId, onValidated }: SkillValidationProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editedConfidence, setEditedConfidence] = useState(skill.confidence);
  const [editedEvidence, setEditedEvidence] = useState(skill.evidence?.join('\n') || '');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleValidation = async (status: 'confirmed' | 'rejected' | 'edited') => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to validate skills.",
          variant: "destructive",
        });
        return;
      }

      const validationData: any = {
        user_id: user.id,
        skill_name: skill.name,
        category: skill.category,
        status,
        original_confidence: skill.confidence,
        edited_confidence: status === 'edited' ? editedConfidence : null,
        original_evidence: skill.evidence,
        edited_evidence: status === 'edited' ? editedEvidence.split('\n').filter(e => e.trim()) : null,
        user_feedback: feedback || null,
      };

      // STEP 4: Add profile ID if provided
      if (profileId) {
        validationData.edited_profile_id = profileId;
      }

      const { error } = await supabase
        .from('validated_skills')
        .insert(validationData);

      if (error) throw error;

      toast({
        title: "Skill Validated",
        description: `${skill.name} has been ${status === 'edited' ? 'updated' : status}.`,
      });

      setShowEditDialog(false);
      setFeedback('');
      onValidated?.();
    } catch (error: any) {
      console.error('Validation error:', error);
      toast({
        title: "Validation Failed",
        description: error.message || "Failed to save validation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleValidation('confirmed')}
        disabled={isSubmitting}
        className="h-8 gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
        title="Confirm this skill"
      >
        <ThumbsUp className="h-4 w-4" />
        <span className="sr-only">Confirm</span>
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => setShowEditDialog(true)}
        disabled={isSubmitting}
        className="h-8 gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        title="Edit this skill"
      >
        <Edit className="h-4 w-4" />
        <span className="sr-only">Edit</span>
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleValidation('rejected')}
        disabled={isSubmitting}
        className="h-8 gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
        title="Reject this skill"
      >
        <ThumbsDown className="h-4 w-4" />
        <span className="sr-only">Reject</span>
      </Button>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Skill: {skill.name}
            </DialogTitle>
            <DialogDescription>
              Update the confidence score, evidence, and provide feedback to improve future analyses.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Confidence Score */}
            <div>
              <Label htmlFor="confidence">Confidence Score (0-100)</Label>
              <Input
                id="confidence"
                type="number"
                min="0"
                max="100"
                value={editedConfidence}
                onChange={(e) => setEditedConfidence(parseInt(e.target.value) || 0)}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Original: {skill.confidence}%
              </p>
            </div>

            {/* Evidence */}
            <div>
              <Label htmlFor="evidence">Evidence (one per line)</Label>
              <Textarea
                id="evidence"
                value={editedEvidence}
                onChange={(e) => setEditedEvidence(e.target.value)}
                placeholder="Enter evidence for this skill, one item per line..."
                className="mt-2 min-h-[150px]"
              />
              <p className="text-sm text-muted-foreground mt-1">
                {skill.evidence?.length || 0} original evidence items
              </p>
            </div>

            {/* Feedback */}
            <div>
              <Label htmlFor="feedback">Feedback (Optional)</Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Why did you make these changes? This helps improve future skill extraction..."
                className="mt-2 min-h-[100px]"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Your feedback helps improve AI accuracy
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleValidation('edited')} disabled={isSubmitting}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
