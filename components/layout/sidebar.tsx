'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard,
  Users,
  Coins,
  Globe,
  MapPin,
  Package,
  Server,
  FileText,
  GitBranch,
  Key,
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
  isExpanded?: boolean;
}

const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Players',
    href: '/players',
    icon: Users,
  },
  {
    title: 'Economy',
    href: '/economy',
    icon: Coins,
  },
  {
    title: 'World',
    icon: Globe,
    children: [
      {
        title: 'Zones',
        href: '/world/zones',
        icon: MapPin,
      },
      {
        title: 'Items',
        href: '/world/items',
        icon: Package,
      },
    ],
  },
  {
    title: 'Infrastructure',
    icon: Server,
    children: [
      {
        title: 'Logs',
        href: '/infrastructure/logs',
        icon: FileText,
      },
      {
        title: 'CI/CD',
        href: '/infrastructure/cicd',
        icon: GitBranch,
      },
      {
        title: 'API Keys',
        href: '/infrastructure/api-keys',
        icon: Key,
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['World', 'Infrastructure']);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    const isActive = item.href === pathname;
    const isExpanded = expandedItems.includes(item.title);
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return (
        <div key={item.title}>
          <Button
            variant="ghost"
            onClick={() => toggleExpanded(item.title)}
            className={cn(
              "w-full justify-start gap-2 text-left font-medium",
              depth > 0 && "ml-4"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span className="flex-1">{item.title}</span>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          
          {isExpanded && (
            <div className="ml-6 space-y-1">
              {item.children?.map(child => renderNavItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link key={item.title} href={item.href!}>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start gap-2",
            depth > 0 && "ml-4"
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.title}
        </Button>
      </Link>
    );
  };

  return (
    <div className="w-64 border-r bg-card flex flex-col">
      {/* Header */}
      <div className="p-6">
        <h2 className="text-lg font-semibold">MMO RPG</h2>
        <p className="text-sm text-muted-foreground">Dashboard Admin</p>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map(item => renderNavItem(item))}
      </nav>

      <Separator />

      {/* Settings */}
      <div className="p-4">
        <Link href="/settings">
          <Button 
            variant={pathname === '/settings' ? "secondary" : "ghost"}
            className="w-full justify-start gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </Link>
      </div>
    </div>
  );
}