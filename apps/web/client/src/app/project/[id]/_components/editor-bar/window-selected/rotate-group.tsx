import React from 'react';
import { Icons } from '@onlook/ui/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@onlook/ui/tooltip';
import { type FrameData } from '@/components/store/editor/frames';
import { ToolbarButton } from '../toolbar-button';

export function RotateGroup({ frameData }: { frameData: FrameData }) {
    return (
        <Tooltip key="rotate">
            <TooltipTrigger asChild>
                <ToolbarButton
                    className="w-10 hover:bg-background-tertiary/50 text-foreground-onlook"
                    onClick={() => {
                        const { width, height } = frameData.frame.dimension;
                        frameData.frame.dimension.width = height;
                        frameData.frame.dimension.height = width;
                    }}
                >
                    <Icons.Rotate className="h-4 w-4" />
                </ToolbarButton>
            </TooltipTrigger>
            <TooltipContent side="bottom" hideArrow className="mt-1">Rotate Device</TooltipContent>
        </Tooltip>
    );
} 