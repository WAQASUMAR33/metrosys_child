'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Box, Paper, Typography, TextField, Button, IconButton,
  CircularProgress, Divider, Tooltip,
} from '@mui/material'
import {
  Add, Delete, Save, NoteAdd, Visibility,
  KeyboardArrowUp, KeyboardArrowDown,
} from '@mui/icons-material'

const PURPLE = '#6b21a8'
const PINK   = '#c2185b'

function SectionHeader({ title }) {
  return (
    <Box sx={{ bgcolor: PURPLE, px: 2.5, py: 1.5, borderRadius: '8px 8px 0 0' }}>
      <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700, letterSpacing: '0.02em' }}>
        {title}
      </Typography>
    </Box>
  )
}

function FieldLabel({ children }) {
  return (
    <Typography variant="caption" sx={{ color: '#374151', fontWeight: 600, fontSize: 12, display: 'block', mb: 0.5 }}>
      {children}
    </Typography>
  )
}

function MultilineField({ label, value, onChange, rows = 5, disabled }) {
  return (
    <Box>
      {label && <FieldLabel>{label}</FieldLabel>}
      <TextField
        multiline rows={rows} fullWidth size="small" value={value || ''} onChange={e => onChange(e.target.value)}
        disabled={disabled}
        sx={{
          '& .MuiOutlinedInput-root': { fontSize: 13, bgcolor: '#fff',
            '&.Mui-focused fieldset': { borderColor: PURPLE },
          },
        }}
      />
    </Box>
  )
}

const EMPTY_ITEM = () => ({ id: Date.now(), date: new Date().toISOString().split('T')[0], item: '', notes: '' })

export default function AdmissionsSection({ youngPersonId, admissionDate }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [items, setItems] = useState([EMPTY_ITEM()])

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/young-people/${youngPersonId}/admission`)
    const json = await res.json()
    if (json.admission) {
      setData(json.admission)
      try {
        const parsed = JSON.parse(json.admission.itemsArrivedWith || '[]')
        setItems(parsed.length > 0 ? parsed.map((it, i) => ({ ...it, id: it.id || Date.now() + i })) : [EMPTY_ITEM()])
      } catch { setItems([EMPTY_ITEM()]) }
    } else {
      setData({})
    }
    setLoading(false)
  }, [youngPersonId])

  useEffect(() => { load() }, [load])

  function set(key, val) { setData(d => ({ ...d, [key]: val })) }

  function addItem() { setItems(prev => [...prev, EMPTY_ITEM()]) }
  function removeItem(id) { setItems(prev => prev.filter(it => it.id !== id)) }
  function updateItem(id, key, val) { setItems(prev => prev.map(it => it.id === id ? { ...it, [key]: val } : it)) }
  function moveItem(id, dir) {
    setItems(prev => {
      const idx = prev.findIndex(it => it.id === id)
      const next = [...prev]
      const target = idx + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }

  async function save() {
    setSaving(true)
    await fetch(`/api/young-people/${youngPersonId}/admission`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, itemsArrivedWith: JSON.stringify(items) }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const fmtDate = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }
  const fmtTime = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
      <CircularProgress size={28} sx={{ color: PURPLE }} />
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

      {/* ── Top section ── */}
      <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 1 }}>
        <SectionHeader title="Admissions" />
        <Box sx={{ p: 2.5, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>

          {/* Left: Visits Undertaken */}
          <Box>
            <FieldLabel>Visits Undertaken</FieldLabel>
            <TextField
              multiline rows={10} fullWidth size="small"
              value={data?.visitsUndertaken || ''} onChange={e => set('visitsUndertaken', e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { fontSize: 13, '&.Mui-focused fieldset': { borderColor: PURPLE } } }}
            />
          </Box>

          {/* Right column */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Admissions Documents box */}
            <Paper variant="outlined" sx={{ p: 2, borderColor: '#e5e7eb' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#374151', display: 'block', mb: 1.5 }}>
                Admissions Documents
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="outlined" size="small" startIcon={<NoteAdd sx={{ fontSize: 16 }} />}
                  sx={{
                    textTransform: 'none', fontSize: 12, justifyContent: 'flex-start',
                    borderColor: PINK, color: PINK,
                    '&:hover': { bgcolor: `${PINK}08`, borderColor: PINK },
                  }}
                >
                  Add Document
                </Button>
                <Button
                  variant="outlined" size="small" startIcon={<Visibility sx={{ fontSize: 16 }} />}
                  sx={{
                    textTransform: 'none', fontSize: 12, justifyContent: 'flex-start',
                    borderColor: PINK, color: PINK,
                    '&:hover': { bgcolor: `${PINK}08`, borderColor: PINK },
                  }}
                >
                  View All Documents
                </Button>
              </Box>
            </Paper>

            {/* Consent by whom */}
            <MultilineField
              label="Consent by whom"
              value={data?.consentByWhom}
              onChange={v => set('consentByWhom', v)}
              rows={3}
            />

            {/* Young Person's Wishes */}
            <MultilineField
              label="Young Persons Wishes (room, colour, bedding etc)"
              value={data?.youngPersonWishes}
              onChange={v => set('youngPersonWishes', v)}
              rows={3}
            />
          </Box>
        </Box>
      </Paper>

      {/* ── Items Arrived With ── */}
      <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 1 }}>
        <Box sx={{ px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827' }}>
            Items Arrived With
          </Typography>
          <Button
            variant="outlined" size="small" startIcon={<Add sx={{ fontSize: 15 }} />}
            onClick={addItem}
            sx={{
              textTransform: 'none', fontSize: 12,
              borderColor: PINK, color: PINK,
              '&:hover': { bgcolor: `${PINK}08`, borderColor: PINK },
            }}
          >
            New Clothing Item
          </Button>
        </Box>

        {/* Table header */}
        <Box sx={{ px: 2.5, py: 1, bgcolor: '#fafafa', borderBottom: '1px solid #f3f4f6', display: 'grid', gridTemplateColumns: '130px 1fr 1fr 72px', gap: 1 }}>
          {['Date', 'Item', 'Notes', ''].map((h, i) => (
            <Typography key={i} variant="caption" sx={{ color: '#6b7280', fontWeight: 600, fontSize: 11 }}>{h}</Typography>
          ))}
        </Box>

        {/* Rows */}
        <Box>
          {items.map((it, idx) => (
            <Box
              key={it.id}
              sx={{
                px: 2.5, py: 0.8,
                display: 'grid', gridTemplateColumns: '130px 1fr 1fr 72px',
                gap: 1, alignItems: 'center',
                borderBottom: idx < items.length - 1 ? '1px solid #f9fafb' : 'none',
                '&:hover': { bgcolor: '#fafafa' },
              }}
            >
              <TextField
                type="date" size="small" value={it.date}
                onChange={e => updateItem(it.id, 'date', e.target.value)}
                inputProps={{ style: { fontSize: 12 } }}
                sx={{ '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: PURPLE } } }}
              />
              <TextField
                size="small" value={it.item} placeholder="Item description"
                onChange={e => updateItem(it.id, 'item', e.target.value)}
                inputProps={{ style: { fontSize: 12 } }}
                sx={{ '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: PURPLE } } }}
              />
              <TextField
                size="small" value={it.notes} placeholder="Notes"
                onChange={e => updateItem(it.id, 'notes', e.target.value)}
                inputProps={{ style: { fontSize: 12 } }}
                sx={{ '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: PURPLE } } }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <Tooltip title="Delete row">
                  <IconButton size="small" onClick={() => removeItem(it.id)} sx={{ color: '#d1d5db', '&:hover': { color: '#ef4444' }, p: 0.5 }}>
                    <Delete sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <IconButton size="small" onClick={() => moveItem(it.id, -1)} disabled={idx === 0}
                    sx={{ color: '#d1d5db', '&:hover': { color: PURPLE }, p: 0.3 }}>
                    <KeyboardArrowUp sx={{ fontSize: 14 }} />
                  </IconButton>
                  <IconButton size="small" onClick={() => moveItem(it.id, 1)} disabled={idx === items.length - 1}
                    sx={{ color: '#d1d5db', '&:hover': { color: PURPLE }, p: 0.3 }}>
                    <KeyboardArrowDown sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* ── Plan of Accommodation ── */}
      <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 1 }}>
        <SectionHeader title="Plan of Accomodation" />
        <Box sx={{ p: 2.5, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>

          {/* Left */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <MultilineField label="Visits" value={data?.planVisits} onChange={v => set('planVisits', v)} rows={4} />
            <MultilineField label="Documents" value={data?.planDocuments} onChange={v => set('planDocuments', v)} rows={4} />

            {/* Admission Date (read-only from YP record) */}
            <Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <FieldLabel>Admission Date *</FieldLabel>
                  <TextField
                    size="small" fullWidth value={fmtDate(admissionDate)} disabled
                    sx={{ '& .MuiInputBase-input': { fontSize: 13, color: '#374151' } }}
                  />
                </Box>
                <Box>
                  <FieldLabel>Time *</FieldLabel>
                  <TextField
                    size="small" value={fmtTime(admissionDate)} disabled
                    sx={{ width: 120, '& .MuiInputBase-input': { fontSize: 13, color: '#374151' } }}
                  />
                </Box>
              </Box>
              <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: 11, mt: 0.5, display: 'block' }}>
                * This information is filled under Personal Information, current start date and time
              </Typography>
            </Box>
          </Box>

          {/* Right */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <MultilineField label="Bedroom" value={data?.bedroom} onChange={v => set('bedroom', v)} rows={4} />
            <MultilineField label="Fire Procedure" value={data?.fireProcedure} onChange={v => set('fireProcedure', v)} rows={4} />
            <MultilineField label="Other" value={data?.planOther} onChange={v => set('planOther', v)} rows={4} />
          </Box>
        </Box>
      </Paper>

      {/* ── Save button ── */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
        {saved && (
          <Typography variant="caption" sx={{ color: '#16a34a', alignSelf: 'center', fontWeight: 600 }}>
            Saved successfully
          </Typography>
        )}
        <Button
          variant="contained" size="small"
          startIcon={saving ? <CircularProgress size={13} color="inherit" /> : <Save sx={{ fontSize: 15 }} />}
          onClick={save} disabled={saving}
          sx={{
            bgcolor: PURPLE, '&:hover': { bgcolor: '#7c3aed' },
            textTransform: 'none', fontSize: 13, px: 3,
          }}
        >
          {saving ? 'Saving…' : 'Save Admissions'}
        </Button>
      </Box>
    </Box>
  )
}
