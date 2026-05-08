import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import { getPolicies } from '../lib/api';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

export default function AdminPolicies() {
  const { t } = useTranslation();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null); // scheme_id being uploaded
  const [uploadResult, setUploadResult] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await getPolicies();
      setPolicies(data);
      setLoading(false);
    }
    load();
  }, []);

  const handlePDFUpload = async (schemeId, file) => {
    setUploading(schemeId);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('scheme_id', schemeId);

      const res = await fetch('/api/admin/ingest-policy', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const result = await res.json();
      setUploadResult({ schemeId, ...result });

      // Refresh policies list
      const updated = await getPolicies();
      setPolicies(updated);
    } catch (e) {
      setUploadResult({ schemeId, error: e.message });
    }
    setUploading(null);
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      className="px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Header */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tertiary to-primary-light flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[22px]">admin_panel_settings</span>
          </div>
          <div>
            <h1 className="font-display text-headline text-on-surface">{t('admin.policies')}</h1>
            <p className="text-body-sm text-on-surface-variant">Live policy management — upload PDFs to update criteria instantly</p>
          </div>
        </div>
      </motion.div>

      {/* Info Banner */}
      <motion.div variants={fadeUp} className="bg-gradient-to-r from-primary-container to-accent-light rounded-2xl p-5 border border-primary-light/10">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-[24px] mt-0.5">info</span>
          <div>
            <p className="font-heading text-body font-semibold text-primary">Live Policy Update System</p>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Upload a government PDF → Gemini extracts criteria as structured JSON → saved to database → 
              all artisans get updated eligibility results immediately, zero redeployment.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Policies Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <motion.div variants={fadeUp} className="space-y-4">
          {policies.map((policy) => (
            <div key={policy.scheme_id} className="card p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="font-heading text-title font-semibold text-on-surface">{policy.scheme_name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-caption text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">tag</span>
                      {policy.scheme_id}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">update</span>
                      v{policy.version}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      {new Date(policy.updated_at).toLocaleDateString()}
                    </span>
                    {policy.updated_by && (
                      <span className="chip bg-surface-container text-on-surface-variant text-[10px] py-0.5 px-2">
                        {policy.updated_by}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {uploading === policy.scheme_id ? (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-tertiary-container text-tertiary text-body-sm font-medium">
                      <div className="w-4 h-4 border-2 border-tertiary border-t-transparent rounded-full animate-spin" />
                      {t('admin.analyzing')}
                    </div>
                  ) : (
                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-body-sm font-semibold hover:bg-primary/90 transition-colors">
                      <span className="material-symbols-outlined text-[18px]">upload_file</span>
                      {t('admin.uploadPDF')}
                      <input type="file" accept="application/pdf" className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePDFUpload(policy.scheme_id, file);
                        }} />
                    </label>
                  )}
                </div>
              </div>

              {/* Upload Result */}
              {uploadResult?.schemeId === policy.scheme_id && (
                <div className={`p-4 rounded-xl text-body-sm ${
                  uploadResult.error
                    ? 'bg-error-container text-error'
                    : 'bg-success-container text-success'
                }`}>
                  {uploadResult.error
                    ? `❌ ${uploadResult.error}`
                    : `✅ Updated to v${uploadResult.version} — criteria refreshed from PDF`}
                </div>
              )}
            </div>
          ))}
        </motion.div>
      )}

      {/* Demo Note */}
      <motion.div variants={fadeUp} className="text-caption text-on-surface-variant text-center py-4">
        ⚠️ No authentication for hackathon demo. Add proper auth before production.
      </motion.div>
    </motion.div>
  );
}
