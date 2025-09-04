import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import VideoPlayer from './VideoPlayer';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  videoName: string;
}

export function VideoPlayerModal({ isOpen, onClose, videoUrl, videoName }: VideoPlayerModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[60vw] w-full min-h-[40vh] p-0 bg-black border-gray-800">
        <DialogHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <DialogTitle className="text-white text-lg truncate flex-1" title={videoName}>
            {videoName}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 ml-4"
          >
            {/* <X className="w-4 h-4" /> */}
          </Button>
        </DialogHeader>

        <div className="relative rounded-lg overflow-hidden px-4 pb-4">
          <VideoPlayer url={videoUrl} />
        </div>
      </DialogContent>
    </Dialog>
  );
}