import { icons, type LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Alias map from common legacy lucide names (and a few synonyms) to the names
 * available in the installed lucide-react. This keeps icon usage resilient
 * across the codebase even when older alias names are referenced.
 */
const ALIASES: Record<string, string> = {
  CheckCircle2: "CircleCheckBig",
  CheckCircle: "CircleCheck",
  XCircle: "CircleX",
  PauseCircle: "CirclePause",
  PlayCircle: "CirclePlay",
  StopCircle: "CircleStop",
  AlertTriangle: "TriangleAlert",
  AlertCircle: "CircleAlert",
  HelpCircle: "CircleQuestionMark",
  InfoCircle: "Info",
  FileEdit: "FilePen",
  Edit: "Pencil",
  Edit2: "Pencil",
  Edit3: "PencilLine",
  BarChart: "ChartColumn",
  BarChart2: "ChartColumn",
  BarChart3: "ChartColumn",
  BarChart4: "ChartColumnBig",
  LineChart: "ChartLine",
  PieChart: "ChartPie",
  Loader2: "LoaderCircle",
  PlusCircle: "CirclePlus",
  MinusCircle: "CircleMinus",
  MoreVertical: "EllipsisVertical",
  MoreHorizontal: "Ellipsis",
  Settings2: "Settings",
  Trash: "Trash2",
  Headphones: "Headphones",
  Headset: "Headset",
};

function resolve(name: string): keyof typeof icons {
  if (name in icons) return name as keyof typeof icons;
  const aliased = ALIASES[name];
  if (aliased && aliased in icons) return aliased as keyof typeof icons;
  return "Circle";
}

interface IconProps extends LucideProps {
  name: string;
}

/** Resolve a lucide icon by name (used by the status + nav systems). */
export function Icon({ name, className, ...props }: IconProps) {
  const Cmp = icons[resolve(name)];
  return <Cmp className={cn("size-4", className)} {...props} />;
}
