import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Temporary provincesLookup until we can properly import it
const provincesLookup = [
  { value: "AB", label: "Alberta" },
  { value: "BC", label: "British Columbia" },
  { value: "MB", label: "Manitoba" },
  { value: "NB", label: "New Brunswick" },
  { value: "NL", label: "Newfoundland and Labrador" },
  { value: "NS", label: "Nova Scotia" },
  { value: "NT", label: "Northwest Territories" },
  { value: "NU", label: "Nunavut" },
  { value: "ON", label: "Ontario" },
  { value: "PE", label: "Prince Edward Island" },
  { value: "QC", label: "Quebec" },
  { value: "SK", label: "Saskatchewan" },
  { value: "YT", label: "Yukon" }
];

interface DocumentOrganizerProps {
  userId: number;
  onSelectDocument?: (documentId: number) => void;
}

interface Issue {
  id: number;
  name: string;
  description: string;
}

interface SubIssue {
  id: number;
  name: string;
  description: string;
}

// These will come from the database in the real implementation
const MOCK_ISSUES: Issue[] = [
  { id: 1, name: "Housing", description: "Tenancy and rental housing issues" },
  { id: 2, name: "CAS", description: "Children's Aid Society issues" },
  { id: 3, name: "Family Law", description: "Family law matters" },
  { id: 4, name: "Employment", description: "Workplace and employment issues" },
];

const MOCK_SUB_ISSUES: Record<number, SubIssue[]> = {
  1: [ // Housing
    { id: 101, name: "Eviction Notice", description: "Handling eviction notices" },
    { id: 102, name: "Rent Increases", description: "Disputing improper rent increases" },
    { id: 103, name: "Repairs", description: "Getting necessary repairs completed" },
  ],
  2: [ // CAS
    { id: 201, name: "File Disclosure", description: "Requesting and reviewing CAS files" },
    { id: 202, name: "Child Removal", description: "Responding to child apprehension" },
    { id: 203, name: "Supervision Orders", description: "Dealing with supervision orders" },
  ],
  3: [ // Family Law
    { id: 301, name: "Divorce", description: "Filing for divorce" },
    { id: 302, name: "Child Custody", description: "Child custody disputes" },
    { id: 303, name: "Child Support", description: "Child support claims and payments" },
  ],
  4: [ // Employment
    { id: 401, name: "Wrongful Dismissal", description: "Challenging improper termination" },
    { id: 402, name: "Unpaid Wages", description: "Recovering unpaid wages" },
    { id: 403, name: "Workplace Harassment", description: "Addressing workplace harassment" },
  ],
};

interface Document {
  id: number;
  name: string;
  provinceId: string;
  issueId: number;
  subIssueId: number;
}

const MOCK_DOCUMENTS: Document[] = [
  { id: 1001, name: "Tenant's Notice to End Tenancy", provinceId: "ON", issueId: 1, subIssueId: 101 },
  { id: 1002, name: "Request for Repairs Form", provinceId: "ON", issueId: 1, subIssueId: 103 },
  { id: 1003, name: "CAS File Disclosure Request", provinceId: "ON", issueId: 2, subIssueId: 201 },
  { id: 1004, name: "Motion to Change Child Support", provinceId: "ON", issueId: 3, subIssueId: 303 },
  { id: 1005, name: "Tenancy Dispute Application", provinceId: "BC", issueId: 1, subIssueId: 101 },
  { id: 1006, name: "Eviction Notice Response", provinceId: "AB", issueId: 1, subIssueId: 101 },
];

export function DocumentOrganizer({ userId, onSelectDocument }: DocumentOrganizerProps) {
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedIssue, setSelectedIssue] = useState<number | null>(null);
  const [selectedSubIssue, setSelectedSubIssue] = useState<number | null>(null);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // When province, issue, or sub-issue changes, filter the documents
  useEffect(() => {
    let filtered = [...MOCK_DOCUMENTS];
    
    if (selectedProvince) {
      filtered = filtered.filter(doc => doc.provinceId === selectedProvince);
    }
    
    if (selectedIssue) {
      filtered = filtered.filter(doc => doc.issueId === selectedIssue);
      
      if (selectedSubIssue) {
        filtered = filtered.filter(doc => doc.subIssueId === selectedSubIssue);
      }
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(doc => doc.name.toLowerCase().includes(term));
    }
    
    setFilteredDocuments(filtered);
  }, [selectedProvince, selectedIssue, selectedSubIssue, searchTerm]);

  // When an issue is selected, reset the sub-issue
  useEffect(() => {
    setSelectedSubIssue(null);
  }, [selectedIssue]);

  // Handler for selecting a document
  const handleSelectDocument = (documentId: number) => {
    if (onSelectDocument) {
      onSelectDocument(documentId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Province Selector */}
        <div>
          <label htmlFor="province" className="block text-sm font-medium mb-2">
            Province / Territory
          </label>
          <Select value={selectedProvince} onValueChange={setSelectedProvince}>
            <SelectTrigger id="province">
              <SelectValue placeholder="Select province" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Provinces & Territories</SelectLabel>
                {provincesLookup.map((province: { value: string; label: string }) => (
                  <SelectItem key={province.value} value={province.value}>
                    {province.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Legal Issue Selector */}
        <div>
          <label htmlFor="issue" className="block text-sm font-medium mb-2">
            Legal Issue
          </label>
          <Select
            value={selectedIssue?.toString() || ""}
            onValueChange={(value) => setSelectedIssue(parseInt(value))}
            disabled={!selectedProvince}
          >
            <SelectTrigger id="issue">
              <SelectValue placeholder="Select legal issue" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Legal Issues</SelectLabel>
                {MOCK_ISSUES.map((issue) => (
                  <SelectItem key={issue.id} value={issue.id.toString()}>
                    {issue.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Sub-Issue Selector */}
        <div>
          <label htmlFor="subIssue" className="block text-sm font-medium mb-2">
            Sub-Issue
          </label>
          <Select
            value={selectedSubIssue?.toString() || ""}
            onValueChange={(value) => setSelectedSubIssue(parseInt(value))}
            disabled={!selectedIssue}
          >
            <SelectTrigger id="subIssue">
              <SelectValue placeholder="Select sub-issue" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sub-Issues</SelectLabel>
                {selectedIssue && MOCK_SUB_ISSUES[selectedIssue]?.map((subIssue) => (
                  <SelectItem key={subIssue.id} value={subIssue.id.toString()}>
                    {subIssue.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Input
          type="search"
          placeholder="Search documents by name..."
          className="w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Documents Display */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">
          {filteredDocuments.length > 0
            ? `Documents (${filteredDocuments.length})`
            : "No documents match your criteria"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((document) => {
            const province = provincesLookup.find((p: { value: string; label: string }) => p.value === document.provinceId);
            const issue = MOCK_ISSUES.find((i: Issue) => i.id === document.issueId);
            const subIssue = issue && MOCK_SUB_ISSUES[issue.id]?.find((si: SubIssue) => si.id === document.subIssueId);

            return (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">{document.name}</CardTitle>
                  <CardDescription>
                    {province?.label}, {issue?.name}, {subIssue?.name}
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleSelectDocument(document.id)}
                  >
                    View Document
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DocumentOrganizer;