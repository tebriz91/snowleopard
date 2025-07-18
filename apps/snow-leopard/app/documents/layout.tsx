"use client"

import { useState, useEffect, ReactNode } from 'react';
import useSWR from 'swr';
import { Chat } from '@/components/chat/chat';
import { ResizablePanel } from '@/components/resizable-panel';

import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { authClient } from '@/lib/auth-client';
import { fetcher } from '@/lib/utils';

export const experimental_ppr = true;

export default function DocumentsLayout({ children }: { children: ReactNode }) {
  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(true);

  const shouldFetchSubscription = !isSessionLoading && !!session?.user?.id;
  const { data: subscriptionData, isLoading: isSubscriptionLoading } = useSWR(
    shouldFetchSubscription ? '/api/user/subscription-status' : null,
    fetcher,
    { revalidateOnFocus: false, refreshInterval: 60000 }
  );

  useEffect(() => {
    const sidebarState = document.cookie.split('; ').find(row => row.startsWith('sidebar_state_left='));
    if (sidebarState) {
      setIsLeftSidebarCollapsed(sidebarState.split('=')[1] === 'false');
    }
  }, []);

  const hasActiveSubscription = 
    !isSubscriptionLoading && 
    !!subscriptionData && 
    subscriptionData.hasActiveSubscription;

  return (
      <SidebarProvider defaultOpenLeft={!isLeftSidebarCollapsed} defaultOpenRight={true}>
        <div className="flex flex-row h-dvh w-full bg-background">
          <AppSidebar user={session?.user} />
          <main className="flex-1 flex flex-row min-w-0">
            <div className="flex-1 min-w-0 overflow-hidden border-r subtle-border">
              {children} 
            </div>
            <ResizablePanel 
              side="right"
              defaultSize={400} 
              minSize={320} 
              maxSize={600}
              className="border-l subtle-border transition-all duration-200"
            >
              <Chat
                initialMessages={[]}
                hasActiveSubscription={hasActiveSubscription}
              />
            </ResizablePanel>
          </main>
        </div>
      </SidebarProvider>
  );
} 