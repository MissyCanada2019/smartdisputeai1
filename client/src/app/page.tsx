"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import OptimizedImage from "@/components/common/OptimizedImage";
import { SidebarHeader, SidebarProvider } from "@/components/ui/sidebar";
import { List, LucideIcon, PanelLeft } from "lucide-react";
import React from "react";

// Corrected import path
import logoPath from "@/public/logo.png";

export default function Home() {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <OptimizedImage
              src={logoPath}
              alt="SmartResolve Logo"
              width={40}
              height={40}
              priority={true}
              className="mr-2"
            />
            <p className="font-bold">SmartResolve</p>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>AI Legal Assistant</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarGroup>
                <SidebarGroupLabel>Landlord Tenant Disputes</SidebarGroupLabel>
                <SidebarMenuItem>
                  <SidebarMenuButton>Ontario</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>British Columbia</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>Alberta</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>Manitoba</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>Quebec</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>New Brunswick</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>Nova Scotia</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>Prince Edward Island</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>Saskatchewan</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>New FoundLand and Labrador</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>NorthWest Territories</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>Yukon</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>Nunavut</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarGroup>
              <SidebarMenuItem>
                <SidebarMenuButton>Document Analysis</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>PDF Letter Generation</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>Automated Dispute Guidance</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <p className="text-xs">© 2024 SmartResolve</p>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 p-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to SmartResolve</CardTitle>
              <CardDescription>
                Get started with your legal dispute resolution.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium leading-none pb-1">
                    Ask a question:
                  </label>
                  <Input type="text" placeholder="Enter your legal query" />
                </div>
                <div>
                  <label className="block text-sm font-medium leading-none pb-1">
                    Describe your issue:
                  </label>
                  <Textarea placeholder="Describe your legal issue in detail" />
                </div>
                <Button>Submit</Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Our Mission: Level the Legal Playing Field</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">
                The legal system was built to serve the people—yet too often, it only serves those who can afford to navigate it. At <strong>SmartDispute Canada</strong>, we say: <em>enough</em>.
                <br /><br />
                We’re taking over the legal system the only way that truly matters: by making it <strong>fair</strong>, <strong>accessible</strong>, and <strong>empowering</strong> for everyone.
                <br /><br />
                You shouldn’t need a law degree or thousands of dollars to understand your rights, defend yourself, or hold others accountable. Through AI-powered document analysis, real Canadian case law comparison, and guided legal form generation, we’re giving people the tools that were once only available to the privileged few.
                <br /><br />
                This isn’t just software. It’s a justice revolution—fueled by truth, technology, and the belief that the law belongs to the people.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
