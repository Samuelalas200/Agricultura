export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  location: string;
  status: 'disponible' | 'agotado' | 'bajo_stock';
  lastUpdated: Date;
}

export interface Purchase {
  id: string;
  supplier: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  total: number;
  date: Date;
  status: 'pendiente' | 'completado' | 'cancelado';
}

export interface Movement {
  id: string;
  itemName: string;
  type: 'entrada' | 'salida' | 'ajuste';
  quantity: number;
  reason: string;
  date: Date;
  user: string;
}

export class PDFExportService {
  static async exportInventoryReport(inventory: InventoryItem[]): Promise<void> {
    const reportData = this.generateInventoryReportData(inventory);
    const htmlContent = this.generateInventoryReportHTML(reportData);
    this.printPDF(htmlContent, 'Reporte de Inventario');
  }

  static async exportPurchasesReport(purchases: Purchase[]): Promise<void> {
    const reportData = this.generatePurchasesReportData(purchases);
    const htmlContent = this.generatePurchasesReportHTML(reportData);
    this.printPDF(htmlContent, 'Reporte de Compras');
  }

  static async exportMovementsReport(movements: Movement[]): Promise<void> {
    const reportData = this.generateMovementsReportData(movements);
    const htmlContent = this.generateMovementsReportHTML(reportData);
    this.printPDF(htmlContent, 'Reporte de Movimientos');
  }

  private static generateInventoryReportData(inventory: InventoryItem[]) {
    const totalItems = inventory.length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const lowStockItems = inventory.filter(item => item.status === 'bajo_stock').length;
    const outOfStockItems = inventory.filter(item => item.status === 'agotado').length;
    
    const categoryBreakdown = inventory.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = { count: 0, value: 0 };
      }
      acc[item.category].count += 1;
      acc[item.category].value += item.quantity * item.price;
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    return {
      totalItems,
      totalValue,
      lowStockItems,
      outOfStockItems,
      categoryBreakdown,
      inventory: inventory.sort((a, b) => a.name.localeCompare(b.name))
    };
  }

  private static generatePurchasesReportData(purchases: Purchase[]) {
    const totalPurchases = purchases.length;
    const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.total, 0);
    const completedPurchases = purchases.filter(p => p.status === 'completado').length;
    const pendingPurchases = purchases.filter(p => p.status === 'pendiente').length;

    const supplierBreakdown = purchases.reduce((acc, purchase) => {
      if (!acc[purchase.supplier]) {
        acc[purchase.supplier] = { count: 0, total: 0 };
      }
      acc[purchase.supplier].count += 1;
      acc[purchase.supplier].total += purchase.total;
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    return {
      totalPurchases,
      totalSpent,
      completedPurchases,
      pendingPurchases,
      supplierBreakdown,
      purchases: purchases.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    };
  }

  private static generateMovementsReportData(movements: Movement[]) {
    const totalMovements = movements.length;
    const entriesCount = movements.filter(m => m.type === 'entrada').length;
    const exitsCount = movements.filter(m => m.type === 'salida').length;
    const adjustmentsCount = movements.filter(m => m.type === 'ajuste').length;

    const itemBreakdown = movements.reduce((acc, movement) => {
      if (!acc[movement.itemName]) {
        acc[movement.itemName] = { entries: 0, exits: 0, adjustments: 0 };
      }
      if (movement.type === 'entrada') acc[movement.itemName].entries += movement.quantity;
      if (movement.type === 'salida') acc[movement.itemName].exits += movement.quantity;
      if (movement.type === 'ajuste') acc[movement.itemName].adjustments += movement.quantity;
      return acc;
    }, {} as Record<string, { entries: number; exits: number; adjustments: number }>);

    return {
      totalMovements,
      entriesCount,
      exitsCount,
      adjustmentsCount,
      itemBreakdown,
      movements: movements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    };
  }

  private static generateInventoryReportHTML(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reporte de Inventario Agrícola</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
          }
          
          body { 
            font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #1f2937;
            background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #d1fae5 100%);
            min-height: 100vh;
          }
          
          .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 40px 30px;
            background: white;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            border-radius: 20px;
            margin-top: 20px;
            margin-bottom: 20px;
          }
          
          .header { 
            text-align: center; 
            margin-bottom: 40px; 
            padding: 30px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border-radius: 15px;
            color: white;
            position: relative;
            overflow: hidden;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: float 6s ease-in-out infinite;
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          .header h1 { 
            font-size: 32px; 
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            position: relative;
            z-index: 1;
          }
          
          .header p { 
            font-size: 16px;
            opacity: 0.9;
            position: relative;
            z-index: 1;
          }
          
          .stats { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 25px; 
            margin-bottom: 40px; 
          }
          
          .stat-card { 
            background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
            border: 2px solid #e5f3f0;
            border-radius: 15px; 
            padding: 25px; 
            text-align: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            transition: transform 0.2s ease-in-out;
            position: relative;
            overflow: hidden;
          }
          
          .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #10b981, #059669, #047857);
          }
          
          .stat-value { 
            font-size: 28px; 
            font-weight: 700; 
            color: #10b981; 
            margin-bottom: 8px;
            text-shadow: 0 1px 2px rgba(0,0,0,0.05);
          }
          
          .stat-label { 
            font-size: 14px; 
            color: #6b7280;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .section { 
            margin-bottom: 40px;
            background: #ffffff;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border: 1px solid #f3f4f6;
          }
          
          .section h2 { 
            color: #1f2937; 
            font-size: 22px; 
            font-weight: 600;
            margin-bottom: 20px; 
            padding: 15px 20px;
            background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
            border-left: 5px solid #10b981;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px; 
            background: white; 
            border-radius: 12px; 
            overflow: hidden; 
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          
          th, td { 
            padding: 16px 20px; 
            text-align: left; 
            border-bottom: 1px solid #f3f4f6; 
          }
          
          th { 
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            font-weight: 600; 
            color: #374151;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          tr:nth-child(even) { 
            background: #fafafa; 
          }
          
          tr:hover {
            background: #f0fdf4;
            transition: background-color 0.2s ease-in-out;
          }
          
          .status { 
            padding: 6px 12px; 
            border-radius: 20px; 
            font-size: 12px; 
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: inline-flex;
            align-items: center;
            gap: 5px;
          }
          
          .status.disponible { 
            background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
            color: #065f46;
            border: 1px solid #10b981;
          }
          
          .status.bajo_stock { 
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            color: #92400e;
            border: 1px solid #f59e0b;
          }
          
          .status.agotado { 
            background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
            color: #991b1b;
            border: 1px solid #ef4444;
          }
          
          .currency { 
            font-weight: 600; 
            color: #10b981;
            font-size: 16px;
          }
          
          .item-name {
            font-weight: 600;
            color: #1f2937;
            font-size: 15px;
          }
          
          .category-tag {
            background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
            color: #0369a1;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            border: 1px solid #0ea5e9;
          }
          
          .location-info {
            color: #6b7280;
            font-size: 13px;
            font-style: italic;
          }
          
          .footer {
            margin-top: 40px;
            text-align: center;
            padding: 20px;
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            border-radius: 10px;
            color: #6b7280;
            font-size: 12px;
          }
          
          @media print {
            body { 
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              background: white !important;
            }
            .container { 
              padding: 20px;
              box-shadow: none;
              margin: 0;
              border-radius: 0;
            }
            .stats { 
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
            }
            .section {
              box-shadow: none;
              border: 1px solid #e5e7eb;
            }
            .header::before {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌾 Reporte de Inventario Agrícola</h1>
            <p>Sistema de Gestión Campo360 - Generado el ${new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>

          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${data.totalItems}</div>
              <div class="stat-label">Total de Artículos</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">$${data.totalValue.toLocaleString('es-ES')}</div>
              <div class="stat-label">Valor Total</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${data.lowStockItems}</div>
              <div class="stat-label">Stock Bajo</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${data.outOfStockItems}</div>
              <div class="stat-label">Sin Stock</div>
            </div>
          </div>

          <div class="section">
            <h2>📊 Resumen por Categorías</h2>
            <table>
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Cantidad de Artículos</th>
                  <th>Valor Total</th>
                  <th>Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(data.categoryBreakdown).map(([category, stats]: [string, any]) => {
                  const percentage = ((stats.value / data.totalValue) * 100).toFixed(1);
                  return `
                    <tr>
                      <td><span class="category-tag">${category}</span></td>
                      <td><strong>${stats.count}</strong> artículos</td>
                      <td class="currency">$${stats.value.toLocaleString('es-ES')}</td>
                      <td><strong>${percentage}%</strong></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>📦 Inventario Detallado</h2>
            <table>
              <thead>
                <tr>
                  <th>Artículo</th>
                  <th>Categoría</th>
                  <th>Cantidad</th>
                  <th>Precio Unit.</th>
                  <th>Valor Total</th>
                  <th>Ubicación</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                ${data.inventory.map((item: InventoryItem) => `
                  <tr>
                    <td class="item-name">${item.name}</td>
                    <td><span class="category-tag">${item.category}</span></td>
                    <td><strong>${item.quantity}</strong> ${item.unit}</td>
                    <td class="currency">$${item.price.toLocaleString('es-ES')}</td>
                    <td class="currency">$${(item.quantity * item.price).toLocaleString('es-ES')}</td>
                    <td class="location-info">${item.location}</td>
                    <td><span class="status ${item.status}">${item.status.replace('_', ' ').toUpperCase()}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <p><strong>Campo360 - Sistema de Gestión Agrícola</strong></p>
            <p>Este reporte contiene información confidencial de la empresa</p>
            <p>Página 1 de 1 • Reporte generado automáticamente</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generatePurchasesReportHTML(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reporte de Compras</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; }
          .header h1 { color: #3b82f6; font-size: 28px; margin-bottom: 10px; }
          .header p { color: #666; font-size: 14px; }
          .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
          .stat-card { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1px solid #93c5fd; border-radius: 8px; padding: 20px; text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #3b82f6; margin-bottom: 5px; }
          .stat-label { font-size: 14px; color: #666; }
          .section { margin-bottom: 30px; }
          .section h2 { color: #374151; font-size: 20px; margin-bottom: 15px; border-left: 4px solid #3b82f6; padding-left: 15px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background: #f9fafb; font-weight: 600; color: #374151; }
          tr:nth-child(even) { background: #f9fafb; }
          .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
          .status.completado { background: #d1fae5; color: #065f46; }
          .status.pendiente { background: #fef3c7; color: #92400e; }
          .status.cancelado { background: #fee2e2; color: #991b1b; }
          .currency { font-weight: 600; color: #3b82f6; }
          @media print {
            body { -webkit-print-color-adjust: exact; }
            .container { padding: 10px; }
            .stats { grid-template-columns: repeat(4, 1fr); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛒 Reporte de Compras</h1>
            <p>Generado el ${new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>

          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${data.totalPurchases}</div>
              <div class="stat-label">Total de Compras</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">$${data.totalSpent.toLocaleString()}</div>
              <div class="stat-label">Total Gastado</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${data.completedPurchases}</div>
              <div class="stat-label">Completadas</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${data.pendingPurchases}</div>
              <div class="stat-label">Pendientes</div>
            </div>
          </div>

          <div class="section">
            <h2>🏪 Resumen por Proveedor</h2>
            <table>
              <thead>
                <tr>
                  <th>Proveedor</th>
                  <th>Número de Compras</th>
                  <th>Total Gastado</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(data.supplierBreakdown).map(([supplier, stats]: [string, any]) => `
                  <tr>
                    <td>${supplier}</td>
                    <td>${stats.count} compras</td>
                    <td class="currency">$${stats.total.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>📋 Historial de Compras</h2>
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Proveedor</th>
                  <th>Artículos</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                ${data.purchases.map((purchase: Purchase) => `
                  <tr>
                    <td>${new Date(purchase.date).toLocaleDateString('es-ES')}</td>
                    <td><strong>${purchase.supplier}</strong></td>
                    <td>${purchase.items.length} artículos</td>
                    <td class="currency">$${purchase.total.toLocaleString()}</td>
                    <td><span class="status ${purchase.status}">${purchase.status.toUpperCase()}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generateMovementsReportHTML(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reporte de Movimientos</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #f59e0b; padding-bottom: 20px; }
          .header h1 { color: #f59e0b; font-size: 28px; margin-bottom: 10px; }
          .header p { color: #666; font-size: 14px; }
          .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
          .stat-card { background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 1px solid #fcd34d; border-radius: 8px; padding: 20px; text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #f59e0b; margin-bottom: 5px; }
          .stat-label { font-size: 14px; color: #666; }
          .section { margin-bottom: 30px; }
          .section h2 { color: #374151; font-size: 20px; margin-bottom: 15px; border-left: 4px solid #f59e0b; padding-left: 15px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background: #f9fafb; font-weight: 600; color: #374151; }
          tr:nth-child(even) { background: #f9fafb; }
          .movement-type { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
          .movement-type.entrada { background: #d1fae5; color: #065f46; }
          .movement-type.salida { background: #fee2e2; color: #991b1b; }
          .movement-type.ajuste { background: #e0e7ff; color: #3730a3; }
          @media print {
            body { -webkit-print-color-adjust: exact; }
            .container { padding: 10px; }
            .stats { grid-template-columns: repeat(4, 1fr); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Reporte de Movimientos</h1>
            <p>Generado el ${new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>

          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${data.totalMovements}</div>
              <div class="stat-label">Total Movimientos</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${data.entriesCount}</div>
              <div class="stat-label">Entradas</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${data.exitsCount}</div>
              <div class="stat-label">Salidas</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${data.adjustmentsCount}</div>
              <div class="stat-label">Ajustes</div>
            </div>
          </div>

          <div class="section">
            <h2>📦 Resumen por Artículo</h2>
            <table>
              <thead>
                <tr>
                  <th>Artículo</th>
                  <th>Entradas</th>
                  <th>Salidas</th>
                  <th>Ajustes</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(data.itemBreakdown).map(([item, stats]: [string, any]) => `
                  <tr>
                    <td><strong>${item}</strong></td>
                    <td class="movement-type entrada">${stats.entries}</td>
                    <td class="movement-type salida">${stats.exits}</td>
                    <td class="movement-type ajuste">${stats.adjustments}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>📋 Historial de Movimientos</h2>
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Artículo</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Motivo</th>
                  <th>Usuario</th>
                </tr>
              </thead>
              <tbody>
                ${data.movements.map((movement: Movement) => `
                  <tr>
                    <td>${new Date(movement.date).toLocaleDateString('es-ES')}</td>
                    <td><strong>${movement.itemName}</strong></td>
                    <td><span class="movement-type ${movement.type}">${movement.type.toUpperCase()}</span></td>
                    <td>${movement.quantity}</td>
                    <td>${movement.reason}</td>
                    <td>${movement.user}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static printPDF(htmlContent: string, title: string): void {
    // Crear un blob con el contenido HTML
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Abrir en nueva pestaña
    const printWindow = window.open(url, '_blank');
    
    if (printWindow) {
      printWindow.document.title = title;
      
      // Esperar a que cargue el contenido y luego mostrar diálogo de impresión
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          
          // Opcional: cerrar la pestaña después de imprimir/cancelar
          printWindow.onafterprint = () => {
            setTimeout(() => {
              URL.revokeObjectURL(url);
              printWindow.close();
            }, 1000);
          };
        }, 500);
      };
    } else {
      // Fallback si se bloquean popups
      alert('Por favor, permite las ventanas emergentes para exportar el reporte.\nO copia y pega esta URL en una nueva pestaña: ' + url);
    }
  }
}
