/**
 * Indian Statutory GST Engine
 * - Derives taxable value from MRP-inclusive selling price:
 *     Taxable Value = Total MRP / (1 + (GST Rate / 100))
 *     Total Tax = Total MRP - Taxable Value
 * - Applies Intrastate (CGST 50% + SGST 50%) or Interstate (IGST 100%) rules
 *   based on origin warehouse state code and destination shipping address state code.
 */

export const gstService = {
  getWarehouseStateCode() {
    return (process.env.WAREHOUSE_STATE_CODE || 'DL').toUpperCase();
  },

  calculateItemTax(item, destinationStateCode) {
    const unitPrice = parseFloat(item.unitPrice || item.sellingPrice || 0);
    const quantity = parseInt(item.quantity || 1, 10);
    const taxRate = parseFloat(item.taxRate || item.gstRate || 18.0); // e.g. 18.00%
    const totalItemPrice = unitPrice * quantity;

    // Backward calculation: Price is MRP-inclusive
    const taxableValue = parseFloat((totalItemPrice / (1 + taxRate / 100)).toFixed(2));
    const totalTax = parseFloat((totalItemPrice - taxableValue).toFixed(2));

    const warehouseState = this.getWarehouseStateCode();
    const isIntrastate = (destinationStateCode || warehouseState).toUpperCase() === warehouseState;

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isIntrastate) {
      cgst = parseFloat((totalTax / 2).toFixed(2));
      sgst = parseFloat((totalTax - cgst).toFixed(2)); // handle rounding pennies
    } else {
      igst = totalTax;
    }

    return {
      quantity,
      unitPrice,
      totalPrice: totalItemPrice,
      taxableValue,
      taxRate,
      taxAmount: totalTax,
      cgst,
      sgst,
      igst,
      isIntrastate
    };
  },

  calculateOrderTax(items, destinationStateCode) {
    let subtotal = 0;
    let totalTaxableValue = 0;
    let totalTax = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;

    const lineItems = items.map(item => {
      const breakdown = this.calculateItemTax(item, destinationStateCode);
      subtotal += breakdown.totalPrice;
      totalTaxableValue += breakdown.taxableValue;
      totalTax += breakdown.taxAmount;
      totalCgst += breakdown.cgst;
      totalSgst += breakdown.sgst;
      totalIgst += breakdown.igst;
      return {
        ...item,
        ...breakdown
      };
    });

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      taxableValue: parseFloat(totalTaxableValue.toFixed(2)),
      totalTax: parseFloat(totalTax.toFixed(2)),
      cgst: parseFloat(totalCgst.toFixed(2)),
      sgst: parseFloat(totalSgst.toFixed(2)),
      igst: parseFloat(totalIgst.toFixed(2)),
      lineItems
    };
  }
};
