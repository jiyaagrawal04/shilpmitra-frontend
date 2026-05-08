export const artisans = [
  { id: 'a1', name: 'Raju Kumar', nameHi: 'राजू कुमार', craft: 'Handloom', location: 'Varanasi, UP', language: 'hi', avatar: 'R', color: 'bg-primary-container text-on-primary-container', verified: true, totalSales: 45200, activeOrders: 3, growth: 12, fundingEligibility: 80, clusterId: 'c1' },
  { id: 'a2', name: 'Sunita Devi', nameHi: 'सुनिता देवी', craft: 'Pottery', location: 'Kutch, Gujarat', language: 'hi', avatar: 'S', color: 'bg-secondary-container text-on-secondary-container', verified: true, totalSales: 62000, activeOrders: 5, growth: 18, fundingEligibility: 92, clusterId: 'c1' },
  { id: 'a3', name: 'Ramesh Kumar', nameHi: 'रमेश कुमार', craft: 'Pottery', location: 'Kutch, Gujarat', language: 'hi', avatar: 'R', color: 'bg-tertiary-container text-on-tertiary-container', verified: true, totalSales: 28000, activeOrders: 2, growth: 8, fundingEligibility: 65, clusterId: 'c1' },
  { id: 'a4', name: 'Meera Bai', nameHi: 'मीरा बाई', craft: 'Jewelry', location: 'Jaipur, Rajasthan', language: 'hi', avatar: 'M', color: 'bg-primary-fixed text-primary', verified: false, totalSales: 15000, activeOrders: 1, growth: 5, fundingEligibility: 40, clusterId: null },
];

export const products = [
  { id: 'p1', sellerId: 'a1', title: 'Indigo Silk Saree', titleHi: 'इंडिगो सिल्क साड़ी', price: 8500, category: 'Handloom', craft: 'Handloom', status: 'live', tags: ['silk', 'handloom', 'traditional'], image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOg3J3v4nyX8Xbrco0MODG6_n3IaNrYs26UqPdUNJfNTJ_oOEjuTrRqBmae2b4ErdBKCMj53JktPsRrjK2JIZjpGz5N92-TnGlVOQ2dMB1zZefdm-8UyqU366bZAXEH9T4DGpKGZmGccpHeOqztdfEjF50654RXeEtTF3gJnerPT9aii6TMs4PoZQlmOJzBFExL5cDb0nIW8dh6pSmE_59pCYz39TytaDFcK6SWy8j9uNLKok-28b-EjvXiVpQjBQcgzdPC8pOG5Eq', verified: true, description: 'Handwoven pure silk saree with traditional indigo dye and gold zari work from Varanasi.' },
  { id: 'p2', sellerId: 'a2', title: 'Terracotta Vases', titleHi: 'टेराकोटा फूलदान', price: 1200, category: 'Pottery', craft: 'Pottery', status: 'review', tags: ['terracotta', 'handmade', 'decor'], image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOANwg5Oeh4de41y5Nm_43dnBP9hSSu3isXexmvOYxn2Qyi5IwzYr5TEUzA0mvG2QwhsNs1SqCPVjDOSsjNFm0ZBDWasv49Ia6bakVewqX2oVLDgA0CdLwPrta6XTXe87ZYRjKtuQsR_5vhGvaZrzmWTkf4bj30Ihyu2oZ-a160mWkTGkkShJInBEKMJz0wB0upfIuWyw_t_FrBQQfqLYmwG9XAuA69wwvrq52Y9GynGzNyifzHaZOlptjXTkZUKaDn0YVEhgI9uGX', verified: false, description: 'Set of 3 handcrafted terracotta vases with natural earth tones.' },
  { id: 'p3', sellerId: 'a1', title: 'Banarasi Dupatta', titleHi: 'बनारसी दुपट्टा', price: 3200, category: 'Handloom', craft: 'Handloom', status: 'live', tags: ['banarasi', 'dupatta', 'silk'], image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwna6_Zjy-YgHJ7Y5tZDfWnEUf7xKAiUtlIpT4pHt_naSyTRA5HEK8lJh8zSsvu4staCosU9gdkLhl4FzkjkErTCwoRwmOufuG2ERY4nKYkQLAUuyJdpvCVi182RMf-tobEoOiIH07iUNXsQvGYpfgMIY85ZPrWuoit_oUib81WXR48yWDYvxatJjO_PHSfpPaFifVgkGkbDjr_449JcCOVkhVmetswaaSNi9puo80WVBWVEFB06-dBZbT8q166-OOy9eo4csfT7mt', verified: true, description: 'Elegant Banarasi silk dupatta with intricate brocade pattern.' },
  { id: 'p4', sellerId: 'a3', title: 'Carved Wooden Box', titleHi: 'नक्काशीदार लकड़ी का बक्सा', price: 850, category: 'Woodwork', craft: 'Woodwork', status: 'live', tags: ['wooden', 'carved', 'storage'], image: null, verified: true, description: 'Hand-carved sheesham wood storage box with Rajasthani jali work.' },
  { id: 'p5', sellerId: 'a2', title: 'Terracotta Diya Set', titleHi: 'टेराकोटा दीया सेट', price: 450, category: 'Pottery', craft: 'Pottery', status: 'live', tags: ['diya', 'festival', 'terracotta'], image: null, verified: true, description: 'Set of 12 hand-painted terracotta diyas for festive occasions.' },
  { id: 'p6', sellerId: 'a4', title: 'Silver Jhumka Earrings', titleHi: 'चांदी की झुमका', price: 2800, category: 'Jewelry', craft: 'Jewelry', status: 'live', tags: ['silver', 'jhumka', 'traditional'], image: null, verified: false, description: 'Traditional Rajasthani silver jhumka with oxidized finish.' },
  { id: 'p7', sellerId: 'a1', title: 'Cotton Khadi Kurta', titleHi: 'खादी कुर्ता', price: 1500, category: 'Handloom', craft: 'Handloom', status: 'live', tags: ['khadi', 'cotton', 'kurta'], image: null, verified: true, description: 'Hand-spun khadi cotton kurta with natural dye.' },
  { id: 'p8', sellerId: 'a2', title: 'Ceramic Tea Set', titleHi: 'सिरेमिक चाय सेट', price: 1800, category: 'Pottery', craft: 'Pottery', status: 'live', tags: ['ceramic', 'tea', 'handmade'], image: null, verified: true, description: 'Artisanal ceramic tea set with hand-painted floral motifs.' },
];

export const transactions = [
  { id: 't1', productId: 'p1', sellerId: 'a1', buyerName: 'A. Sharma', amount: 4500, date: '2024-12-14T14:30:00', upiRef: 'UPI2024121443210', type: 'sale', product: 'Hand-loomed Saree', verified: true },
  { id: 't2', productId: 'p2', sellerId: 'a1', buyerName: 'R. Patel', amount: 1200, date: '2024-12-13T10:15:00', upiRef: 'UPI2024121312345', type: 'sale', product: 'Terracotta Pots (Set of 3)', verified: true },
  { id: 't3', productId: 'p4', sellerId: 'a1', buyerName: 'M. Gupta', amount: 850, date: '2024-12-12T16:45:00', upiRef: 'UPI2024121298765', type: 'sale', product: 'Carved Wooden Box', verified: true },
  { id: 't4', productId: 'p3', sellerId: 'a1', buyerName: 'K. Verma', amount: 3200, date: '2024-12-10T09:00:00', upiRef: 'UPI2024121054321', type: 'sale', product: 'Silk Saree (Red)', verified: true },
  { id: 't5', productId: 'p5', sellerId: 'a1', buyerName: 'S. Joshi', amount: 450, date: '2024-12-08T11:30:00', upiRef: 'UPI2024120876543', type: 'sale', product: 'Bamboo Chair', verified: true },
  { id: 't6', productId: 'p1', sellerId: 'a1', buyerName: 'D. Mehra', amount: 8500, date: '2024-11-28T13:20:00', upiRef: 'UPI2024112887654', type: 'sale', product: 'Indigo Silk Saree', verified: true },
  { id: 't7', productId: 'p7', sellerId: 'a1', buyerName: 'N. Singh', amount: 1500, date: '2024-11-20T15:45:00', upiRef: 'UPI2024112065432', type: 'sale', product: 'Cotton Khadi Kurta', verified: true },
  { id: 't8', productId: 'p3', sellerId: 'a1', buyerName: 'P. Kumar', amount: 3200, date: '2024-11-15T10:00:00', upiRef: 'UPI2024111543210', type: 'sale', product: 'Banarasi Dupatta', verified: true },
  { id: 't9', productId: 'p1', sellerId: 'a1', buyerName: 'L. Arora', amount: 4500, date: '2024-10-25T14:00:00', upiRef: 'UPI2024102598765', type: 'sale', product: 'Hand-loomed Saree', verified: true },
  { id: 't10', productId: 'p4', sellerId: 'a1', buyerName: 'V. Thakur', amount: 850, date: '2024-10-18T09:30:00', upiRef: 'UPI2024101876543', type: 'sale', product: 'Carved Wooden Box', verified: true },
];

export const schemes = [
  { id: 's1', name: 'PM Vishwakarma', nameHi: 'पीएम विश्वकर्मा', description: 'Support for traditional artisans and craftspeople with training and financial assistance up to ₹3 lakh.', descriptionHi: 'पारंपरिक कारीगरों और शिल्पकारों के लिए प्रशिक्षण और ₹3 लाख तक की वित्तीय सहायता।', fundingLimit: 300000, requirements: ['Aadhaar', 'craft_proof', 'sales_history'], category: 'artisan' },
  { id: 's2', name: 'MUDRA Loan', nameHi: 'मुद्रा ऋण', description: 'Micro-credit facility for small business expansion up to ₹10 lakh.', descriptionHi: 'छोटे व्यवसाय विस्तार के लिए ₹10 लाख तक की सूक्ष्म ऋण सुविधा।', fundingLimit: 1000000, requirements: ['Aadhaar', 'bank_account', 'sales_history', 'business_plan'], category: 'finance' },
  { id: 's3', name: 'PMEGP', nameHi: 'पीएमईजीपी', description: 'Prime Minister Employment Generation Programme for new enterprise setup.', descriptionHi: 'नए उद्यम स्थापना के लिए प्रधानमंत्री रोजगार सृजन कार्यक्रम।', fundingLimit: 2500000, requirements: ['Aadhaar', 'education_proof', 'project_report'], category: 'enterprise' },
  { id: 's4', name: 'SFURTI', nameHi: 'स्फूर्ति', description: 'Cluster-based development for traditional industries with funding up to ₹5 crore per cluster.', descriptionHi: 'पारंपरिक उद्योगों के लिए क्लस्टर-आधारित विकास, प्रति क्लस्टर ₹5 करोड़ तक की फंडिंग।', fundingLimit: 50000000, requirements: ['cluster_registration', 'min_members', 'turnover_proof'], category: 'cluster' },
  { id: 's5', name: 'ODOP', nameHi: 'ओडीओपी', description: 'One District One Product scheme for promoting district-specific products.', descriptionHi: 'जिला-विशिष्ट उत्पादों को बढ़ावा देने के लिए एक जिला एक उत्पाद योजना।', fundingLimit: 500000, requirements: ['Aadhaar', 'district_product_proof', 'craft_proof'], category: 'product' },
];

export const eligibilityChecks = [
  { id: 'e1', label: 'Sales History', labelHi: 'बिक्री इतिहास', status: 'green', detail: 'Verified via App Data', detailHi: 'ऐप डेटा से सत्यापित' },
  { id: 'e2', label: 'ID Verification', labelHi: 'पहचान सत्यापन', status: 'green', detail: 'Aadhaar Linked', detailHi: 'आधार लिंक्ड' },
  { id: 'e3', label: 'Cluster Certificate', labelHi: 'क्लस्टर प्रमाणपत्र', status: 'amber', detail: 'Upload Pending', detailHi: 'अपलोड लंबित' },
  { id: 'e4', label: 'Bank Account', labelHi: 'बैंक खाता', status: 'green', detail: 'SBI Account Linked', detailHi: 'एसबीआई खाता लिंक्ड' },
  { id: 'e5', label: 'Business Plan', labelHi: 'व्यवसाय योजना', status: 'red', detail: 'Not Submitted', detailHi: 'जमा नहीं किया गया' },
];

export const cluster = {
  id: 'c1', name: 'Kutch Pottery Cluster', nameHi: 'कच्छ मिट्टी के बर्तन क्लस्टर', totalRevenue: 125000, sfurtiProgress: 75,
  members: [
    { id: 'a2', name: 'Sunita Devi', role: 'Lead Artisan', roleHi: 'मुख्य कारीगर', craft: 'Master Potter', share: 40, avatar: 'S', color: 'bg-primary-container text-primary' },
    { id: 'a3', name: 'Ramesh Kumar', role: 'Glazing Specialist', roleHi: 'ग्लेज़िंग विशेषज्ञ', craft: 'Glazing', share: 25, avatar: 'R', color: 'bg-secondary-container text-secondary' },
    { id: 'm1', name: 'Priya Patel', role: 'Painter', roleHi: 'चित्रकार', craft: 'Painting', share: 20, avatar: 'P', color: 'bg-tertiary-container text-tertiary' },
    { id: 'm2', name: 'Vikram Shah', role: 'Logistics', roleHi: 'लॉजिस्टिक्स', craft: 'Operations', share: 15, avatar: 'V', color: 'bg-primary-fixed text-primary' },
  ],
  splitExample: { orderAmount: 60000, splits: [{ name: 'Sunita Devi', share: 30, amount: 18000 }, { name: 'Ramesh Kumar', share: 25, amount: 15000 }, { name: 'Priya Patel', share: 25, amount: 15000 }, { name: 'Vikram Shah', share: 20, amount: 12000 }] }
};

export const notifications = [
  { id: 'n1', type: 'funding', title: 'New Scheme Match!', titleHi: 'नई योजना मिली!', body: 'You are now eligible for PM Vishwakarma. Complete your cluster certificate to apply.', bodyHi: 'अब आप पीएम विश्वकर्मा के लिए पात्र हैं।', icon: 'military_tech', read: false, time: '2 hours ago' },
  { id: 'n2', type: 'payment', title: 'Payment Received', titleHi: 'भुगतान प्राप्त', body: '₹4,500 received for Hand-loomed Saree via UPI', bodyHi: '₹4,500 हथकरघा साड़ी के लिए UPI द्वारा प्राप्त', icon: 'account_balance_wallet', read: false, time: '3 hours ago' },
  { id: 'n3', type: 'document', title: 'Document Reminder', titleHi: 'दस्तावेज़ अनुस्मारक', body: 'Upload your Cluster Certificate to unlock SFURTI funding eligibility.', bodyHi: 'SFURTI फंडिंग पात्रता अनलॉक करने के लिए क्लस्टर प्रमाणपत्र अपलोड करें।', icon: 'upload_file', read: true, time: '1 day ago' },
  { id: 'n4', type: 'milestone', title: 'Sales Milestone!', titleHi: 'बिक्री का मील का पत्थर!', body: 'Congratulations! Your total sales crossed ₹40,000 this month.', bodyHi: 'बधाई! इस महीने आपकी कुल बिक्री ₹40,000 को पार कर गई।', icon: 'emoji_events', read: true, time: '2 days ago' },
  { id: 'n5', type: 'payment', title: 'Payment Received', titleHi: 'भुगतान प्राप्त', body: '₹1,200 received for Terracotta Pots via UPI', bodyHi: '₹1,200 टेराकोटा बर्तनों के लिए UPI द्वारा प्राप्त', icon: 'account_balance_wallet', read: true, time: '3 days ago' },
];

export const monthlyIncome = [
  { month: 'Oct', monthHi: 'अक्टू', amount: 5350 },
  { month: 'Nov', monthHi: 'नवं', amount: 13200 },
  { month: 'Dec', monthHi: 'दिसं', amount: 12400 },
];

export const categories = ['All', 'Handloom', 'Pottery', 'Woodwork', 'Jewelry'];
