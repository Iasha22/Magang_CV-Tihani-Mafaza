export interface User {
    id: number;
    name: string;
    email: string;
    role: 'direktur' | 'admin';
}

export interface FlashMessages {
    success?: string;
    error?: string;
    info?: string;
}

export interface PageProps<T = Record<string, unknown>> {
    auth: {
        user: User | null;
    };
    flash: FlashMessages;
    [key: string]: unknown;
}

export interface Customer {
    id: number;
    npsn?: string;
    name: string;
    address?: string;
    contact_person?: string;
    phone?: string;
    npwp?: string;
    orders_count?: number;
    total_revenue?: number;
    created_at?: string;
}

export interface ProductImage {
    id: number;
    product_id: number;
    image_path: string;
    original_name?: string;
    is_primary: boolean;
    caption?: string;
    url: string;
    created_at?: string;
}

export interface StockMutation {
    id: number;
    product_id: number;
    type: 'incoming' | 'outgoing' | 'adjustment';
    formatted_type?: string;
    quantity: number;
    balance_before: number;
    balance_after: number;
    reference_type: string;
    reference_number?: string;
    notes?: string;
    user_id?: number;
    user?: User;
    created_at: string;
}

export interface AuditTrail {
    id: number;
    auditable_type: string;
    auditable_id: number;
    event: string;
    formatted_event?: string;
    user_id?: number;
    user_name: string;
    user?: User;
    old_values?: Record<string, any> | null;
    new_values?: Record<string, any> | null;
    summary?: string;
    ip_address?: string;
    created_at: string;
}

export interface ProductMetrics {
    total_products: number;
    total_inventory_value: number;
    total_selling_value: number;
    low_stock_count: number;
    out_of_stock_count: number;
    average_margin_percentage: number;
}

export interface Product {
    id: number;
    sku?: string;
    name: string;
    description?: string;
    category: 'ATK' | 'Elektronik' | 'Furniture' | 'Buku' | 'Lainnya';
    unit: string;
    reference_price: number;
    reference_cost: number;
    selling_price: number;
    purchase_price: number;
    margin_amount: number;
    margin_percentage: number;
    current_stock: number;
    min_stock: number;
    primary_image?: string;
    primary_image_url?: string | null;
    stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
    images?: ProductImage[];
    stock_mutations?: StockMutation[];
    audit_trails?: AuditTrail[];
    created_at?: string;
    updated_at?: string;
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id?: number;
    product_name: string;
    category: string;
    qty: number;
    unit_price: number;
    cost_price: number;
    subtotal_bruto: number;
    subtotal_cost: number;
    gross_profit: number;
    product?: Product;
}

export interface Transaction {
    id: number;
    order_id: number;
    transaction_date: string;
    invoice_number?: string;
    bruto: number;
    tax_pph22: number;
    tax_ppn: number;
    admin_fee: number;
    va_fee: number;
    net_disbursement: number;
    notes?: string;
}

export interface PaymentDisbursement {
    id: number;
    order_id: number;
    disbursement_date: string;
    amount: number;
    bank_name?: string;
    reference_number?: string;
    status: 'pending' | 'cair' | 'selisih';
    notes?: string;
}

export interface Order {
    id: number;
    siplah_order_id: string;
    order_date: string;
    customer_id: number;
    customer?: Customer;
    status: 'selesai' | 'diproses' | 'menunggu_pencairan' | 'dibatalkan';
    total_bruto: number;
    total_cost: number;
    gross_profit: number;
    margin_percentage: number;
    disbursement_date?: string;
    items_count?: number;
    items?: OrderItem[];
    transaction?: Transaction;
    disbursement?: PaymentDisbursement;
    reconciliation_status?: 'matched' | 'discrepancy' | 'pending';
}

export interface ReconciliationRecord {
    id: number;
    siplah_order_id: string;
    order_date: string;
    school_name: string;
    bruto: number;
    tax_pph22: number;
    tax_ppn: number;
    fees: number;
    expected_net: number;
    actual_disbursement: number;
    difference: number;
    status: 'matched' | 'discrepancy' | 'pending';
    disbursement_date?: string;
}

export interface DashboardMetrics {
    totalRevenue: number;
    totalCost: number;
    grossProfit: number;
    marginPercentage: number;
    totalDisbursed: number;
    totalPendingDisbursement: number;
    totalPph22: number;
    totalPpn: number;
    totalOrders: number;
    completedOrders: number;
}
