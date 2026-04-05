import { usePathname } from "next/navigation";

export type BreadcrumbItem = {
  label: string;
  href: string;
  isCurrentPage?: boolean;
};

const routeLabelMap: Record<string, string> = {};

function formatSegment(segment: string): string {
  if (routeLabelMap[segment]) {
    return routeLabelMap[segment];
  }

  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
    return `ID: ${segment.slice(0, 8)}...`;
  }

  if (/^\d+$/.test(segment)) {
    return `#${segment}`;
  }

  return segment.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname
    .replace(/^\//, "")
    .replace(/\/$/, "")
    .split("/")
    .filter((segment) => segment && !segment.startsWith("(") && !segment.endsWith(")"));

  let currentPath = "";
  return segments.map((segment, index) => {
    currentPath += `/${segment}`;
    return {
      label: formatSegment(segment),
      href: currentPath,
      isCurrentPage: index === segments.length - 1,
    };
  });
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname();
  return generateBreadcrumbs(pathname || "/");
}
