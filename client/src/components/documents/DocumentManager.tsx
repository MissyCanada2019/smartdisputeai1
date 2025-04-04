import { useState, useEffect, ReactNode } from 'react';
import { Link } from 'wouter';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import {
  Button
} from '@/components/ui/button';
import {
  Input
} from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import {
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Folder, FilePlus, File, FileSearch, Search, FolderPlus, Edit, Trash2, MoveIcon, Upload, InfoIcon } from 'lucide-react';
import type { DocumentFolder, UserDocument, DocumentTemplate } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import DocumentUploader from "@/components/documents/DocumentUploader";

// Schemas for form validation
const createFolderSchema = z.object({
  userId: z.number(),
  name: z.string().min(1, "Folder name is required"),
  description: z.string().optional(),
  isDefault: z.boolean().optional()
});

type CreateFolderFormValues = z.infer<typeof createFolderSchema>;

const moveDocumentSchema = z.object({
  documentId: z.number(),
  folderId: z.number(),
});

type MoveDocumentFormValues = z.infer<typeof moveDocumentSchema>;

interface DocumentManagerProps {
  userId: number;
}

export default function DocumentManager({ userId }: DocumentManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isMoveDocumentOpen, setIsMoveDocumentOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<number | null>(null);
  const [isEditFolderOpen, setIsEditFolderOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<DocumentFolder | null>(null);
  const [isUploadToFolderOpen, setIsUploadToFolderOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Create folder form setup
  const createFolderForm = useForm<CreateFolderFormValues>({
    resolver: zodResolver(createFolderSchema),
    defaultValues: {
      userId,
      name: "",
      description: "",
      isDefault: false
    }
  });
  
  // Edit folder form setup
  const editFolderForm = useForm<CreateFolderFormValues>({
    resolver: zodResolver(createFolderSchema),
    defaultValues: {
      userId,
      name: "",
      description: "",
      isDefault: false
    }
  });
  
  // Move document form setup
  const moveDocumentForm = useForm<MoveDocumentFormValues>({
    resolver: zodResolver(moveDocumentSchema),
    defaultValues: {
      documentId: 0,
      folderId: 0
    }
  });
  
  // Set up user document query
  const { data: userDocuments, isLoading: isLoadingDocuments } = useQuery({
    queryKey: ['/api/user-documents/user', userId, searchQuery],
    queryFn: async () => {
      const endpoint = searchQuery
        ? `/api/user-documents/user/${userId}?search=${encodeURIComponent(searchQuery)}`
        : `/api/user-documents/user/${userId}`;
        
      const response = await apiRequest('GET', endpoint);
      return await response.json() as UserDocument[];
    },
    enabled: !!userId
  });
  
  // Set up folders query
  const { 
    data: folders, 
    isLoading: isLoadingFolders 
  } = useQuery({
    queryKey: ['/api/document-folders/user', userId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/document-folders/user/${userId}`);
      return await response.json() as DocumentFolder[];
    },
    enabled: !!userId
  });
  
  // Set up folder documents query
  const { 
    data: folderDocuments, 
    isLoading: isLoadingFolderDocuments 
  } = useQuery({
    queryKey: ['/api/document-folders', selectedFolder, 'documents'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/document-folders/${selectedFolder}/documents`);
      return await response.json() as UserDocument[];
    },
    enabled: !!selectedFolder
  });
  
  // Template data for displaying template names
  const { data: templates } = useQuery({
    queryKey: ['/api/document-templates'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/document-templates`);
      return await response.json() as DocumentTemplate[];
    }
  });
  
  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: async (data: CreateFolderFormValues) => {
      try {
        // First make sure the userId is a number
        const folderData = {
          ...data,
          userId: Number(data.userId)
        };
        
        console.log('Creating folder with data:', JSON.stringify(folderData));
        
        const response = await apiRequest('POST', '/api/document-folders', folderData);
        console.log('Folder creation response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server error response:', errorText);
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Folder creation successful with result:', JSON.stringify(result));
        return result;
      } catch (error: any) {
        console.error('Folder creation error:', error);
        throw new Error(error.message || 'Error creating folder');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/document-folders/user', userId] });
      toast({
        title: "Folder created",
        description: "Your folder has been created successfully",
      });
      setIsCreateFolderOpen(false);
      createFolderForm.reset({
        userId,
        name: "",
        description: "",
        isDefault: false
      });
    },
    onError: (error: any) => {
      console.error('Create folder mutation error:', error);
      toast({
        title: "Error creating folder",
        description: error.message || "Could not create folder. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Update folder mutation
  const updateFolderMutation = useMutation({
    mutationFn: async (data: CreateFolderFormValues & { id: number }) => {
      const { id, ...folderData } = data;
      const response = await apiRequest('PATCH', `/api/document-folders/${id}`, folderData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/document-folders/user', userId] });
      toast({
        title: "Folder updated",
        description: "Your folder has been updated successfully",
      });
      setIsEditFolderOpen(false);
      setEditingFolder(null);
    },
    onError: (error) => {
      toast({
        title: "Error updating folder",
        description: String(error),
        variant: "destructive"
      });
    }
  });
  
  // Delete folder mutation
  const deleteFolderMutation = useMutation({
    mutationFn: async (folderId: number) => {
      await apiRequest('DELETE', `/api/document-folders/${folderId}`);
      return folderId;
    },
    onSuccess: (folderId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/document-folders/user', userId] });
      
      // If we deleted the currently selected folder, unselect it
      if (selectedFolder === folderId) {
        setSelectedFolder(null);
      }
      
      toast({
        title: "Folder deleted",
        description: "Your folder has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting folder",
        description: "This folder cannot be deleted. It may be a default folder or contain documents.",
        variant: "destructive"
      });
    }
  });
  
  // Move document mutation
  const moveDocumentMutation = useMutation({
    mutationFn: async (data: MoveDocumentFormValues) => {
      const response = await apiRequest('POST', `/api/documents/${data.documentId}/move-to-folder/${data.folderId}`);
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate both document lists
      queryClient.invalidateQueries({ queryKey: ['/api/user-documents/user', userId] });
      if (selectedFolder) {
        queryClient.invalidateQueries({ queryKey: ['/api/document-folders', selectedFolder, 'documents'] });
      }
      
      toast({
        title: "Document moved",
        description: "Your document has been moved successfully",
      });
      
      setIsMoveDocumentOpen(false);
      setSelectedDocument(null);
    },
    onError: (error) => {
      toast({
        title: "Error moving document",
        description: String(error),
        variant: "destructive"
      });
    }
  });
  
  // Handle form submissions
  const onCreateFolderSubmit = (data: CreateFolderFormValues) => {
    createFolderMutation.mutate(data);
  };
  
  const onEditFolderSubmit = (data: CreateFolderFormValues) => {
    if (!editingFolder) return;
    
    updateFolderMutation.mutate({
      ...data,
      id: editingFolder.id
    });
  };
  
  const onMoveDocumentSubmit = (data: MoveDocumentFormValues) => {
    moveDocumentMutation.mutate(data);
  };
  
  // Handle editing folder
  const handleEditFolder = (folder: DocumentFolder) => {
    setEditingFolder(folder);
    editFolderForm.reset({
      userId: folder.userId,
      name: folder.name,
      description: folder.description || "",
      isDefault: folder.isDefault || false
    });
    setIsEditFolderOpen(true);
  };
  
  // Handle deleting folder
  const handleDeleteFolder = (folderId: number) => {
    if (window.confirm("Are you sure you want to delete this folder?")) {
      deleteFolderMutation.mutate(folderId);
    }
  };
  
  // Handle moving document
  const handleMoveDocument = (documentId: number) => {
    setSelectedDocument(documentId);
    moveDocumentForm.setValue('documentId', documentId);
    setIsMoveDocumentOpen(true);
  };
  
  // Find template name from template ID
  const getTemplateName = (templateId: number) => {
    if (!templates) return "Unknown Template";
    const template = templates.find(t => t.id === templateId);
    return template ? template.name : "Unknown Template";
  };
  
  // Render document items
  const renderDocumentItems = (documents: UserDocument[] | undefined, isLoading: boolean) => {
    if (isLoading) {
      return (
        <div className="p-4 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2">Loading documents...</p>
        </div>
      );
    }
    
    if (!documents || documents.length === 0) {
      return (
        <div className="p-4 text-center">
          <File className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No documents found</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
        {documents.map(doc => (
          <Card key={doc.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base truncate">
                {getTemplateName(doc.templateId)}
              </CardTitle>
              <CardDescription className="text-xs">
                Created on {new Date(doc.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  doc.paymentStatus === 'paid' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {doc.paymentStatus === 'paid' ? 'Paid' : 'Pending Payment'}
                </span>
                <span className="text-sm font-medium">${doc.finalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-0">
              <Button asChild variant="ghost" size="sm">
                <Link to={`/document-review/${doc.id}`}>View</Link>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleMoveDocument(doc.id)}
              >
                <MoveIcon className="h-4 w-4 mr-1" />
                Move
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };
  
  // Render folder items
  const renderFolderItems = () => {
    if (isLoadingFolders) {
      return (
        <div className="p-4 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2">Loading folders...</p>
        </div>
      );
    }
    
    if (!folders || folders.length === 0) {
      return (
        <div className="p-4 text-center">
          <Folder className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No folders found</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => setIsCreateFolderOpen(true)}
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            Create First Folder
          </Button>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {folders.map(folder => (
          <Card 
            key={folder.id} 
            className={`cursor-pointer hover:shadow-md transition-shadow ${
              selectedFolder === folder.id ? 'border-primary' : ''
            }`}
            onClick={() => setSelectedFolder(folder.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base flex items-center">
                  <Folder className="h-4 w-4 mr-2" />
                  <span className="truncate">{folder.name}</span>
                </CardTitle>
                {folder.isDefault && (
                  <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                    Default
                  </span>
                )}
              </div>
              <CardDescription className="text-xs truncate">
                {folder.description || 'No description'}
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-0 flex justify-end gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleEditFolder(folder);
                }}
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
              {!folder.isDefault && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleDeleteFolder(folder.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Document Manager</h1>
        <p className="text-gray-500">
          Organize and manage your legal documents in one place
        </p>
      </header>
      
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateFolderOpen(true)}>
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
          <Button variant="outline" asChild>
            <Link to="/document-selection">
              <FilePlus className="h-4 w-4 mr-2" />
              New Document
            </Link>
          </Button>
          <Button 
            variant="secondary"
            onClick={() => setIsUploadToFolderOpen(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Documents
          </Button>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search documents..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Folder Area */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Folders</h2>
          {selectedFolder && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedFolder(null)}
            >
              View All Documents
            </Button>
          )}
        </div>
        
        {renderFolderItems()}
      </div>
      
      {/* Documents Area */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {selectedFolder 
              ? `Documents in ${folders?.find(f => f.id === selectedFolder)?.name || 'Folder'}`
              : searchQuery 
                ? `Search Results: "${searchQuery}"`
                : "All Documents"
            }
          </h2>
          
          {selectedFolder && (
            <Button 
              variant="outline" 
              onClick={() => setIsUploadToFolderOpen(true)}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Documents
            </Button>
          )}
        </div>
        
        {selectedFolder 
          ? renderDocumentItems(folderDocuments, isLoadingFolderDocuments)
          : renderDocumentItems(userDocuments, isLoadingDocuments)}
      </div>
      
      {/* Create Folder Dialog */}
      <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Create a folder to organize your documents.
            </DialogDescription>
          </DialogHeader>
          
          {createFolderMutation.isError && (
            <Alert variant="destructive" className="my-2">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {createFolderMutation.error instanceof Error 
                  ? createFolderMutation.error.message 
                  : "There was an error creating your folder. Please try again."}
              </AlertDescription>
            </Alert>
          )}
          
          <Form {...createFolderForm}>
            <form onSubmit={createFolderForm.handleSubmit(onCreateFolderSubmit)} className="space-y-4">
              <FormField
                control={createFolderForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Folder Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="My Documents" 
                        {...field} 
                        autoFocus 
                        className="focus:border-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createFolderForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Folder description" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createFolderForm.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 rounded text-primary"
                        checked={field.value}
                        onChange={field.onChange}
                        id="default-folder-checkbox"
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal cursor-pointer" htmlFor="default-folder-checkbox">
                      Make this my default folder
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                <p className="flex items-center">
                  <InfoIcon className="h-4 w-4 mr-2 text-gray-400" />
                  All new documents will be automatically saved to your default folder.
                </p>
              </div>
              
              <DialogFooter className="pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateFolderOpen(false)}
                  disabled={createFolderMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createFolderMutation.isPending}
                  className="min-w-[100px]"
                >
                  {createFolderMutation.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                      Creating...
                    </>
                  ) : "Create Folder"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Folder Dialog */}
      <Dialog open={isEditFolderOpen} onOpenChange={setIsEditFolderOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
            <DialogDescription>
              Update your folder details.
            </DialogDescription>
          </DialogHeader>
          
          {updateFolderMutation.isError && (
            <Alert variant="destructive" className="my-2">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {updateFolderMutation.error instanceof Error 
                  ? updateFolderMutation.error.message 
                  : "There was an error updating your folder. Please try again."}
              </AlertDescription>
            </Alert>
          )}
          
          <Form {...editFolderForm}>
            <form onSubmit={editFolderForm.handleSubmit(onEditFolderSubmit)} className="space-y-4">
              <FormField
                control={editFolderForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Folder Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="My Documents" 
                        {...field} 
                        autoFocus 
                        className="focus:border-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editFolderForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Folder description" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editFolderForm.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 rounded text-primary"
                        checked={field.value}
                        onChange={field.onChange}
                        id="edit-default-folder-checkbox"
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal cursor-pointer" htmlFor="edit-default-folder-checkbox">
                      Make this my default folder
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                <p className="flex items-center">
                  <InfoIcon className="h-4 w-4 mr-2 text-gray-400" />
                  All new documents will be automatically saved to your default folder.
                </p>
              </div>
              
              <DialogFooter className="pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditFolderOpen(false);
                    setEditingFolder(null);
                  }}
                  disabled={updateFolderMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updateFolderMutation.isPending}
                  className="min-w-[100px]"
                >
                  {updateFolderMutation.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                      Updating...
                    </>
                  ) : "Update Folder"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Upload to Folder Dialog */}
      <Dialog open={isUploadToFolderOpen} onOpenChange={setIsUploadToFolderOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload Documents to Folder</DialogTitle>
            <DialogDescription>
              Upload your own documents directly to this folder.
            </DialogDescription>
          </DialogHeader>
          
          {selectedFolder && (
            <div className="py-4">
              <DocumentUploader 
                userId={userId}
                folderId={selectedFolder} 
                title="Upload to Folder"
                description="Upload any documents, photos, or files to include in your folder"
                onUploadComplete={(files: any[]) => {
                  // Invalidate folder documents query to refresh the list
                  queryClient.invalidateQueries({ queryKey: ['/api/document-folders', selectedFolder, 'documents'] });
                  setIsUploadToFolderOpen(false);
                  
                  toast({
                    title: "Documents uploaded",
                    description: `Successfully added ${files.length} document${files.length !== 1 ? 's' : ''} to your folder`
                  });
                }}
              />
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsUploadToFolderOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Move Document Dialog */}
      <Dialog open={isMoveDocumentOpen} onOpenChange={setIsMoveDocumentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Document</DialogTitle>
            <DialogDescription>
              Select a folder to move this document to.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...moveDocumentForm}>
            <form onSubmit={moveDocumentForm.handleSubmit(onMoveDocumentSubmit)} className="space-y-4">
              <FormField
                control={moveDocumentForm.control}
                name="folderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination Folder</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a folder" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {folders?.map(folder => (
                          <SelectItem key={folder.id} value={folder.id.toString()}>
                            {folder.name} {folder.isDefault ? "(Default)" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsMoveDocumentOpen(false);
                    setSelectedDocument(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={moveDocumentMutation.isPending}
                >
                  {moveDocumentMutation.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                      Moving...
                    </>
                  ) : "Move Document"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}