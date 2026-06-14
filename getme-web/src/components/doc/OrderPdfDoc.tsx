import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Strict Hex-Based Light Mode Design Tokens matching your Tailwind setup
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#18181B', // on-surface dark charcoal
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#E4E4E7',
    borderBottomStyle: 'dashed',
    paddingBottom: 15,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#006C4C', // System primary green tone
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timestamp: {
    fontSize: 8,
    color: '#71717A',
    marginTop: 4,
    fontFamily: 'Helvetica-Oblique',
  },
  metaGrid: {
    flexDirection: 'row',
    backgroundColor: '#F4F4F5',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    gap: 15,
  },
  metaColumn: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#71717A',
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 2,
    color: '#18181B',
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#71717A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 15,
    marginBottom: 6,
  },
  routeGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  routeBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#FAFAFA',
  },
  routeTag: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#006C4C',
    textTransform: 'uppercase',
  },
  table: {
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F4F4F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4E7',
    padding: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4F5',
    padding: 8,
    alignItems: 'center',
  },
  colDesc: { flex: 2 },
  colQty: { flex: 0.6, textAlign: 'center' },
  colPrice: { flex: 1, textAlign: 'right' },
  colTotal: { flex: 1, textAlign: 'right' },
  thText: { fontSize: 8, fontWeight: 'bold', color: '#71717A', textTransform: 'uppercase' },
  itemTitle: { fontWeight: 'bold', color: '#18181B' },
  itemSub: { fontSize: 8, color: '#71717A', marginTop: 1 },
  itemNote: { fontSize: 8, color: '#DC2626', fontFamily: 'Helvetica-Oblique', marginTop: 1 },
  summaryWrapper: {
    width: 180,
    alignSelf: 'flex-end',
    backgroundColor: '#F4F4F5',
    borderRadius: 8,
    padding: 10,
    gap: 6,
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryTotalLabel: {
    fontWeight: 'bold',
    color: '#006C4C',
  },
  summaryTotalValue: {
    fontWeight: 'bold',
    color: '#18181B',
  },
  instructionBox: {
    padding: 10,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 8,
  },
});

interface Props {
  store: any;
  savedAddresses: any[];
  timestamp: string;
}

export function OrderPdfDocument({ store, savedAddresses, timestamp }: Props) {
  const calculatedItemsSubtotal = store.items.reduce((acc: number, item: any) => {
    return acc + ((parseFloat(item.quantity) || 0) * (parseFloat(item.estimated_price_per_unit) || 0));
  }, 0);

  const tip = parseFloat(store.tip_amount) || 0;
  const deliveryDestinationLabel = store.addressMode === 'saved'
    ? savedAddresses.find((a) => a.id === store.delivery_address_id)?.name + ' - ' + savedAddresses.find((a) => a.id === store.delivery_address_id)?.details
    : store.custom_delivery_location?.description;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header Block Layout */}
        <View style={styles.header}>
          <Text style={styles.title}>Order Manifest Statement</Text>
          <Text style={styles.timestamp}>Generated: {timestamp} (Nairobi EAT)</Text>
          
          <View style={styles.metaGrid}>
            <View style={styles.metaColumn}>
              <Text style={styles.metaLabel}>Order Reference Label</Text>
              <Text style={styles.metaValue}>{store.title || 'On-Demand Provision Run'}</Text>
            </View>
            <View style={styles.metaColumn}>
              <Text style={styles.metaLabel}>Target Logistics Window</Text>
              <Text style={styles.metaValue}>
                {store.preferred_pickup_start_time ? new Date(store.preferred_pickup_start_time).toLocaleString() : 'Immediate Route Queue'}
              </Text>
            </View>
          </View>
        </View>

        {/* Core Route Transit Nodes */}
        <Text style={styles.sectionTitle}>Transit Route Targets</Text>
        <View style={styles.routeGrid}>
          <View style={styles.routeBox}>
            <Text style={styles.routeTag}>Origin Node (Market)</Text>
            <Text style={{ marginTop: 3 }}>{store.market_location.description || 'Pinned Map Anchor Coordinates'}</Text>
            <Text style={{ fontSize: 7, color: '#71717A', marginTop: 2 }}>
              Coordinates: {store.market_location.lat.toFixed(5)}, {store.market_location.lng.toFixed(5)}
            </Text>
          </View>
          <View style={styles.routeBox}>
            <Text style={[styles.routeTag, { color: '#E11D48' }]}>Destination Node (Dropoff)</Text>
            <Text style={{ marginTop: 3 }}>{deliveryDestinationLabel || 'Unspecified location coordinates'}</Text>
            {store.addressMode === 'custom' && store.custom_delivery_location && (
              <Text style={{ fontSize: 7, color: '#71717A', marginTop: 2 }}>
                Coordinates: {store.custom_delivery_location.lat.toFixed(5)}, {store.custom_delivery_location.lng.toFixed(5)}
              </Text>
            )}
          </View>
        </View>

        {/* Itemized Table Ledger Block */}
        <Text style={styles.sectionTitle}>Itemized Bill Matrix</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colDesc, styles.thText]}>Product Attributes</Text>
            <Text style={[styles.colQty, styles.thText]}>Qty</Text>
            <Text style={[styles.colPrice, styles.thText]}>Unit Cost</Text>
            <Text style={[styles.colTotal, styles.thText]}>Subtotal</Text>
          </View>
          {store.items.map((item: any, idx: number) => (
            <View key={idx} style={styles.tableRow} wrap={false}>
              <View style={styles.colDesc}>
                <Text style={styles.itemTitle}>{item.product_name || 'Line Item'}</Text>
                {item.shop && <Text style={styles.itemSub}>Stall: {item.shop}</Text>}
                {item.notes && <Text style={styles.itemNote}>Note: "{item.notes}"</Text>}
                <Text style={[styles.itemSub, { fontSize: 7, textTransform: 'uppercase' }]}>
                  Substitutes: {item.substitute_allowed ? 'Allowed' : 'Strict Lock'}
                </Text>
              </View>
              <Text style={[styles.colQty, { fontFamily: 'Courier' }]}>{item.quantity} {item.unit}</Text>
              <Text style={[styles.colPrice, { fontFamily: 'Courier' }]}>Ksh {(item.estimated_price_per_unit || 0).toFixed(2)}</Text>
              <Text style={[styles.colTotal, { fontFamily: 'Courier', fontWeight: 'bold' }]}>
                Ksh {((item.quantity || 0) * (item.estimated_price_per_unit || 0)).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Calculated Totals Valuation Card */}
        <View style={styles.summaryWrapper} wrap={false}>
          <View style={styles.summaryRow}>
            <Text style={{ color: '#71717A' }}>Items Subtotal:</Text>
            <Text style={{ fontFamily: 'Courier' }}>Ksh {calculatedItemsSubtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={{ color: '#71717A' }}>Rider Tip:</Text>
            <Text style={{ fontFamily: 'Courier' }}>Ksh {tip.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: '#E4E4E7', paddingTop: 4, marginTop: 2 }]}>
            <Text style={styles.summaryTotalLabel}>Est. Total:</Text>
            <Text style={[styles.summaryTotalValue, { fontFamily: 'Courier' }]}>Ksh {(calculatedItemsSubtotal + tip).toFixed(2)}</Text>
          </View>
        </View>

        {/* Rider Log Instructions Footer Callout */}
        {store.note_for_rider && (
          <View style={styles.instructionBox} wrap={false}>
            <Text style={[styles.metaLabel, { color: '#006C4C' }]}>Consolidated Rider Dispatch Instructions:</Text>
            <Text style={{ marginTop: 3, fontFamily: 'Helvetica-Oblique', color: '#3F3F46' }}>"{store.note_for_rider}"</Text>
          </View>
        )}

      </Page>
    </Document>
  );
}