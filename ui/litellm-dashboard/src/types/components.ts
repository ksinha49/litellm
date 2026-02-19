/**
 * Shared component types for the LiteLLM Dashboard
 *
 * This file contains common prop types and component interfaces.
 * Import these types instead of defining ad-hoc prop types.
 */

import { ReactNode } from "react";
import { Organization, Member } from "@/components/networking";
import { Team, KeyResponse } from "@/components/key_team_helpers/key_list";
import { UserInfo } from "@/components/view_users/types";
import { Metadata, RefreshCallback } from "./api";

// ============================================================================
// Common Prop Patterns
// ============================================================================

/**
 * Props for components that need access token authentication
 */
export interface WithAccessToken {
  accessToken: string;
}

/**
 * Props for components that display loading state
 */
export interface WithLoading {
  isLoading?: boolean;
  loadingText?: string;
}

/**
 * Props for components that can show errors
 */
export interface WithError {
  error?: string | null;
  onErrorDismiss?: () => void;
}

/**
 * Props for modal components
 */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
}

/**
 * Props for confirmation modals
 */
export interface ConfirmModalProps extends ModalProps {
  onConfirm: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean;
  variant?: "danger" | "warning" | "info";
}

// ============================================================================
// Entity-Specific Props
// ============================================================================

/**
 * Props for components that work with teams
 */
export interface WithTeam {
  selectedTeam?: Team | null;
  teams?: Team[];
  onTeamChange?: (team: Team | null) => void;
}

/**
 * Props for components that work with organizations
 */
export interface WithOrganization {
  currentOrg?: Organization | null;
  organizations?: Organization[];
  onOrgChange?: (org: Organization | null) => void;
}

/**
 * Props for components that work with users
 */
export interface WithUser {
  userID?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
}

/**
 * Props for components that work with keys
 */
export interface WithKey {
  selectedKey?: KeyResponse | null;
  keys?: KeyResponse[];
  onKeyChange?: (key: KeyResponse | null) => void;
}

// ============================================================================
// Dashboard Context Props
// ============================================================================

/**
 * Common props passed down through the dashboard
 * Use this interface for components that need access to dashboard-level state
 */
export interface DashboardContextProps extends WithAccessToken, WithUser, WithOrganization {
  premiumUser?: boolean;
  teams?: Team[];
  userModels?: string[];
  serverRootPath?: string;
}

/**
 * Props for components that support refresh functionality
 */
export interface WithRefresh {
  onRefresh?: RefreshCallback;
  refreshInterval?: number;
}

// ============================================================================
// Table/List Component Props
// ============================================================================

/**
 * Props for paginated list components
 */
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

/**
 * Props for sortable list components
 */
export interface SortableProps<T extends string = string> {
  sortColumn?: T;
  sortDirection?: "asc" | "desc";
  onSort?: (column: T) => void;
}

/**
 * Props for filterable list components
 */
export interface FilterableProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  filters?: Record<string, unknown>;
  onFilterChange?: (filters: Record<string, unknown>) => void;
}

/**
 * Combined props for data table components
 */
export interface DataTableProps<T, S extends string = string>
  extends PaginationProps,
    SortableProps<S>,
    FilterableProps,
    WithLoading,
    WithError {
  data: T[];
  onRowClick?: (row: T) => void;
  selectedRows?: T[];
  onSelectionChange?: (rows: T[]) => void;
}

// ============================================================================
// Form Component Props
// ============================================================================

/**
 * Base props for form components
 */
export interface FormProps<T> {
  initialValues?: Partial<T>;
  onSubmit: (values: T) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

/**
 * Props for form fields
 */
export interface FormFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  help?: string;
}

// ============================================================================
// Action Button Props
// ============================================================================

/**
 * Props for action buttons that perform async operations
 */
export interface AsyncActionButtonProps {
  onClick: () => void | Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

// ============================================================================
// Chart Component Props
// ============================================================================

/**
 * Common props for chart components
 */
export interface ChartProps {
  data: unknown[];
  height?: number;
  width?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
}

/**
 * Props for time-series charts
 */
export interface TimeSeriesChartProps extends ChartProps {
  xAxisKey: string;
  yAxisKey: string | string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}
