'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Box, Paper, Typography, TextField, Button, IconButton,
  CircularProgress, Divider, InputAdornment, Select, MenuItem,
  FormControl,
} from '@mui/material'
import {
  CalendarMonth, CloudUpload, Save, OpenInNew,
} from '@mui/icons-material'

const PURPLE  = '#6b21a8'
const PINK    = '#c2185b'
const LIGHT_P = '#f5f3ff'

/* ── helpers ─────────────────────────────────────────── */
function toDateInput(val) {
  if (!val) return ''
  try { return new Date(val).toISOString().split('T')[0] } catch { return '' }
}

/* ── sub-components ───────────────────────────────────── */
function SectionHeader({ title }) {
  return (
    <Box sx={{ bgcolor: PURPLE, px: 2.5, py: 1.2, borderRadius: '6px 6px 0 0' }}>
      <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700 }}>{title}</Typography>
    </Box>
  )
}

function FieldLabel({ children, sub }) {
  return (
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 13, color: '#111827', lineHeight: 1.3 }}>
        {children}
      </Typography>
      {sub && <Typography variant="caption" sx={{ color: '#6b7280', fontSize: 11 }}>{sub}</Typography>}
    </Box>
  )
}

/* Date text input with pink calendar icon */
function DateInput({ value, onChange }) {
  const ref = useRef(null)
  return (
    <Box sx={{ position: 'relative', width: 160 }}>
      <TextField
        type="date" size="small" value={value || ''} onChange={e => onChange(e.target.value)}
        inputRef={ref}
        InputLabelProps={{ shrink: true }}
        inputProps={{ style: { fontSize: 12, paddingRight: 32 } }}
        sx={{
          width: '100%',
          '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: PURPLE } },
        }}
      />
      <IconButton
        size="small"
        onClick={() => ref.current?.showPicker?.()}
        sx={{ position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)', p: 0.5 }}
      >
        <CalendarMonth sx={{ fontSize: 16, color: PINK }} />
      </IconButton>
    </Box>
  )
}

/* Drag-and-drop document upload */
function DocUpload({ value, onChange }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [drag, setDrag] = useState(false)

  async function upload(file) {
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (json.url) onChange(json.url)
    } finally { setUploading(false) }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: PINK, fontSize: 12 }}>
        Document
      </Typography>
      <Box
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) upload(f) }}
        onClick={() => !uploading && inputRef.current?.click()}
        sx={{
          border: `1px dashed ${drag ? PURPLE : '#d1d5db'}`,
          borderRadius: 1, minHeight: 90,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: drag ? LIGHT_P : '#fafafa', cursor: 'pointer',
          transition: 'all 0.15s',
          '&:hover': { borderColor: PURPLE, bgcolor: LIGHT_P },
        }}
      >
        {uploading ? (
          <CircularProgress size={18} sx={{ color: PURPLE }} />
        ) : value ? (
          <Box sx={{ textAlign: 'center', px: 1 }}>
            <Typography variant="caption" sx={{ color: PURPLE, fontSize: 11, wordBreak: 'break-all' }}>
              {value.split('/').pop()}
            </Typography>
          </Box>
        ) : (
          <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: 12 }}>
            Drag and drop file here
          </Typography>
        )}
        <input ref={inputRef} type="file" style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) upload(f) }} />
      </Box>
      <Button
        variant="outlined" size="small"
        startIcon={<CloudUpload sx={{ fontSize: 14 }} />}
        onClick={() => inputRef.current?.click()}
        sx={{
          textTransform: 'none', fontSize: 11,
          borderColor: PINK, color: PINK,
          '&:hover': { bgcolor: `${PINK}08`, borderColor: PINK },
        }}
      >
        Upload Document
      </Button>
    </Box>
  )
}

/* Standard section entry: label + date | textarea (left) + docUpload (right) */
function SectionRow({ label, sub, dateKey, notesKey, docKey, data, set, extra }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 1 }}>
        <Box sx={{ minWidth: 230 }}>
          <FieldLabel sub={sub}>{label}</FieldLabel>
        </Box>
        <DateInput value={toDateInput(data[dateKey])} onChange={v => set(dateKey, v)} />
        {extra}
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 2 }}>
        <TextField
          multiline rows={4} fullWidth size="small"
          value={data[notesKey] || ''} onChange={e => set(notesKey, e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { fontSize: 13, '&.Mui-focused fieldset': { borderColor: PURPLE } } }}
        />
        <DocUpload value={data[docKey]} onChange={v => set(docKey, v)} />
      </Box>
    </Box>
  )
}

/* ── Main component ───────────────────────────────────── */
const EMPTY = {
  longTermPlan: '', currentSupportNeeds: '', strengthsOfPlacement: '',
  potentialHome: '', referralFormDate: '', placingAuthority: '',
  referralFormNotes: '', referralFormDocUrl: '',
  discussionNotesDate: '', discussionNotes: '', discussionNotesDocUrl: '',
  homeRiskDate: '', homeRiskNotes: '', homeRiskDocUrl: '',
  otherDate: '', otherNotes: '', otherDocUrl: '',
  parentsDate: '', parentsNotes: '', parentsDocUrl: '',
  commissioningDate: '', commissioningNotes: '', commissioningDocUrl: '',
  socialWorkerDate: '', socialWorkerNotes: '', socialWorkerDocUrl: '',
  youngPersonDate: '', youngPersonNotes: '', youngPersonDocUrl: '',
  ypAtHomeDate: '', ypAtHomeNotes: '', ypAtHomeDocUrl: '',
  teamManagerDate: '', teamManagerNotes: '', teamManagerDocUrl: '',
  serviceManagerDate: '', serviceManagerNotes: '', serviceManagerDocUrl: '',
  conversationsDate: '', conversationsNotes: '', conversationsDocUrl: '',
  matchPdfUrl: '', summary: '', reasonsForDecision: '', currentStatus: '',
}

export default function MatchingRiskSection({ youngPersonId, ypName }) {
  const [data, setData] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const matchPdfRef = useRef(null)
  const [uploadingPdf, setUploadingPdf] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/young-people/${youngPersonId}/matching-risk`)
    const json = await res.json()
    if (json.record) {
      const r = json.record
      setData({
        ...EMPTY,
        ...Object.fromEntries(
          Object.entries(r).filter(([k]) => k in EMPTY).map(([k, v]) => [k, v ?? ''])
        ),
      })
    }
    setLoading(false)
  }, [youngPersonId])

  useEffect(() => { load() }, [load])

  function set(key, val) { setData(d => ({ ...d, [key]: val })) }

  async function uploadMatchPdf(file) {
    setUploadingPdf(true)
    const fd = new FormData(); fd.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (json.url) set('matchPdfUrl', json.url)
    } finally { setUploadingPdf(false) }
  }

  async function save() {
    setSaving(true)
    await fetch(`/api/young-people/${youngPersonId}/matching-risk`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
      <CircularProgress size={28} sx={{ color: PURPLE }} />
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

      {/* ── Header bar ── */}
      <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 1, overflow: 'hidden' }}>
        <Box sx={{ bgcolor: PURPLE, px: 2.5, py: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700 }}>
            Select menu item
          </Typography>
          <Button variant="outlined" size="small"
            endIcon={<OpenInNew sx={{ fontSize: 13 }} />}
            sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)', fontSize: 11, textTransform: 'none',
              '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
            View full matching
          </Button>
        </Box>

        {/* Top three fields */}
        <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { label: 'Long Term Plan',                   key: 'longTermPlan' },
            { label: 'Current Support Needs',            key: 'currentSupportNeeds' },
            { label: 'Strengths of Placement Meeting Needs?', key: 'strengthsOfPlacement' },
          ].map(({ label, key }) => (
            <Box key={key} sx={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 2, alignItems: 'flex-start' }}>
              <Typography variant="body2" sx={{ fontSize: 12.5, color: '#374151', pt: 1 }}>{label}</Typography>
              <TextField multiline rows={3} fullWidth size="small"
                value={data[key] || ''} onChange={e => set(key, e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { fontSize: 13, '&.Mui-focused fieldset': { borderColor: PURPLE } } }}
              />
            </Box>
          ))}
        </Box>
      </Paper>

      {/* ── Key Information to Assist Decision ── */}
      <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 1, overflow: 'hidden' }}>
        <SectionHeader title="Key Information to Assist Decision" />
        <Box sx={{ p: 2.5 }}>

          {/* Potential Home */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 2, alignItems: 'center', mb: 2.5 }}>
            <FieldLabel>Potential Home</FieldLabel>
            <TextField size="small" fullWidth value={data.potentialHome || ''} onChange={e => set('potentialHome', e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { fontSize: 13, '&.Mui-focused fieldset': { borderColor: PURPLE } } }} />
          </Box>

          <Divider sx={{ mb: 2.5 }} />

          {/* Referral Form — special row: date + Placing Authority text field */}
          <Box sx={{ mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
              <FieldLabel>Referral Form</FieldLabel>
              <DateInput value={toDateInput(data.referralFormDate)} onChange={v => set('referralFormDate', v)} />
              <FieldLabel>Placing Authority</FieldLabel>
              <TextField size="small" value={data.placingAuthority || ''} onChange={e => set('placingAuthority', e.target.value)}
                sx={{ flex: 1, minWidth: 160, '& .MuiOutlinedInput-root': { fontSize: 13, '&.Mui-focused fieldset': { borderColor: PURPLE } } }} />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 2 }}>
              <TextField multiline rows={4} fullWidth size="small"
                value={data.referralFormNotes || ''} onChange={e => set('referralFormNotes', e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { fontSize: 13, '&.Mui-focused fieldset': { borderColor: PURPLE } } }} />
              <DocUpload value={data.referralFormDocUrl} onChange={v => set('referralFormDocUrl', v)} />
            </Box>
          </Box>

          <Divider sx={{ mb: 2.5 }} />
          <SectionRow label="Discussion Notes" dateKey="discussionNotesDate"
            notesKey="discussionNotes" docKey="discussionNotesDocUrl" data={data} set={set} />
          <Divider sx={{ mb: 2.5 }} />
          <SectionRow label="Home Risk Assessment" dateKey="homeRiskDate"
            notesKey="homeRiskNotes" docKey="homeRiskDocUrl" data={data} set={set} />
          <Divider sx={{ mb: 2.5 }} />
          <SectionRow label="Other" dateKey="otherDate"
            notesKey="otherNotes" docKey="otherDocUrl" data={data} set={set} />
        </Box>
      </Paper>

      {/* ── Consultation / Agreement ── */}
      <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 1, overflow: 'hidden' }}>
        <SectionHeader title="Consultation / Agreement on Placement / Supporting Evidence" />
        <Box sx={{ p: 2.5 }}>
          {[
            { label: 'Parents',               dk: 'parentsDate',        nk: 'parentsNotes',        doc: 'parentsDocUrl' },
            { label: 'Commissioning',         dk: 'commissioningDate',  nk: 'commissioningNotes',  doc: 'commissioningDocUrl' },
            { label: 'Social Worker',         dk: 'socialWorkerDate',   nk: 'socialWorkerNotes',   doc: 'socialWorkerDocUrl' },
            { label: 'Young Person',          dk: 'youngPersonDate',    nk: 'youngPersonNotes',    doc: 'youngPersonDocUrl' },
            { label: 'Young Person at the Home', dk: 'ypAtHomeDate',    nk: 'ypAtHomeNotes',       doc: 'ypAtHomeDocUrl' },
            { label: 'Team Manager',          dk: 'teamManagerDate',    nk: 'teamManagerNotes',    doc: 'teamManagerDocUrl' },
            { label: 'Service Manager',       dk: 'serviceManagerDate', nk: 'serviceManagerNotes', doc: 'serviceManagerDocUrl' },
            {
              label: 'Conversations with placement the young person is moving from',
              sub: 'i.e. family home; foster placement; other residential home',
              dk: 'conversationsDate', nk: 'conversationsNotes', doc: 'conversationsDocUrl',
            },
          ].map(({ label, sub, dk, nk, doc }, i, arr) => (
            <Box key={dk}>
              <SectionRow label={label} sub={sub} dateKey={dk} notesKey={nk} docKey={doc} data={data} set={set} />
              {i < arr.length - 1 && <Divider sx={{ mb: 2.5 }} />}
            </Box>
          ))}
        </Box>
      </Paper>

      {/* ── Matching Summary ── */}
      <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 1, p: 2.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 3, alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" fontWeight={700} sx={{ color: '#111827', mb: 0.3 }}>
              Matching Summary
            </Typography>
            <Typography variant="caption" sx={{ color: '#6b7280', fontSize: 11 }}>
              If empty please visit full matching screen{' '}
              <Typography component="span" variant="caption"
                sx={{ color: PINK, textDecoration: 'underline', cursor: 'pointer', fontSize: 11 }}>
                here
              </Typography>
            </Typography>
          </Box>
          {/* Match PDF upload */}
          <Box
            onClick={() => !uploadingPdf && matchPdfRef.current?.click()}
            sx={{
              border: `1px solid #e5e7eb`, borderRadius: 1,
              minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', bgcolor: '#fafafa',
              '&:hover': { borderColor: PURPLE, bgcolor: LIGHT_P },
            }}
          >
            {uploadingPdf ? <CircularProgress size={18} sx={{ color: PURPLE }} /> : (
              <Typography variant="caption" sx={{ color: data.matchPdfUrl ? PURPLE : '#9ca3af', fontSize: 12 }}>
                {data.matchPdfUrl ? data.matchPdfUrl.split('/').pop() : 'Match PDF'}
              </Typography>
            )}
            <input ref={matchPdfRef} type="file" accept="application/pdf,image/*" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadMatchPdf(f) }} />
          </Box>
        </Box>
      </Paper>

      {/* ── Summary ── */}
      <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 1, overflow: 'hidden' }}>
        <SectionHeader title="Summary" />
        <Box sx={{ p: 2 }}>
          <TextField
            multiline rows={6} fullWidth size="small"
            value={data.summary || ''} onChange={e => set('summary', e.target.value)}
            placeholder="Summarise actions and how the decisions were made, i.e. if RI was involved in final decision, any specific comments made by the young person or professionals about the plan..."
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: 13, border: 'none',
                '& fieldset': { border: 'none' },
              },
              '& .MuiInputBase-input::placeholder': { color: '#9ca3af', fontSize: 12 },
            }}
          />
        </Box>
      </Paper>

      {/* ── Reasons ── */}
      <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 1, overflow: 'hidden' }}>
        <SectionHeader title={`Reasons why ${ypName || 'this young person'} will /will not be offered a place`} />
        <Box sx={{ p: 2 }}>
          <TextField
            multiline rows={6} fullWidth size="small"
            value={data.reasonsForDecision || ''} onChange={e => set('reasonsForDecision', e.target.value)}
            placeholder="Clearly explain reasons for agreeing placement or not. Evaluate the information you have gathered. Can you make a difference in this young person's life and improve their happiness?"
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: 13,
                '& fieldset': { border: 'none' },
              },
              '& .MuiInputBase-input::placeholder': { color: '#9ca3af', fontSize: 12 },
            }}
          />
        </Box>
      </Paper>

      {/* ── Current Status + Save ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" sx={{ color: '#374151', fontSize: 13, minWidth: 100 }}>
          Current Status
        </Typography>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <Select
            value={data.currentStatus || ''}
            onChange={e => set('currentStatus', e.target.value)}
            displayEmpty
            sx={{ fontSize: 13, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: PURPLE } }}
          >
            <MenuItem value=""><em>Select status…</em></MenuItem>
            {['Accepted', 'Declined', 'Pending', 'Under Review', 'On Hold'].map(s => (
              <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {saved && (
            <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 600 }}>Saved</Typography>
          )}
          <Button
            variant="contained" size="small"
            startIcon={saving ? <CircularProgress size={13} color="inherit" /> : <Save sx={{ fontSize: 15 }} />}
            onClick={save} disabled={saving}
            sx={{ bgcolor: PURPLE, '&:hover': { bgcolor: '#7c3aed' }, textTransform: 'none', fontSize: 13, px: 3 }}
          >
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </Box>
      </Box>

    </Box>
  )
}
