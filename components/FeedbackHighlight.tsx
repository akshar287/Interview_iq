
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
        <div className={cn("vox-glass flex items-start gap-4 p-5 rounded-2xl hover:bg-white/[0.06] transition-all duration-500 group", className)}>
            <div className="p-3 rounded-xl bg-primary-200/10 text-primary-200 group-hover:scale-110 group-hover:bg-primary-200/20 transition-all duration-300 shadow-[0_0_15px_rgba(202,197,254,0.1)]">
                <Icon size={22} className="drop-shadow-[0_0_8px_rgba(202,197,254,0.4)]" />
            </div>
            <div>
                <h4 className="text-[15px] font-bold text-white/90 tracking-tight">{title}</h4>
                <p className="text-xs text-white/50 mt-1 lines-clamp-2 leading-relaxed font-medium">{description}</p>
            </div>
        </div>
    );
};

export default FeedbackHighlight;
