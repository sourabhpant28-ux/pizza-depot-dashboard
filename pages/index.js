import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, updateDoc, orderBy, query } from 'firebase/firestore';

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [expandedDone, setExpandedDone] = useState({});

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newOrders = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      setOrders(newOrders);
    });
    return () => unsubscribe();
  }, []);

  const markDone = async (id) => {
    await updateDoc(doc(db, 'orders', id), { status: 'done' });
  };

  const toggleExpand = (id) => {
    setExpandedDone(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const printOrder = (order) => {
    const win = window.open('', '_blank');
    const lines = [
      'PIZZA DEPOT LEANDER',
      'NEW ORDER',
      '------------------------',
      'Name: ' + order.customerName,
      'Phone: ' + order.customerPhone,
      'Pickup: ' + order.pickupTime,
      '------------------------',
      order.items,
      '------------------------',
      'Subtotal: ' + order.subtotal,
      'Tax: ' + order.tax,
      'TOTAL: ' + order.total,
    ].join('\n');
    win.document.write('<pre style="font-family:monospace;font-size:14px;width:280px;padding:10px;">' + lines + '</pre>');
    win.document.close();
    win.print();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const newOrders = orders.filter(o => o.status === 'new');
  const doneOrders = orders.filter(o => o.status === 'done');

  return (
    <div style={{maxWidth:600,margin:'0 auto',padding:16,backgroundColor:'#f5f5f5',minHeight:'100vh'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <h1 style={{fontSize:22,fontWeight:'bold',color:'#c0392b',margin:0}}>Pizza Depot Leander</h1>
        <span style={{backgroundColor:'#c0392b',color:'white',borderRadius:20,padding:'4px 12px',fontWeight:'bold'}}>{newOrders.length} New</span>
      </div>

      {newOrders.length === 0 && (
        <div style={{textAlign:'center',padding:40,color:'#888',fontSize:18}}>No new orders - waiting...</div>
      )}

      {newOrders.map(order => (
        <div key={order.id} style={{backgroundColor:'white',borderRadius:12,padding:16,marginBottom:16,boxShadow:'0 2px 8px rgba(0,0,0,0.1)',borderLeft:'5px solid #c0392b'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <span style={{fontSize:20,fontWeight:'bold'}}>{order.customerName}</span>
            <span style={{fontSize:14,color:'#555',backgroundColor:'#fff3cd',padding:'4px 8px',borderRadius:8}}>{order.pickupTime}</span>
          </div>
          <div style={{color:'#555',marginBottom:8}}>{order.customerPhone}</div>
          <pre style={{backgroundColor:'#f9f9f9',padding:10,borderRadius:8,fontSize:14,whiteSpace:'pre-wrap',margin:'8px 0'}}>{order.items}</pre>
          <div style={{display:'flex',gap:16,flexWrap:'wrap',marginBottom:12,fontSize:14}}>
            <span>Subtotal: {order.subtotal}</span>
            <span>Tax: {order.tax}</span>
            <strong>Total: {order.total}</strong>
          </div>
          <div style={{display:'flex',gap:12}}>
            <button style={{flex:1,padding:12,fontSize:16,backgroundColor:'#2c3e50',color:'white',border:'none',borderRadius:8,cursor:'pointer'}} onClick={() => printOrder(order)}>Print</button>
            <button style={{flex:1,padding:12,fontSize:16,backgroundColor:'#27ae60',color:'white',border:'none',borderRadius:8,cursor:'pointer'}} onClick={() => markDone(order.id)}>Done</button>
          </div>
        </div>
      ))}

      {doneOrders.length > 0 && (
        <div style={{marginTop:30}}>
          <h3 style={{color:'#888',marginBottom:12}}>Completed ({doneOrders.length})</h3>
          {doneOrders.map(order => (
            <div key={order.id} style={{backgroundColor:'white',borderRadius:12,marginBottom:8,boxShadow:'0 1px 4px rgba(0,0,0,0.08)',borderLeft:'5px solid #27ae60',overflow:'hidden'}}>

              {/* Collapsed row - always visible */}
              <div
                onClick={() => toggleExpand(order.id)}
                style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',cursor:'pointer'}}
              >
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:16,fontWeight:'bold',color:'#333'}}>{order.customerName}</span>
                  <span style={{fontSize:13,color:'#888'}}>{order.customerPhone}</span>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <strong style={{color:'#333'}}>{order.total}</strong>
                  <span style={{fontSize:12,color:'#888'}}>{formatTime(order.createdAt)}</span>
                  <span style={{color:'#27ae60',fontSize:18}}>{expandedDone[order.id] ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expanded details */}
              {expandedDone[order.id] && (
                <div style={{padding:'0 16px 16px 16px',borderTop:'1px solid #f0f0f0'}}>
                  <div style={{color:'#555',marginBottom:8,marginTop:10}}>
                    <span style={{fontWeight:'bold'}}>Pickup:</span> {order.pickupTime}
                  </div>
                  <pre style={{backgroundColor:'#f9f9f9',padding:10,borderRadius:8,fontSize:14,whiteSpace:'pre-wrap',margin:'8px 0'}}>{order.items}</pre>
                  <div style={{display:'flex',gap:16,flexWrap:'wrap',marginBottom:12,fontSize:14}}>
                    <span>Subtotal: {order.subtotal}</span>
                    <span>Tax: {order.tax}</span>
                    <strong>Total: {order.total}</strong>
                  </div>
                  <button
                    style={{padding:'8px 16px',fontSize:14,backgroundColor:'#2c3e50',color:'white',border:'none',borderRadius:8,cursor:'pointer'}}
                    onClick={() => printOrder(order)}
                  >
                    Print Receipt
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}