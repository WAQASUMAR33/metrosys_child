'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box, Paper, Typography, Avatar, Button, IconButton, Divider,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Chip, CircularProgress, Collapse, List, ListItemButton,
  ListItemText, Tooltip,
} from '@mui/material'
import {
  ArrowBack, Edit, Save, Close, ExpandLess, ExpandMore,
  Person, PhotoCamera, CheckCircle,
} from '@mui/icons-material'
import PlacementPlanSection from './sections/PlacementPlanSection'
import AdmissionsSection from './sections/AdmissionsSection'
import MatchingRiskSection from './sections/MatchingRiskSection'
import RoomCheckSection from './sections/RoomCheckSection'

const GREEN = '#16A34A'
const DARK_GREEN = '#166534'

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
function fmtInput(iso) {
  if (!iso) return ''
  return new Date(iso).toISOString().split('T')[0]
}
function calcAge(iso) {
  if (!iso) return null
  return Math.floor((Date.now() - new Date(iso).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
}

const NAV_GROUPS = [
  [
    {
      key: 'quality-of-care', label: 'Quality of Care',
      children: [
        { key: 'qoc-placement-plan',  label: 'Placement Plan' },
        { key: 'qoc-admissions',      label: 'Admissions' },
        { key: 'qoc-matching-risk',   label: 'Matching & Impact Risk Assessment' },
        { key: 'qoc-room-check',      label: 'Room Check' },
        { key: 'qoc-events',          label: 'Events (Linked Records)' },
        { key: 'qoc-bespoke-forms',   label: 'Bespoke Forms' },
      ],
    },
    { key: 'views-wishes-feelings',  label: 'Views Wishes & Feelings' },
    { key: 'education',              label: 'Education' },
    { key: 'enjoyment-achievement',  label: 'Enjoyment & Achievement' },
    { key: 'health-wellbeing',       label: 'Health & Wellbeing' },
    { key: 'positive-relationships', label: 'Positive Relationships' },
    { key: 'protection',             label: 'Protection' },
    { key: 'care-planning',          label: 'Care Planning' },
  ],
  [{ key: 'daily-recordings', label: 'Daily Recordings' }],
  [
    { key: 'personal-information', label: 'Personal Information' },
    { key: 'emails',               label: 'Emails' },
    { key: 'contacts',             label: 'Contacts' },
    { key: 'settings',             label: 'Settings' },
  ],
]

export default function YoungPersonProfile({ yp: initial }) {
  const router = useRouter()
  const [yp, setYp] = useState(initial)
  const [activeSection, setActiveSection] = useState('personal-information')
  const [expanded, setExpanded] = useState({ 'quality-of-care': false })
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(null)
  const [preview, setPreview] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  function startEdit() {
    setForm({
      firstName: yp.firstName || '', lastName: yp.lastName || '',
      gender: yp.gender || '', dateOfBirth: fmtInput(yp.dateOfBirth),
      admissionDate: fmtInput(yp.admissionDate), placement: yp.placement || '',
      longTermPlan: yp.longTermPlan || '', currentSupportNeeds: yp.currentSupportNeeds || '',
      photoUrl: yp.photoUrl || '',
    })
    setPreview(null); setPhotoFile(null); setEditing(true); setError('')
  }

  function cancelEdit() {
    setEditing(false); setForm(null); setPreview(null); setPhotoFile(null)
  }

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function saveEdit() {
    if (!form.firstName || !form.lastName) { setError('First and last name are required.'); return }
    setSaving(true)
    try {
      let photoUrl = form.photoUrl
      if (photoFile) {
        const fd = new FormData(); fd.append('file', photoFile)
        const upRes = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!upRes.ok) { setError('Image upload failed.'); return }
        photoUrl = (await upRes.json()).url
      }
      const res = await fetch(`/api/young-people/${yp.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, photoUrl }),
      })
      if (res.ok) {
        setYp(prev => ({ ...prev, ...form, photoUrl }))
        setEditing(false); setForm(null); setPreview(null); setPhotoFile(null)
      } else { setError('Failed to save changes.') }
    } finally { setSaving(false) }
  }

  const age = calcAge(yp.dateOfBirth)

  return (
    <Box sx={{ display: 'flex' }}>
      {/* ── Profile Sidebar ── */}
      <Paper
        elevation={0}
        sx={{
          width: 220, flexShrink: 0, borderRight: '1px solid #e5e7eb',
          display: 'flex', flexDirection: 'column', minHeight: '100vh',
          position: 'sticky', top: 0, bgcolor: '#fff', borderRadius: 0,
        }}
      >
        {/* Back */}
        <Button
          startIcon={<ArrowBack sx={{ fontSize: 14 }} />}
          onClick={() => router.push('/dashboard/young-people')}
          size="small"
          sx={{
            justifyContent: 'flex-start', px: 2, py: 1.2, borderRadius: 0,
            borderBottom: '1px solid #f3f4f6', color: '#6b7280', fontSize: 11,
            '&:hover': { color: GREEN, bgcolor: 'rgba(22,163,74,0.04)' },
          }}
        >
          Back to list
        </Button>

        {/* Avatar + name */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2.5, px: 1.5, borderBottom: '1px solid #f3f4f6' }}>
          <Avatar
            src={yp.photoUrl || undefined}
            sx={{ width: 64, height: 64, bgcolor: '#dcfce7', color: GREEN, mb: 1, border: '2px solid #bbf7d0' }}
          >
            {!yp.photoUrl && <Person sx={{ fontSize: 28 }} />}
          </Avatar>
          <Typography variant="body2" fontWeight={600} align="center" sx={{ color: '#1f2937', lineHeight: 1.3 }}>
            {yp.firstName} {yp.lastName}
          </Typography>
          {age !== null && (
            <Typography variant="caption" sx={{ color: '#9ca3af', mt: 0.3 }}>{age} years old</Typography>
          )}
          <Chip
            label={yp.placement || 'No placement'}
            size="small"
            sx={{ mt: 1, fontSize: 10, height: 20, bgcolor: '#dcfce7', color: DARK_GREEN, fontWeight: 600 }}
          />
        </Box>

        {/* Nav */}
        <List dense disablePadding sx={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 220px)', py: 0.5 }}>
          {NAV_GROUPS.map((group, gi) => (
            <Box key={gi}>
              {gi > 0 && <Divider sx={{ mx: 2, my: 1, borderColor: '#e91e8c', borderWidth: 1.5 }} />}
              {group.map((item) => {
                const { key, label, children } = item
                const isExpanded = expanded[key]
                const childActive = children?.some(c => c.key === activeSection)
                const active = activeSection === key

                if (children) return (
                  <Box key={key}>
                    <ListItemButton
                      onClick={() => setExpanded(e => ({ ...e, [key]: !e[key] }))}
                      sx={{
                        py: 0.8, px: 2, fontSize: 12.5, fontWeight: 500,
                        color: childActive ? GREEN : '#374151',
                        '&:hover': { bgcolor: 'rgba(22,163,74,0.05)' },
                      }}
                    >
                      <ListItemText primary={label} primaryTypographyProps={{ fontSize: 12.5, fontWeight: 500 }} />
                      {isExpanded ? <ExpandLess sx={{ fontSize: 16, color: '#9ca3af' }} /> : <ExpandMore sx={{ fontSize: 16, color: '#9ca3af' }} />}
                    </ListItemButton>
                    <Collapse in={isExpanded} timeout="auto">
                      <Box sx={{ borderLeft: '2px solid #e5e7eb', ml: 2.5, mb: 0.5 }}>
                        {children.map(child => {
                          const cActive = activeSection === child.key
                          return (
                            <ListItemButton
                              key={child.key}
                              onClick={() => setActiveSection(child.key)}
                              sx={{
                                py: 0.6, pl: 1.5, pr: 2, fontSize: 11.5,
                                color: cActive ? GREEN : '#6b7280',
                                fontWeight: cActive ? 600 : 400,
                                borderRight: cActive ? `3px solid ${GREEN}` : 'none',
                                bgcolor: cActive ? 'rgba(22,163,74,0.07)' : 'transparent',
                                '&:hover': { bgcolor: 'rgba(22,163,74,0.05)' },
                              }}
                            >
                              <ListItemText primary={child.label} primaryTypographyProps={{ fontSize: 11.5 }} />
                            </ListItemButton>
                          )
                        })}
                      </Box>
                    </Collapse>
                  </Box>
                )

                return (
                  <ListItemButton
                    key={key}
                    onClick={() => setActiveSection(key)}
                    sx={{
                      py: 0.8, px: 2,
                      color: active ? GREEN : '#374151',
                      fontWeight: active ? 600 : 500,
                      borderRight: active ? `3px solid ${GREEN}` : 'none',
                      bgcolor: active ? 'rgba(22,163,74,0.07)' : 'transparent',
                      '&:hover': { bgcolor: 'rgba(22,163,74,0.05)' },
                    }}
                  >
                    <ListItemText primary={label} primaryTypographyProps={{ fontSize: 12.5, fontWeight: active ? 600 : 500 }} />
                  </ListItemButton>
                )
              })}
            </Box>
          ))}
        </List>

        {/* Meta footer */}
        <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid #f3f4f6' }}>
          <Typography variant="caption" display="block" sx={{ color: '#9ca3af', fontSize: 10 }}>Added {fmtDate(yp.createdAt)}</Typography>
          <Typography variant="caption" display="block" sx={{ color: '#9ca3af', fontSize: 10 }}>Updated {fmtDate(yp.updatedAt)}</Typography>
          {yp.updatedBy && <Typography variant="caption" display="block" sx={{ color: '#9ca3af', fontSize: 10 }}>by {yp.updatedBy}</Typography>}
        </Box>
      </Paper>

      {/* ── Main content ── */}
      <Box sx={{ flex: 1, minWidth: 0, bgcolor: '#f0f4f8' }}>
        {/* Topbar */}
        <Paper
          elevation={0}
          sx={{
            px: 3, py: 1.5, display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10,
            borderBottom: '1px solid #f3f4f6', borderRadius: 0,
          }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#1f2937', lineHeight: 1.2 }}>
              {yp.firstName} {yp.lastName}
            </Typography>
            <Typography variant="caption" sx={{ color: '#9ca3af' }}>{yp.homeName}</Typography>
          </Box>

          {!editing ? (
            <Button
              variant="contained" size="small" startIcon={<Edit sx={{ fontSize: 14 }} />}
              onClick={startEdit}
              sx={{ bgcolor: DARK_GREEN, '&:hover': { bgcolor: GREEN }, borderRadius: 2, textTransform: 'none', fontSize: 13 }}
            >
              Edit Profile
            </Button>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {error && <Typography variant="caption" color="error">{error}</Typography>}
              <Button
                variant="contained" size="small" startIcon={saving ? <CircularProgress size={12} color="inherit" /> : <Save sx={{ fontSize: 14 }} />}
                onClick={saveEdit} disabled={saving}
                sx={{ bgcolor: GREEN, '&:hover': { bgcolor: DARK_GREEN }, borderRadius: 2, textTransform: 'none', fontSize: 13 }}
              >
                {saving ? 'Saving…' : 'Save'}
              </Button>
              <Button
                variant="outlined" size="small" startIcon={<Close sx={{ fontSize: 14 }} />}
                onClick={cancelEdit}
                sx={{ borderRadius: 2, textTransform: 'none', fontSize: 13, color: '#6b7280', borderColor: '#d1d5db' }}
              >
                Cancel
              </Button>
            </Box>
          )}
        </Paper>

        {/* Section content */}
        <Box sx={{ p: 3 }}>
          {activeSection === 'personal-information' && (
            <OverviewSection yp={yp} editing={editing} form={form} set={set}
              preview={preview} fileInputRef={fileInputRef}
              handleFileChange={handleFileChange}
              onRemovePhoto={() => { setPreview(null); setPhotoFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
            />
          )}
          {activeSection === 'care-planning' && (
            <TextSection label="Care Planning" value={yp.longTermPlan}
              editing={editing} formValue={form?.longTermPlan} onChange={v => set('longTermPlan', v)} />
          )}
          {activeSection === 'health-wellbeing' && (
            <TextSection label="Health & Wellbeing" value={yp.currentSupportNeeds}
              editing={editing} formValue={form?.currentSupportNeeds} onChange={v => set('currentSupportNeeds', v)} />
          )}
          {activeSection === 'qoc-placement-plan' && (
            <PlacementPlanSection youngPersonId={yp.id} />
          )}
          {activeSection === 'qoc-admissions' && (
            <AdmissionsSection youngPersonId={yp.id} admissionDate={yp.admissionDate} />
          )}
          {activeSection === 'qoc-matching-risk' && (
            <MatchingRiskSection youngPersonId={yp.id} ypName={`${yp.firstName} ${yp.lastName}`} />
          )}
          {activeSection === 'qoc-room-check' && (
            <RoomCheckSection youngPersonId={yp.id} />
          )}
          {[
            'quality-of-care', 'views-wishes-feelings', 'education',
            'enjoyment-achievement', 'positive-relationships', 'protection',
            'daily-recordings', 'emails', 'contacts', 'settings',
            'qoc-events', 'qoc-bespoke-forms',
          ].includes(activeSection) && (
            <PlaceholderSection label={(() => {
              const all = NAV_GROUPS.flat()
              const top = all.find(n => n.key === activeSection)
              if (top) return top.label
              for (const item of all) {
                const child = item.children?.find(c => c.key === activeSection)
                if (child) return child.label
              }
              return activeSection
            })()} />
          )}
        </Box>
      </Box>
    </Box>
  )
}

/* ── Overview ── */
function OverviewSection({ yp, editing, form, set, preview, fileInputRef, handleFileChange, onRemovePhoto }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {editing && (
        <MuiCard title="Photo">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={preview || yp.photoUrl || undefined}
              onClick={() => fileInputRef.current?.click()}
              sx={{ width: 72, height: 72, cursor: 'pointer', bgcolor: '#dcfce7', border: '2px dashed #d1d5db', '&:hover': { borderColor: GREEN } }}
            >
              <PhotoCamera sx={{ color: '#9ca3af' }} />
            </Avatar>
            <Box>
              <Button variant="outlined" size="small" onClick={() => fileInputRef.current?.click()}
                sx={{ textTransform: 'none', fontSize: 12, borderColor: GREEN, color: GREEN, '&:hover': { bgcolor: 'rgba(22,163,74,0.05)' } }}>
                Browse image
              </Button>
              {(preview || yp.photoUrl) && (
                <Button size="small" onClick={onRemovePhoto}
                  sx={{ ml: 1, textTransform: 'none', fontSize: 11, color: '#9ca3af', '&:hover': { color: '#ef4444' } }}>
                  Remove
                </Button>
              )}
              <Typography variant="caption" display="block" sx={{ color: '#9ca3af', mt: 0.5 }}>JPG, PNG, WEBP</Typography>
            </Box>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: 'none' }} onChange={handleFileChange} />
          </Box>
        </MuiCard>
      )}

      <MuiCard title="Personal Details">
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          <MuiField label="First Name" value={yp.firstName} editing={editing} formValue={form?.firstName} onChange={v => set('firstName', v)} />
          <MuiField label="Last Name" value={yp.lastName} editing={editing} formValue={form?.lastName} onChange={v => set('lastName', v)} />
          <MuiField label="Date of Birth" value={fmtDate(yp.dateOfBirth)} editing={editing} formValue={form?.dateOfBirth} onChange={v => set('dateOfBirth', v)} type="date" />
          <MuiSelField label="Gender" value={yp.gender} editing={editing} formValue={form?.gender} onChange={v => set('gender', v)}
            options={['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say']} />
        </Box>
      </MuiCard>

      <MuiCard title="Placement">
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          <MuiField label="Admission Date" value={fmtDate(yp.admissionDate)} editing={editing} formValue={form?.admissionDate} onChange={v => set('admissionDate', v)} type="date" />
          <MuiSelField label="Placement Type" value={yp.placement} editing={editing} formValue={form?.placement} onChange={v => set('placement', v)}
            options={['Emergency', 'Short Term', 'Long Term', 'Respite', 'Remand']} />
          <MuiField label="Home" value={yp.homeName} />
        </Box>
      </MuiCard>
    </Box>
  )
}

function TextSection({ label, value, editing, formValue, onChange }) {
  return (
    <MuiCard title={label}>
      {editing ? (
        <TextField fullWidth multiline rows={10} value={formValue || ''} onChange={e => onChange(e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}…`} size="small"
          sx={{ '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: GREEN }, fontSize: 13 } }} />
      ) : (
        <Typography variant="body2" sx={{ color: value ? '#374151' : '#9ca3af', fontStyle: value ? 'normal' : 'italic', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
          {value || 'Not recorded'}
        </Typography>
      )}
    </MuiCard>
  )
}

function PlaceholderSection({ label }) {
  return (
    <MuiCard title={label}>
      <Typography variant="body2" sx={{ color: '#9ca3af', fontStyle: 'italic' }}>No records yet for {label}.</Typography>
    </MuiCard>
  )
}

/* ── Shared MUI wrappers ── */
function MuiCard({ title, children }) {
  return (
    <Paper elevation={0} sx={{ border: '1px solid #f3f4f6', borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #f9fafb', bgcolor: 'rgba(249,250,251,0.6)' }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ p: 2.5 }}>{children}</Box>
    </Paper>
  )
}

function MuiField({ label, value, editing, formValue, onChange, type = 'text' }) {
  return (
    <Box>
      {editing && onChange ? (
        <TextField label={label} type={type} value={formValue ?? ''} onChange={e => onChange(e.target.value)}
          fullWidth size="small" InputLabelProps={type === 'date' ? { shrink: true } : {}}
          sx={{ '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: GREEN }, fontSize: 13 }, '& label.Mui-focused': { color: GREEN } }} />
      ) : (
        <Box>
          <Typography variant="caption" sx={{ color: '#9ca3af', mb: 0.3, display: 'block' }}>{label}</Typography>
          <Typography variant="body2" fontWeight={500} sx={{ color: '#1f2937' }}>{value || '—'}</Typography>
        </Box>
      )}
    </Box>
  )
}

function MuiSelField({ label, value, editing, formValue, onChange, options }) {
  return (
    <Box>
      {editing && onChange ? (
        <FormControl fullWidth size="small">
          <InputLabel sx={{ '&.Mui-focused': { color: GREEN }, fontSize: 13 }}>{label}</InputLabel>
          <Select value={formValue ?? ''} onChange={e => onChange(e.target.value)} label={label}
            sx={{ fontSize: 13, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: GREEN } }}>
            <MenuItem value=""><em>Select…</em></MenuItem>
            {options.map(o => <MenuItem key={o} value={o} sx={{ fontSize: 13 }}>{o}</MenuItem>)}
          </Select>
        </FormControl>
      ) : (
        <Box>
          <Typography variant="caption" sx={{ color: '#9ca3af', mb: 0.3, display: 'block' }}>{label}</Typography>
          <Typography variant="body2" fontWeight={500} sx={{ color: '#1f2937' }}>{value || '—'}</Typography>
        </Box>
      )}
    </Box>
  )
}
