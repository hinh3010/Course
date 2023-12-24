'use client';

import { Lock } from 'lucide-react';
import PlyrComponent from 'plyr-react';
import 'plyr-react/plyr.css';

interface VideoPlayerProps {
    isLocked: boolean;
    videoUrl: string;
    thumbnail: string;
}

export const VideoPlayer = ({ isLocked, videoUrl, thumbnail }: VideoPlayerProps) => {
    return (
        <div className="relative aspect-video">
            {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800 flex-col gap-y-2 text-secondary">
                    <Lock className="h-8 w-8" />
                    <p className="text-sm">This chapter is locked</p>
                </div>
            )}
            {!isLocked && (
                <PlyrComponent
                    autoPlay={true}
                    playsInline={true}
                    controls
                    source={{
                        type: 'video',
                        ...(thumbnail && { poster: thumbnail }),
                        sources: [
                            {
                                src: videoUrl,
                                provider: 'html5',
                            },
                        ],
                    }}
                />
            )}
        </div>
    );
};
