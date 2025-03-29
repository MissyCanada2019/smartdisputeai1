import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageSquare } from 'lucide-react';
import ChatBot from './ChatBot';

export default function ChatBotModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="fixed bottom-6 right-6 rounded-full shadow-lg h-12 w-12 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="sr-only">Chat with AI Assistant</DialogTitle>
        <ChatBot isModal onClose={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}