// Tipos y interfaces para el módulo financiero
export interface Transaction {
  id: string;
  userId: string;
  farmId?: string;
  cropId?: string;
  type: 'income' | 'expense';
  category: TransactionCategory;
  amount: number;
  currency: string;
  description: string;
  date: Date;
  dueDate?: Date;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  reference?: string;
  invoiceNumber?: string;
  supplier?: string;
  customer?: string;
  tags: string[];
  attachments?: string[];
  notes?: string;
  recurring?: RecurringConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecurringConfig {
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  interval: number;
  endDate?: Date;
  nextDue: Date;
}

export type TransactionCategory = 
  // Ingresos
  | 'sales_crops' | 'sales_livestock' | 'sales_products' | 'subsidies' | 'grants' | 'loans' | 'investments' | 'other_income'
  // Gastos
  | 'seeds' | 'fertilizers' | 'pesticides' | 'water' | 'fuel' | 'electricity' | 'equipment' | 'maintenance' 
  | 'labor' | 'transportation' | 'storage' | 'insurance' | 'taxes' | 'rent' | 'veterinary' | 'feed' 
  | 'marketing' | 'administrative' | 'financial' | 'other_expense';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'credit_card' | 'debit_card' | 'check' | 'digital_wallet' | 'other';

export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled' | 'partial';

export interface Budget {
  id: string;
  userId: string;
  name: string;
  description?: string;
  farmId?: string;
  cropId?: string;
  type: 'annual' | 'seasonal' | 'project';
  startDate: Date;
  endDate: Date;
  totalBudget: number;
  currency: string;
  categories: BudgetCategory[];
  status: 'draft' | 'active' | 'completed' | 'archived';
  actualSpent: number;
  actualIncome: number;
  variance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetCategory {
  category: TransactionCategory;
  plannedAmount: number;
  actualAmount: number;
  variance: number;
  percentage: number;
}

export interface FinancialReport {
  id: string;
  userId: string;
  type: 'profit_loss' | 'cash_flow' | 'budget_variance' | 'cost_analysis' | 'roi_analysis';
  name: string;
  period: DatePeriod;
  farmId?: string;
  cropId?: string;
  data: any;
  generatedAt: Date;
  filters: ReportFilters;
}

export interface DatePeriod {
  startDate: Date;
  endDate: Date;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
}

export interface ReportFilters {
  categories?: TransactionCategory[];
  paymentMethods?: PaymentMethod[];
  paymentStatus?: PaymentStatus[];
  minAmount?: number;
  maxAmount?: number;
  tags?: string[];
}

export interface ProfitLossData {
  totalIncome: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  incomeByCategory: CategorySummary[];
  expensesByCategory: CategorySummary[];
  monthlyTrend: MonthlyData[];
}

export interface CategorySummary {
  category: TransactionCategory;
  amount: number;
  percentage: number;
  count: number;
  average: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  profit: number;
}

export interface CashFlowData {
  openingBalance: number;
  closingBalance: number;
  totalInflow: number;
  totalOutflow: number;
  netCashFlow: number;
  dailyFlow: DailyCashFlow[];
  projectedFlow: ProjectedCashFlow[];
}

export interface DailyCashFlow {
  date: Date;
  inflow: number;
  outflow: number;
  balance: number;
}

export interface ProjectedCashFlow {
  date: Date;
  projectedInflow: number;
  projectedOutflow: number;
  projectedBalance: number;
}

export interface ROIAnalysis {
  cropId: string;
  cropName: string;
  totalInvestment: number;
  totalRevenue: number;
  netProfit: number;
  roi: number;
  roiPercentage: number;
  paybackPeriod: number;
  profitMargin: number;
  costPerUnit: number;
  revenuePerUnit: number;
}

export interface FinancialMetrics {
  currentRatio: number;
  debtToEquity: number;
  grossMargin: number;
  netMargin: number;
  operatingMargin: number;
  returnOnAssets: number;
  returnOnEquity: number;
  cashFlowRatio: number;
}

export interface Invoice {
  id: string;
  userId: string;
  type: 'sales' | 'purchase';
  invoiceNumber: string;
  customerId?: string;
  supplierId?: string;
  farmId?: string;
  cropId?: string;
  issueDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  status: InvoiceStatus;
  paymentTerms: string;
  notes?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  taxRate: number;
  discount: number;
  totalPrice: number;
}

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';

export interface Customer {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: Address;
  taxId?: string;
  paymentTerms: string;
  creditLimit?: number;
  totalSales: number;
  outstandingBalance: number;
  lastSaleDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: Address;
  taxId?: string;
  paymentTerms: string;
  category: SupplierCategory;
  totalPurchases: number;
  outstandingBalance: number;
  lastPurchaseDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SupplierCategory = 'seeds' | 'fertilizers' | 'equipment' | 'services' | 'fuel' | 'feed' | 'veterinary' | 'other';

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface FinancialGoal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: 'revenue' | 'profit' | 'cost_reduction' | 'roi' | 'cash_flow';
  targetAmount: number;
  currentAmount: number;
  currency: string;
  deadline: Date;
  progress: number;
  status: 'active' | 'achieved' | 'overdue' | 'cancelled';
  farmId?: string;
  cropId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Utilidades y helpers
export const TRANSACTION_CATEGORIES = {
  income: [
    { value: 'sales_crops', label: 'Venta de Cultivos', icon: '🌾' },
    { value: 'sales_livestock', label: 'Venta de Ganado', icon: '🐄' },
    { value: 'sales_products', label: 'Venta de Productos', icon: '📦' },
    { value: 'subsidies', label: 'Subsidios', icon: '🏛️' },
    { value: 'grants', label: 'Subvenciones', icon: '💰' },
    { value: 'loans', label: 'Préstamos', icon: '🏦' },
    { value: 'investments', label: 'Inversiones', icon: '📈' },
    { value: 'other_income', label: 'Otros Ingresos', icon: '💵' }
  ],
  expense: [
    { value: 'seeds', label: 'Semillas', icon: '🌱' },
    { value: 'fertilizers', label: 'Fertilizantes', icon: '🧪' },
    { value: 'pesticides', label: 'Pesticidas', icon: '🚫' },
    { value: 'water', label: 'Agua/Riego', icon: '💧' },
    { value: 'fuel', label: 'Combustible', icon: '⛽' },
    { value: 'electricity', label: 'Electricidad', icon: '⚡' },
    { value: 'equipment', label: 'Equipos', icon: '🚜' },
    { value: 'maintenance', label: 'Mantenimiento', icon: '🔧' },
    { value: 'labor', label: 'Mano de Obra', icon: '👷' },
    { value: 'transportation', label: 'Transporte', icon: '🚛' },
    { value: 'storage', label: 'Almacenamiento', icon: '🏬' },
    { value: 'insurance', label: 'Seguros', icon: '🛡️' },
    { value: 'taxes', label: 'Impuestos', icon: '📋' },
    { value: 'rent', label: 'Arrendamiento', icon: '🏠' },
    { value: 'veterinary', label: 'Veterinario', icon: '🐕‍🦺' },
    { value: 'feed', label: 'Alimento Animal', icon: '🌽' },
    { value: 'marketing', label: 'Marketing', icon: '📢' },
    { value: 'administrative', label: 'Administrativos', icon: '📊' },
    { value: 'financial', label: 'Financieros', icon: '💳' },
    { value: 'other_expense', label: 'Otros Gastos', icon: '💸' }
  ]
};

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Efectivo', icon: '💵' },
  { value: 'bank_transfer', label: 'Transferencia', icon: '🏦' },
  { value: 'credit_card', label: 'Tarjeta de Crédito', icon: '💳' },
  { value: 'debit_card', label: 'Tarjeta de Débito', icon: '💳' },
  { value: 'check', label: 'Cheque', icon: '📝' },
  { value: 'digital_wallet', label: 'Billetera Digital', icon: '📱' },
  { value: 'other', label: 'Otro', icon: '❓' }
];

export const CURRENCIES = [
  { value: 'USD', label: 'Dólar Americano', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'MXN', label: 'Peso Mexicano', symbol: '$' },
  { value: 'COP', label: 'Peso Colombiano', symbol: '$' },
  { value: 'PEN', label: 'Sol Peruano', symbol: 'S/' },
  { value: 'CRC', label: 'Colón Costarricense', symbol: '₡' },
  { value: 'GTQ', label: 'Quetzal Guatemalteco', symbol: 'Q' },
  { value: 'HNL', label: 'Lempira Hondureña', symbol: 'L' },
  { value: 'NIO', label: 'Córdoba Nicaragüense', symbol: 'C$' },
  { value: 'PAB', label: 'Balboa Panameña', symbol: 'B/.' }
];

// Funciones utilitarias
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const currencyInfo = CURRENCIES.find(c => c.value === currency);
  const symbol = currencyInfo?.symbol || '$';
  
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount).replace(/^/, symbol);
};

export const calculateVariance = (planned: number, actual: number): number => {
  if (planned === 0) return actual > 0 ? 100 : 0;
  return ((actual - planned) / planned) * 100;
};

export const getVarianceColor = (variance: number): string => {
  if (variance > 10) return 'text-red-600';
  if (variance < -10) return 'text-green-600';
  return 'text-yellow-600';
};

export const calculateROI = (investment: number, returns: number): number => {
  if (investment === 0) return 0;
  return ((returns - investment) / investment) * 100;
};

export const getCategoryIcon = (category: TransactionCategory): string => {
  const allCategories = [...TRANSACTION_CATEGORIES.income, ...TRANSACTION_CATEGORIES.expense];
  return allCategories.find(c => c.value === category)?.icon || '💼';
};

export const getCategoryLabel = (category: TransactionCategory): string => {
  const allCategories = [...TRANSACTION_CATEGORIES.income, ...TRANSACTION_CATEGORIES.expense];
  return allCategories.find(c => c.value === category)?.label || category;
};

export const groupTransactionsByPeriod = (
  transactions: Transaction[],
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
): { [key: string]: Transaction[] } => {
  return transactions.reduce((groups, transaction) => {
    let key: string;
    const date = new Date(transaction.date);
    
    switch (period) {
      case 'daily':
        key = date.toISOString().split('T')[0];
        break;
      case 'weekly':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'monthly':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'yearly':
        key = String(date.getFullYear());
        break;
    }
    
    if (!groups[key]) groups[key] = [];
    groups[key].push(transaction);
    return groups;
  }, {} as { [key: string]: Transaction[] });
};
