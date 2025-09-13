// Updated VideoPlayerModal component
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import VideoPlayer from './VideoPlayer';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { DialogClose } from '@radix-ui/react-dialog';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  videoName: string;
}

export function VideoPlayerModal({ isOpen, onClose, videoUrl, videoName }: VideoPlayerModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] 
                   min-h-[40vh] max-h-[90vh] p-0 bg-black border-gray-800
                   mx-2 sm:mx-4 my-2 sm:my-4"
      >
        <DialogHeader className="p-2 rounded-full sm:p-4 pb-1 sm:pb-2 flex flex-row items-center justify-between gap-2 relative z-10 bg-black/80 backdrop-blur-sm">
          <DialogTitle
            className="text-white text-xs sm:text-sm truncate flex-1 whitespace-nowrap overflow-hidden text-ellipsis pr-1 sm:pr-2"
            title={videoName}
          >
            <span className='text-white text-xs sm:text-sm truncate flex-1 whitespace-nowrap overflow-hidden text-ellipsis pr-1 sm:pr-2'>
              {/* Shorter truncation on mobile */}
              {videoName.slice(0, window.innerWidth < 640 ? 40 : 80)}
              {videoName.length > (window.innerWidth < 640 ? 40 : 80) && '...'}
            </span>
          </DialogTitle>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 cursor-pointer p-1 sm:p-2 ml-2 sm:ml-4 min-w-0"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="relative overflow-hidden px-2 sm:px-4 pb-2 sm:pb-4">
          <VideoPlayer url={videoUrl} />
        </div>
      </DialogContent>
    </Dialog>
  );
}