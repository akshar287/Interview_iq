
import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface FeedbackHighlightProps {
    icon: LucideIcon;
    title: string;
    description: string;
    className?: string;
}

const FeedbackHighlight = ({ icon: Icon, title, description, className }: FeedbackHighlightProps) => {
    return (
        <div className={cn("flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all", className)}>
            <div className="p-2 rounded-xl bg-primary-200/10 text-primary-200">
                <Icon size={20} />
            </div>
            <div>
                <h4 className="text-sm font-semibold text-white/90">{title}</h4>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">{description}</p>
            </div>
        </div>
    );
};

export default FeedbackHighlight;
