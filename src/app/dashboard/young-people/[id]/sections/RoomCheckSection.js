'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Box, Paper, Typography, Button, IconButton, Dialog, DialogContent,
  TextField, Select, MenuItem, FormControl, CircularProgress,
  List, ListItemButton, ListItemText, Divider, Chip, Tooltip,
} from '@mui/material'
import {
  Add, Delete, Lock, LockOpen, Save, Close, PictureAsPdf,
  CloudUpload, CheckCircle, RadioButtonUnchecked,
} from '@mui/icons-material'

const PURPLE = '#6b21a8'
const PINK   = '#c2185b'
const GREEN  = '#16a34a'

const REASONS = [
  'Routine Room Check', 'Following Incident', 'Safeguarding Concern',
  'Requested by Young Person', 'Requested by Staff', 'Post Absence',
  'Maintenance Check', 'Welfare Check', 'Other',
]

const KEYWORKERS = ['Admin Accord', 'Key Worker 1', 'Key Worker 2', 'Manager']

const NAV_ITEMS = [
  'Primary Details', 'Search Details', 'Actions and Outcome',
  'Sanctions or Consequences', 'Monitoring', 'Comments',
  'Sign', 'Documents', 'Linked Events', 'Required Readings',
  'Record Views', 'New Task', 'Unlock History',
]

const EMPTY_FORM = {
  reason: '', dateOfEvent: '', startTime: '', endTime: '',
  youngPersonAgreed: '', policeInvolved: '',
  searchDetails: '', actionsAndOutcome: '', sanctionsOrConsequences: '',
  monitoring: '', comments: '', signedBy: '',
  documents: '[]', linkedEvents: '', requiredReadings: '',
  taskNote: '', recordViews: '[]', unlockHistory: '[]',
  status: 'Open', locked: false,
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
function fmtShortDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })
}
function nowDate() { return new Date().toISOString().split('T')[0] }
function nowTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`
}

/* ── Sub-section renderers ──────────────────────────────── */
function TextArea({ label, value, onChange, rows = 8, placeholder }) {
  return (
    <Box>
      {label && (
        <Typography variant="caption" sx={{ color: PINK, fontWeight: 600, fontSize: 12, display: 'block', mb: 0.8 }}>
          {label}
        </Typography>
      )}
      <TextField
        multiline rows={rows} fullWidth size="small"
        value={value || ''} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        sx={{ '& .MuiOutlinedInput-root': { fontSize: 13, '&.Mui-focused fieldset': { borderColor: PURPLE } } }}
      />
    </Box>
  )
}

function SearchDetails({ form, set }) {
  const parsed = (() => {
    try {
      const p = JSON.parse(form.searchDetails || '{}')
      return typeof p === 'object' && p !== null ? p : { staffPresent: '', othersPresent: '', whatFound: '' }
    } catch {
      return { staffPresent: '', othersPresent: form.searchDetails || '', whatFound: '' }
    }
  })()

  function update(key, val) {
    set('searchDetails', JSON.stringify({ ...parsed, [key]: val }))
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Staff present | Others present */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
        <Box>
          <Typography variant="caption" sx={{ color: PINK, fontWeight: 600, fontSize: 12, display: 'block', mb: 0.8 }}>
            Staff present during search
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={parsed.staffPresent || ''} onChange={e => update('staffPresent', e.target.value)}
              displayEmpty
              sx={{ fontSize: 13, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: PURPLE } }}
            >
              <MenuItem value=""><em>Select Staff Member</em></MenuItem>
              {KEYWORKERS.map(k => <MenuItem key={k} value={k} sx={{ fontSize: 13 }}>{k}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
        <Box>
          <Typography variant="caption" sx={{ color: PINK, fontWeight: 600, fontSize: 12, display: 'block', mb: 0.8 }}>
            Others present during search
          </Typography>
          <TextField
            multiline rows={4} fullWidth size="small"
            value={parsed.othersPresent || ''} onChange={e => update('othersPresent', e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { fontSize: 13, '&.Mui-focused fieldset': { borderColor: PURPLE } } }}
          />
        </Box>
      </Box>

      {/* What was found */}
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 700, color: PINK, fontSize: 13, display: 'block', mb: 0.2 }}>
          What was found?
        </Typography>
        <Typography variant="caption" sx={{ color: '#6b7280', fontSize: 11, display: 'block', mb: 0.8 }}>
          i.e. weapons; illegal substances; alcohol; items that could be used for self-harm purposes; extra phones; money
        </Typography>
        <TextField
          multiline rows={10} fullWidth size="small"
          value={parsed.whatFound || ''} onChange={e => update('whatFound', e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { fontSize: 13, '&.Mui-focused fieldset': { borderColor: PURPLE } } }}
        />
      </Box>
    </Box>
  )
}

function PrimaryDetails({ form, set }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Typography variant="caption" sx={{ color: '#6b7280', fontSize: 12, display: 'block', mb: 0.5 }}>
            Reason for this event
          </Typography>
          <FormControl fullWidth size="small">
            <Select value={form.reason} onChange={e => set('reason', e.target.value)} displayEmpty
              sx={{ fontSize: 13, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: PURPLE } }}>
              <MenuItem value=""><em>Select reason…</em></MenuItem>
              {REASONS.map(r => <MenuItem key={r} value={r} sx={{ fontSize: 13 }}>{r}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
        <Box>
          <Typography variant="caption" sx={{ color: '#6b7280', fontSize: 12, display: 'block', mb: 0.5 }}>
            Date of event
          </Typography>
          <TextField type="date" size="small" value={form.dateOfEvent || nowDate()}
            onChange={e => set('dateOfEvent', e.target.value)}
            sx={{ width: 200, '& .MuiInputBase-input': { fontSize: 13 }, '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: PURPLE } }}
            inputProps={{ style: { fontSize: 13 } }}
          />
        </Box>
        <Box>
          <Typography variant="caption" sx={{ color: '#6b7280', fontSize: 12, display: 'block', mb: 0.5 }}>
            Start Time (hh:mm)
          </Typography>
          <TextField size="small" value={form.startTime || ''} onChange={e => set('startTime', e.target.value)}
            placeholder="01:10:23" sx={{ width: 120, '& .MuiInputBase-input': { fontSize: 13 } }} />
        </Box>
        <Box>
          <Typography variant="caption" sx={{ color: '#6b7280', fontSize: 12, display: 'block', mb: 0.5 }}>
            End Time (hh:mm)
          </Typography>
          <TextField size="small" value={form.endTime || ''} onChange={e => set('endTime', e.target.value)}
            placeholder="02:10:23" sx={{ width: 120, '& .MuiInputBase-input': { fontSize: 13 } }} />
        </Box>
      </Box>
      <TextArea label="Has the young person agreed to this?" value={form.youngPersonAgreed} onChange={v => set('youngPersonAgreed', v)} rows={7} />
      <TextArea label="Are the police involved?" value={form.policeInvolved} onChange={v => set('policeInvolved', v)} rows={7} />
    </Box>
  )
}

function SignSection({ form, set, onSave }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="body2" sx={{ color: '#374151', fontSize: 13 }}>
        Select keyworker / staff member to sign this room check record.
      </Typography>
      <FormControl size="small" sx={{ maxWidth: 280 }}>
        <Select value={form.signedBy || ''} onChange={e => set('signedBy', e.target.value)} displayEmpty
          sx={{ fontSize: 13, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: PURPLE } }}>
          <MenuItem value=""><em>Select staff member…</em></MenuItem>
          {KEYWORKERS.map(k => <MenuItem key={k} value={k} sx={{ fontSize: 13 }}>{k}</MenuItem>)}
        </Select>
      </FormControl>
      {form.signedBy && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CheckCircle sx={{ fontSize: 18, color: GREEN }} />
          <Typography variant="body2" sx={{ color: GREEN, fontWeight: 600, fontSize: 13 }}>
            Signed by {form.signedBy}
          </Typography>
        </Box>
      )}
      <Button variant="contained" size="small" disabled={!form.signedBy}
        onClick={onSave}
        sx={{ alignSelf: 'flex-start', bgcolor: PURPLE, '&:hover': { bgcolor: '#7c3aed' }, textTransform: 'none', fontSize: 13 }}>
        Sign Now
      </Button>
    </Box>
  )
}

function DocumentsSection({ form, set }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const docs = (() => { try { return JSON.parse(form.documents || '[]') } catch { return [] } })()

  async function upload(file) {
    setUploading(true)
    const fd = new FormData(); fd.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (json.url) {
        const updated = [...docs, { name: file.name, url: json.url, uploadedAt: new Date().toISOString() }]
        set('documents', JSON.stringify(updated))
      }
    } finally { setUploading(false) }
  }

  function remove(idx) {
    const updated = docs.filter((_, i) => i !== idx)
    set('documents', JSON.stringify(updated))
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) upload(f) }}
        onClick={() => inputRef.current?.click()}
        sx={{
          border: '2px dashed #d1d5db', borderRadius: 1, p: 3, textAlign: 'center',
          cursor: 'pointer', '&:hover': { borderColor: PURPLE, bgcolor: '#f5f3ff' },
        }}
      >
        {uploading ? <CircularProgress size={20} sx={{ color: PURPLE }} /> : (
          <Box>
            <CloudUpload sx={{ fontSize: 28, color: '#9ca3af', mb: 0.5 }} />
            <Typography variant="body2" sx={{ color: '#6b7280', fontSize: 13 }}>
              Drag and drop a file here, or click to browse
            </Typography>
          </Box>
        )}
        <input ref={inputRef} type="file" style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) upload(f) }} />
      </Box>
      {docs.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {docs.map((d, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1, border: '1px solid #f3f4f6', borderRadius: 1, bgcolor: '#fafafa' }}>
              <Typography variant="caption" sx={{ flex: 1, color: PURPLE, fontSize: 12 }}>{d.name}</Typography>
              <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: 11 }}>
                {d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString('en-GB') : ''}
              </Typography>
              <IconButton size="small" onClick={() => remove(i)} sx={{ color: '#d1d5db', '&:hover': { color: '#ef4444' }, p: 0.5 }}>
                <Delete sx={{ fontSize: 15 }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}

function RecordViewsSection({ form }) {
  const views = (() => { try { return JSON.parse(form.recordViews || '[]') } catch { return [] } })()
  return (
    <Box>
      <Typography variant="caption" sx={{ color: '#6b7280', fontSize: 12, display: 'block', mb: 1.5 }}>
        History of who has viewed this record
      </Typography>
      {views.length === 0 ? (
        <Typography variant="caption" sx={{ color: '#9ca3af' }}>No views recorded.</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
          {[...views].reverse().map((v, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 2, px: 1.5, py: 0.8, bgcolor: '#f9fafb', borderRadius: 1, border: '1px solid #f3f4f6' }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', fontSize: 12, minWidth: 120 }}>{v.viewer}</Typography>
              <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: 11 }}>
                {v.viewedAt ? new Date(v.viewedAt).toLocaleString('en-GB') : ''}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}

function UnlockHistorySection({ form }) {
  const hist = (() => { try { return JSON.parse(form.unlockHistory || '[]') } catch { return [] } })()
  return (
    <Box>
      <Typography variant="caption" sx={{ color: '#6b7280', fontSize: 12, display: 'block', mb: 1.5 }}>
        History of lock / unlock and sign actions
      </Typography>
      {hist.length === 0 ? (
        <Typography variant="caption" sx={{ color: '#9ca3af' }}>No history recorded.</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
          {[...hist].reverse().map((h, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 2, px: 1.5, py: 0.8, bgcolor: '#f9fafb', borderRadius: 1, border: '1px solid #f3f4f6' }}>
              <Chip label={h.action} size="small" sx={{ fontSize: 10, height: 20, bgcolor: '#f5f3ff', color: PURPLE, border: `1px solid ${PURPLE}33` }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', fontSize: 12, minWidth: 120 }}>{h.by}</Typography>
              <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: 11 }}>
                {h.at ? new Date(h.at).toLocaleString('en-GB') : ''}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}

/* ── Modal ────────────────────────────────────────────── */
function RoomCheckModal({ open, checkId, youngPersonId, onClose, onSaved }) {
  const [activeSection, setActiveSection] = useState('Primary Details')
  const [form, setForm] = useState({ ...EMPTY_FORM, dateOfEvent: nowDate(), startTime: nowTime(), endTime: nowTime() })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const isNew = !checkId

  useEffect(() => {
    if (!open) return
    setActiveSection('Primary Details')
    if (checkId) {
      setLoading(true)
      fetch(`/api/young-people/${youngPersonId}/room-checks/${checkId}`)
        .then(r => r.json()).then(({ check }) => {
          if (check) {
            const f = { ...EMPTY_FORM }
            Object.keys(f).forEach(k => { if (k in check) f[k] = check[k] ?? '' })
            if (check.dateOfEvent) f.dateOfEvent = check.dateOfEvent.split('T')[0]
            f.locked = !!check.locked
            setForm(f)
          }
          setLoading(false)
        })
    } else {
      setForm({ ...EMPTY_FORM, dateOfEvent: nowDate(), startTime: nowTime(), endTime: nowTime() })
    }
  }, [open, checkId, youngPersonId])

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  async function save() {
    setSaving(true)
    const method = isNew ? 'POST' : 'PATCH'
    const url = isNew
      ? `/api/young-people/${youngPersonId}/room-checks`
      : `/api/young-people/${youngPersonId}/room-checks/${checkId}`
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false)
    onSaved()
  }

  function renderSection() {
    switch (activeSection) {
      case 'Primary Details':         return <PrimaryDetails form={form} set={set} />
      case 'Search Details':          return <SearchDetails form={form} set={set} />
      case 'Actions and Outcome':     return <TextArea label="Actions and Outcome" value={form.actionsAndOutcome} onChange={v => set('actionsAndOutcome', v)} rows={12} placeholder="Describe the actions taken and the outcome of this room check..." />
      case 'Sanctions or Consequences': return <TextArea label="Sanctions or Consequences" value={form.sanctionsOrConsequences} onChange={v => set('sanctionsOrConsequences', v)} rows={12} placeholder="Record any sanctions or consequences applied..." />
      case 'Monitoring':              return <TextArea label="Monitoring" value={form.monitoring} onChange={v => set('monitoring', v)} rows={12} placeholder="Detail any monitoring requirements following this room check..." />
      case 'Comments':                return <TextArea label="Comments" value={form.comments} onChange={v => set('comments', v)} rows={12} placeholder="Additional comments..." />
      case 'Sign':                    return <SignSection form={form} set={set} onSave={save} />
      case 'Documents':               return <DocumentsSection form={form} set={set} />
      case 'Linked Events':           return <TextArea label="Linked Events" value={form.linkedEvents} onChange={v => set('linkedEvents', v)} rows={12} placeholder="Reference any linked incident or event records..." />
      case 'Required Readings':       return <TextArea label="Required Readings" value={form.requiredReadings} onChange={v => set('requiredReadings', v)} rows={12} placeholder="List any required readings associated with this record..." />
      case 'Record Views':            return <RecordViewsSection form={form} />
      case 'New Task':                return <TextArea label="New Task" value={form.taskNote} onChange={v => set('taskNote', v)} rows={12} placeholder="Describe the task that needs to be completed following this room check..." />
      case 'Unlock History':          return <UnlockHistorySection form={form} />
      default:                        return null
    }
  }

  const completedSections = NAV_ITEMS.filter(s => {
    const map = {
      'Primary Details': form.reason || form.youngPersonAgreed,
      'Search Details': (() => { try { const p = JSON.parse(form.searchDetails || '{}'); return p.staffPresent || p.othersPresent || p.whatFound } catch { return form.searchDetails } })(),
      'Actions and Outcome': form.actionsAndOutcome,
      'Sanctions or Consequences': form.sanctionsOrConsequences,
      'Monitoring': form.monitoring,
      'Comments': form.comments,
      'Sign': form.signedBy,
      'Documents': (() => { try { return JSON.parse(form.documents||'[]').length > 0 } catch { return false } })(),
      'Linked Events': form.linkedEvents,
      'Required Readings': form.requiredReadings,
      'New Task': form.taskNote,
    }
    return !!map[s]
  })

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: 1, m: 1.5, maxHeight: '92vh' } }}>

      {/* Title bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2.5, py: 1.5, borderBottom: '1px solid #f3f4f6' }}>
        <Lock sx={{ fontSize: 18, color: '#9ca3af', mr: 1.5 }} />
        <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1, color: '#111827' }}>
          Room Check
        </Typography>
        <Button variant="contained" size="small" startIcon={<Close sx={{ fontSize: 14 }} />}
          onClick={onClose}
          sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' }, textTransform: 'none', fontSize: 12, mr: 1 }}>
          Cancel
        </Button>
        <Button variant="outlined" size="small" startIcon={<PictureAsPdf sx={{ fontSize: 14 }} />}
          sx={{ textTransform: 'none', fontSize: 12, borderColor: '#6b7280', color: '#6b7280', mr: 1 }}>
          PDF
        </Button>
        <Button variant="contained" size="small"
          startIcon={saving ? <CircularProgress size={12} color="inherit" /> : <Save sx={{ fontSize: 14 }} />}
          onClick={save} disabled={saving}
          sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#15803d' }, textTransform: 'none', fontSize: 12 }}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} sx={{ color: PURPLE }} />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
          {/* Left nav */}
          <Box sx={{ width: 210, flexShrink: 0, borderRight: '1px solid #f3f4f6', overflowY: 'auto', bgcolor: '#fafafa' }}>
            <List dense disablePadding>
              {NAV_ITEMS.map(item => {
                const active = activeSection === item
                const done = completedSections.includes(item)
                return (
                  <ListItemButton key={item} onClick={() => setActiveSection(item)}
                    sx={{
                      py: 1, px: 2,
                      borderLeft: active ? `3px solid ${PURPLE}` : '3px solid transparent',
                      bgcolor: active ? '#f5f3ff' : 'transparent',
                      '&:hover': { bgcolor: '#f5f3ff' },
                    }}>
                    <ListItemText
                      primary={item}
                      primaryTypographyProps={{
                        fontSize: 12.5, fontWeight: active ? 600 : 400,
                        color: active ? PURPLE : '#374151',
                      }}
                    />
                    {done
                      ? <CheckCircle sx={{ fontSize: 13, color: GREEN }} />
                      : <RadioButtonUnchecked sx={{ fontSize: 13, color: '#d1d5db' }} />
                    }
                  </ListItemButton>
                )
              })}
            </List>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
            {renderSection()}
          </Box>
        </Box>
      )}
    </Dialog>
  )
}

/* ── Main Section ─────────────────────────────────────── */
export default function RoomCheckSection({ youngPersonId }) {
  const [checks, setChecks] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/young-people/${youngPersonId}/room-checks`)
    const data = await res.json()
    setChecks(data.checks || [])
    setLoading(false)
  }, [youngPersonId])

  useEffect(() => { load() }, [load])

  async function deleteCheck(id) {
    if (!confirm('Delete this room check record?')) return
    await fetch(`/api/young-people/${youngPersonId}/room-checks/${id}`, { method: 'DELETE' })
    load()
  }

  function openNew() { setEditId(null); setModalOpen(true) }
  function openEdit(id) { setEditId(id); setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditId(null) }
  function onSaved() { closeModal(); load() }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Toolbar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#111827' }}>
          Room Check Records
        </Typography>
        <Button variant="contained" size="small" startIcon={<Add sx={{ fontSize: 15 }} />}
          onClick={openNew}
          sx={{ bgcolor: PURPLE, '&:hover': { bgcolor: '#7c3aed' }, textTransform: 'none', fontSize: 13 }}>
          New Room Check
        </Button>
      </Box>

      {/* List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress size={26} sx={{ color: PURPLE }} />
        </Box>
      ) : checks.length === 0 ? (
        <Paper elevation={0} sx={{ p: 5, textAlign: 'center', border: '1px solid #f3f4f6', borderRadius: 2 }}>
          <Typography variant="body2" sx={{ color: '#9ca3af', mb: 1.5 }}>No room check records yet.</Typography>
          <Button variant="outlined" size="small" onClick={openNew}
            sx={{ textTransform: 'none', fontSize: 12, borderColor: PURPLE, color: PURPLE }}>
            Add first room check
          </Button>
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
          {/* Header row */}
          <Box sx={{ px: 2.5, py: 1, bgcolor: '#fafafa', borderBottom: '1px solid #f3f4f6', display: 'grid', gridTemplateColumns: '110px 1fr 100px 80px 80px', gap: 1 }}>
            {['Date', 'Reason', 'Status', 'Signed', ''].map((h, i) => (
              <Typography key={i} variant="caption" sx={{ fontWeight: 700, color: '#6b7280', fontSize: 11 }}>{h}</Typography>
            ))}
          </Box>
          {checks.map((c, idx) => (
            <Box key={c.id}
              sx={{
                px: 2.5, py: 1.2,
                display: 'grid', gridTemplateColumns: '110px 1fr 100px 80px 80px',
                gap: 1, alignItems: 'center',
                borderBottom: idx < checks.length - 1 ? '1px solid #f9fafb' : 'none',
                cursor: 'pointer',
                '&:hover': { bgcolor: '#fafafa' },
              }}
              onClick={() => openEdit(c.id)}
            >
              <Typography variant="body2" sx={{ fontSize: 12.5, color: '#374151' }}>
                {fmtShortDate(c.dateOfEvent)}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: 12.5, color: '#374151' }}>
                {c.reason || '—'}
              </Typography>
              <Chip label={c.status || 'Open'} size="small"
                sx={{ fontSize: 10, height: 20, fontWeight: 600,
                  bgcolor: c.status === 'Closed' ? '#f0fdf4' : '#fef3c7',
                  color: c.status === 'Closed' ? GREEN : '#92400e',
                  border: `1px solid ${c.status === 'Closed' ? '#bbf7d0' : '#fde68a'}`,
                }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {c.signedBy
                  ? <CheckCircle sx={{ fontSize: 15, color: GREEN }} />
                  : <RadioButtonUnchecked sx={{ fontSize: 15, color: '#d1d5db' }} />}
                {c.locked
                  ? <Lock sx={{ fontSize: 14, color: PINK }} />
                  : <LockOpen sx={{ fontSize: 14, color: '#d1d5db' }} />}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={e => { e.stopPropagation(); deleteCheck(c.id) }}
                    sx={{ color: '#d1d5db', '&:hover': { color: '#ef4444' }, p: 0.5 }}>
                    <Delete sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ))}
        </Paper>
      )}

      <RoomCheckModal
        open={modalOpen} checkId={editId}
        youngPersonId={youngPersonId}
        onClose={closeModal} onSaved={onSaved}
      />
    </Box>
  )
}
