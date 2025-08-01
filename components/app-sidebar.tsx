"use client"

import type * as React from "react"
import {
  Calculator,
  ChevronRight,
  Factory,
  FileText,
  Home,
  Package,
  Settings,
  Users,
  BarChart3,
  Database,
  HelpCircle,
  DollarSign,
  ArrowLeftRight,
  FolderOpen,
  Gauge,
  Target,
} from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// Navigation data structure
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "Master",
      icon: Database,
      items: [
        {
          title: "Customer",
          url: "/master/customer",
          icon: Users,
        },
        {
          title: "Part",
          icon: Package,
          items: [
            {
              title: "Drawing",
              url: "/master/part/drawing",
            },
            {
              title: "BOM",
              url: "/master/bom",
            },
            {
              title: "Part",
              url: "/master/part/part",
            },
            {
              title: "Material",
              url: "/master/part/material",
            },
            {
              title: "Standard",
              url: "/master/part/standard",
            },
          ],
        },
        {
          title: "Cutting Speed",
          icon: Gauge,
          items: [
            {
              title: "Material",
              url: "/master/cutting-speed/material",
            },
            {
              title: "Machine",
              url: "/master/cutting-speed/machine",
            },
            {
              title: "Tool",
              url: "/master/cutting-speed/tool",
            },
            {
              title: "Vc",
              url: "/master/cutting-speed/vc",
            },
          ],
        },
        {
          title: "Conventional Machine",
          url: "/master/conventional-machine",
          icon: Factory,
        },
        {
          title: "Currency",
          url: "/master/currency",
          icon: DollarSign,
        },
      ],
    },
    {
      title: "Project",
      icon: FolderOpen,
      items: [
        {
          title: "New Project",
          url: "/project",
        },
        {
          title: "Manual Project",
          url: "/manual-estimation",
        },
      ],
    },
    {
      title: "Manual Estimation",
      url: "/manual-estimation",
      icon: Calculator,
    },
    {
      title: "Weight Calculation",
      url: "/weight-calculation",
      icon: Target,
    },
    {
      title: "Conversion",
      url: "/conversion",
      icon: ArrowLeftRight,
    },
    {
      title: "Data",
      url: "/data",
      icon: Database,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: FileText,
    },
    {
      title: "Chart",
      url: "/chart",
      icon: BarChart3,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
    {
      title: "Help",
      url: "/help",
      icon: HelpCircle,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/" className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Factory className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">AMaCE WebV01</span>
                  <span className="truncate text-xs">Manufacturing ERP</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible asChild defaultOpen={item.title === "Master"} className="group/collapsible">
                      <div>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items?.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                {subItem.items ? (
                                  <Collapsible asChild className="group/collapsible">
                                    <div>
                                      <CollapsibleTrigger asChild>
                                        <SidebarMenuSubButton tooltip={subItem.title}>
                                          {subItem.icon && <subItem.icon />}
                                          <span>{subItem.title}</span>
                                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuSubButton>
                                      </CollapsibleTrigger>
                                      <CollapsibleContent>
                                        <SidebarMenuSub>
                                          {subItem.items?.map((nestedItem) => (
                                            <SidebarMenuSubItem key={nestedItem.title}>
                                              <SidebarMenuSubButton asChild>
                                                <a href={nestedItem.url}>
                                                  <span>{nestedItem.title}</span>
                                                </a>
                                              </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                          ))}
                                        </SidebarMenuSub>
                                      </CollapsibleContent>
                                    </div>
                                  </Collapsible>
                                ) : (
                                  <SidebarMenuSubButton asChild>
                                    <a href={subItem.url}>
                                      {subItem.icon && <subItem.icon />}
                                      <span>{subItem.title}</span>
                                    </a>
                                  </SidebarMenuSubButton>
                                )}
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <a href={item.url}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 text-xs text-muted-foreground">AMaCE WebV01 - Advanced Manufacturing Cost Estimation</div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
