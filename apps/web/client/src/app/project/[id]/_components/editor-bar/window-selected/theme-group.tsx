import { SystemTheme } from '@onlook/models/assets';
import { Icons } from '@onlook/ui/icons';
import { toast } from '@onlook/ui/sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@onlook/ui/tooltip';
import { useEffect, useState } from 'react';
import { ToolbarButton } from '../toolbar-button';
import { type FrameData } from '@/components/store/editor/frames';

export function ThemeGroup({ frameData }: { frameData: FrameData }) {
    const [theme, setTheme] = useState<SystemTheme>(SystemTheme.SYSTEM);
    useEffect(() => {
        const getTheme = async () => {
            if (!frameData?.view) {
                console.error('No frame view found');
                return;
            }

            const theme = await frameData.view.getTheme();
            setTheme(theme);
        }
        void getTheme();
    }, [frameData]);

    async function changeTheme(newTheme: SystemTheme) {
        const previousTheme = theme;
        setTheme(newTheme);
        const success = await frameData.view?.setTheme(newTheme);
        if (!success) {
            toast.error('Failed to change theme');
            setTheme(previousTheme);
        }
    }

    return (
        <>
            <Tooltip key="system">
                <TooltipTrigger asChild>
                    <ToolbarButton
                        className={`w-10 ${theme === SystemTheme.SYSTEM ? 'bg-background-secondary hover:bg-background-tertiary text-foreground-primary' : 'hover:bg-background-tertiary/50 text-foreground-onlook'}`}
                        onClick={() => changeTheme(SystemTheme.SYSTEM)}
                    >
                        <Icons.Laptop className="h-4 w-4" />
                    </ToolbarButton>
                </TooltipTrigger>
                <TooltipContent side="bottom" hideArrow className="mt-1">System Theme</TooltipContent>
            </Tooltip>
            <Tooltip key="dark">
                <TooltipTrigger asChild>
                    <ToolbarButton
                        className={`w-10 ${theme === SystemTheme.DARK ? 'bg-background-secondary hover:bg-background-tertiary text-foreground-primary' : 'hover:bg-background-tertiary/50 text-foreground-onlook'}`}
                        onClick={() => changeTheme(SystemTheme.DARK)}
                    >
                        <Icons.Moon className="h-4 w-4" />
                    </ToolbarButton>
                </TooltipTrigger>
                <TooltipContent side="bottom" hideArrow className="mt-1">Dark Theme</TooltipContent>
            </Tooltip>
            <Tooltip key="light">
                <TooltipTrigger asChild>
                    <ToolbarButton
                        className={`w-10 ${theme === SystemTheme.LIGHT ? 'bg-background-secondary hover:bg-background-tertiary text-foreground-primary' : 'hover:bg-background-tertiary/50 text-foreground-onlook'}`}
                        onClick={() => changeTheme(SystemTheme.LIGHT)}
                    >
                        <Icons.Sun className="h-4 w-4" />
                    </ToolbarButton>
                </TooltipTrigger>
                <TooltipContent side="bottom" hideArrow className="mt-1">Light Theme</TooltipContent>
            </Tooltip>
        </>
    );
} 