import {
  LayoutGrid,
  Layers,
  Type,
  RectangleHorizontal,
  Box,
  Trash2,
  Copy,
  Plus,
  GripVertical,
  Eye,
  Upload,
  Download,   
  FolderOpen,      
  Undo2,
  Redo2,
  Monitor,
  Smartphone,
  Tablet,
  Settings,
  Search,
  ChevronDown,
  ChevronRight
} from "lucide-react";

export const Icons = {
  // App / UI
  Grid: LayoutGrid,
  Layers,
  Settings,

  // Elements
  Text: Type,
  Button: RectangleHorizontal,
  Container: Box,

  // Actions
  Add: Plus,
  Delete: Trash2,
  Duplicate: Copy,
  Drag: GripVertical,
  Preview: Eye,
  Publish: Upload,
  Download,          // ✅ add
  Undo: Undo2,
  Redo: Redo2,

  // Project / Files
  FolderOpen,        // ✅ add

  // Devices
  Desktop: Monitor,
  Mobile: Smartphone,
  Tablet,

  // Navigation
  Search,
  Expand: ChevronDown,
  Collapse: ChevronRight
};

