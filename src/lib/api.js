// Centralized API client for ShilpMitra
// Demo mode: returns demoData when Supabase is not configured
// Live mode: calls Supabase + Vercel serverless functions

import { supabase, isDemo } from './supabase';
import { artisans, products, transactions, schemes, notifications, cluster, eligibilityChecks, monthlyIncome, categories } from '../data/demoData';

// ─── DEMO DATA HELPERS ──────────────────────────────────
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── USERS ───────────────────────────────────────────────
export async function getUser(userId) {
  if (isDemo) {
    return artisans.find(a => a.id === userId) || artisans[0];
  }
  const { data } = await supabase.from('users').select('*').eq('id', userId).single();
  return data;
}

// ─── PRODUCTS ────────────────────────────────────────────
export async function getProducts(filters = {}) {
  if (isDemo) {
    let result = [...products];
    if (filters.craftType && filters.craftType !== 'All') {
      result = result.filter(p => p.craft === filters.craftType || p.category === filters.craftType);
    }
    if (filters.sellerId) {
      result = result.filter(p => p.sellerId === filters.sellerId);
    }
    return result;
  }
  let query = supabase.from('products').select('*').eq('is_active', true);
  if (filters.craftType) query = query.eq('craft_type', filters.craftType);
  if (filters.sellerId) query = query.eq('seller_id', filters.sellerId);
  const { data } = await query.order('created_at', { ascending: false });
  return data || [];
}

export async function getProduct(productId) {
  if (isDemo) return products.find(p => p.id === productId);
  const { data } = await supabase.from('products').select('*').eq('id', productId).single();
  return data;
}

export async function createProduct(product) {
  if (isDemo) {
    await delay(500);
    return { ...product, id: `p${Date.now()}`, created_at: new Date().toISOString() };
  }
  const { data } = await supabase.from('products').insert(product).select().single();
  return data;
}

// ─── TRANSACTIONS ────────────────────────────────────────
export async function getTransactions(sellerId) {
  if (isDemo) {
    return transactions.filter(t => t.sellerId === sellerId);
  }
  const { data } = await supabase.from('transactions').select('*')
    .eq('seller_id', sellerId)
    .eq('payment_status', 'completed')
    .order('created_at', { ascending: false });
  return data || [];
}

export async function recordTransaction(txn) {
  if (isDemo) {
    await delay(300);
    return { ...txn, id: `t${Date.now()}` };
  }
  const { data } = await supabase.from('transactions').insert(txn).select().single();
  return data;
}

// ─── SCHEMES ─────────────────────────────────────────────
export async function getSchemeCriteria() {
  if (isDemo) {
    return schemes.map(s => ({
      scheme_id: s.id,
      scheme_name: s.name,
      scheme_name_hi: s.nameHi,
      criteria_json: {
        benefits: [s.description],
        required_documents: s.requirements,
        loan_amount: `₹${s.fundingLimit.toLocaleString()}`
      },
      updated_at: new Date().toISOString(),
      version: 1
    }));
  }
  const { data } = await supabase.from('scheme_criteria').select('*')
    .order('updated_at', { ascending: false });
  return data || [];
}

export async function checkSchemeEligibility(userId, language = 'en') {
  if (isDemo) {
    await delay(800);
    return {
      matched: [
        {
          scheme_id: 's1', scheme_name: 'PM Vishwakarma', rank: 1,
          eligibility_score: 85,
          why_qualify: language === 'hi' ? 'आपके 18 महीने की बिक्री और मिट्टी के बर्तन शिल्प से आप पात्र हैं।' : 'Your 18-month sales record and pottery craft makes you eligible.',
          what_missing: language === 'hi' ? ['आधार लिंकिंग शेष'] : ['Aadhaar linking pending'],
          benefit_summary: language === 'hi' ? '₹3 लाख तक का ऋण + टूलकिट' : 'Up to ₹3 lakh credit + toolkit',
          application_url: 'https://pmvishwakarma.gov.in'
        },
        {
          scheme_id: 's2', scheme_name: 'MUDRA Loan', rank: 2,
          eligibility_score: 72,
          why_qualify: language === 'hi' ? 'आपका व्यवसाय 6 महीने से ज़्यादा पुराना है।' : 'Your business has been active for 6+ months.',
          what_missing: language === 'hi' ? ['बैंक स्टेटमेंट 6 महीने'] : ['6-month bank statement needed'],
          benefit_summary: language === 'hi' ? '₹50,000 तक बिना गारंटी ऋण' : 'Up to ₹50,000 collateral-free loan',
          application_url: 'https://www.mudra.org.in'
        }
      ],
      unmatched: [
        { scheme_id: 's4', scheme_name: 'SFURTI', blocking_reason: language === 'hi' ? 'क्लस्टर में 50+ सदस्य चाहिए' : 'Cluster needs 50+ members' }
      ]
    };
  }
  // Live mode: call serverless function
  const res = await fetch('/api/schemes/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, language })
  });
  return res.json();
}

// ─── CLUSTER ─────────────────────────────────────────────
export async function getCluster(clusterId) {
  if (isDemo) return cluster;
  const { data: c } = await supabase.from('clusters').select('*').eq('id', clusterId).single();
  const { data: members } = await supabase.from('cluster_members').select('*, users(name, upi_id, craft_type)').eq('cluster_id', clusterId);
  return { ...c, members };
}

export async function computeSplit(clusterId, amount) {
  if (isDemo) {
    await delay(200);
    const c = cluster;
    return {
      splits: c.members.map(m => ({
        member_name: m.name,
        split_pct: m.share,
        amount_due: Math.round(amount * m.share / 100)
      })),
      total: amount,
      is_locked: true
    };
  }
  const res = await fetch('/api/cluster/split', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cluster_id: clusterId, amount })
  });
  return res.json();
}

// ─── NOTIFICATIONS ───────────────────────────────────────
export async function getNotifications(userId) {
  if (isDemo) {
    return {
      notifications: notifications,
      unread_count: notifications.filter(n => !n.read).length
    };
  }
  const { data } = await supabase.from('notifications').select('*')
    .eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
  return {
    notifications: data || [],
    unread_count: (data || []).filter(n => !n.is_read).length
  };
}

export async function markNotificationRead(notifId) {
  if (isDemo) return { success: true };
  await supabase.from('notifications').update({ is_read: true }).eq('id', notifId);
  return { success: true };
}

// ─── ADMIN ───────────────────────────────────────────────
export async function getPolicies() {
  if (isDemo) {
    return schemes.map(s => ({
      scheme_id: s.id,
      scheme_name: s.name,
      version: 1,
      updated_at: new Date().toISOString(),
      updated_by: 'seed'
    }));
  }
  const { data } = await supabase.from('scheme_criteria')
    .select('scheme_id, scheme_name, version, updated_at, updated_by')
    .order('updated_at', { ascending: false });
  return data || [];
}

// ─── DEMO DATA RE-EXPORTS (for components that still need raw data) ───
export { artisans, products as demoProducts, transactions as demoTransactions, 
         schemes as demoSchemes, eligibilityChecks, monthlyIncome, categories, cluster as demoCluster };
