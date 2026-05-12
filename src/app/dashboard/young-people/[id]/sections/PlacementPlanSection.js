'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Box, Paper, Typography, Button, IconButton, Chip, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, TextField, Divider,
  ToggleButton, ToggleButtonGroup, Tooltip,
} from '@mui/material'
import {
  Add, Delete, Edit, Save, Close, CheckCircle, AccessTime, Inventory2, Draw,
} from '@mui/icons-material'

const GREEN = '#16A34A'
const DARK_GREEN = '#166534'

const STANDARDS = [
  'Care Planning', 'Childrens Views, Wishes and Feelings', 'Education',
  'Enjoyment and achievement', 'Health and wellbeing',
  'Positive Relationships', 'Protection', 'Quality of Care',
]

const DETAILS_BY_STANDARD = {
  'Quality of Care': [
    'How does the young person participate in the daily life of the home',
    'Make decisions that gives young person an appropriate degree of freedom and choice based on plans',
    'Provide personal items that are appropriate for their age and understanding',
    'Provide physical necessities needed in order to live comfortably',
    'Staff protect & promote young person\'s dignity and respect',
    'Staff protect and promote each young person\'s welfare',
    'Staff provide personalised care taking account of the child\'s background',
    'Support the young person to manage the impact of any experience of abuse or neglect',
    'Support young person to develop resilience and skills that prepare the child to return home; new placement; or independently',
  ],
  'Protection': ['Medical Detail', 'School Details'],
  'Positive Relationships': [
    'Communicate to young person expectations about their behaviour, ensuring the young person understands those expectations in accordance with their age & understanding',
    'Encourage young person to take responsibility for their behaviour – (age appropriate & understanding)',
    'help them plan for the future',
    'Meet each young person\'s behavioural and emotional needs',
    'Staff are provided with supervision and support to enable them to understand and manage their own feelings and responses to the behaviour and emotions of young people, and to help children to do the same',
    'Staff should strive to gain young person\'s respect and trust',
    'Staff should understand how young person\'s previous experiences & present emotions can be communicated through behaviours and have the competence and skills to interpret these and develop positive relationships with the young person',
    'Staff to de-escalate confrontations with or between young people, or potentially violent behaviours by young people',
    'Staff to have the skills to recognise incidents or indications of bullying and how to deal with them',
    'Staff to understand and communicate to young people that bullying is unacceptable',
  ],
  'Health and wellbeing': [
    'How does the YP like their breakfast',
    'Staff support the health and well-being outcomes that are recorded in the child\'s health plans',
    'Staff to understand and develop skills to promote the child\'s wellbeing',
    'Support activities, attend appointments, for the purpose of meeting the young person\'s health and wellbeing needs',
    'Support young person\'s health & wellbeing needs & the options available to meet young person\'s health and wellbeing, in a way that is appropriate to the child\'s age and understanding',
    'Young person has access to such dental, medical, nursing, psychiatric and psychological advice, treatment and other services',
    'Young person is registered as a patient with a general medical practitioner and a registered dental practitioner',
  ],
  'Enjoyment and achievement': [
    'Staff develop the child\'s interests and hobbies',
    'Young person has access to a range of activities that enables them to pursue interests and hobbies',
    'Young person makes a positive contribution to the home and the wider community',
  ],
  'Education': [
    'Ensure young person has access to appropriate equipment, facilities and resources to support learning',
    'Maintain contact with educational establishments to support learning achievement',
    'Raise any need for assessment or specialist provision',
    'Support independent study skills',
    'Support informal learning',
    'Support young people above compulsory school age with further education, training & employment leading into future chosen paths',
    'Support young people achieve targets recorded in PEP',
    'Support young people attend their education or training provision',
    'Support young people understand importance of education, learning & training',
    'Support young person overcome learning barriers',
  ],
  'Childrens Views, Wishes and Feelings': [
    'Ascertain and consider each child\'s views, wishes and feelings, and balance these against what they judge to be in the child\'s best interests when making decisions about the child\'s care and welfare',
    'Children\'s view, wishes and feelings - Support young person to express views, wishes & feelings',
    'Point of Admission: Process of making and receiving complaints outcomes',
    'Point of Admission: Provide the young person with their handbook',
    'Point of Admission: What advocacy support available and how to access this',
    'Regularly consult young person, and seek their feedback, about the quality of the home\'s care',
    'Support each young person to prepare for any review of the child\'s relevant plans and to make the child\'s views, wishes and feelings known for the purposes of that review',
    'Support young person to express views, wishes & feelings',
    'Support young person to understand how their privacy will be respected and the circumstances when it may have to be limited',
    'Was the young Person consulted in reviewing their Handbook & complaints procedure?',
  ],
  'Care Planning': [
    'The registered person considers that the young person is at risk of harm or has concerns that the care provided for the young person is inadequate to meet their needs;',
    'The young person is, or has been, persistently absent from the home without permission; or',
    'Contact between young person and parents, relatives and friends, is promoted in accordance with relevant plans',
    'Ensure the effective induction of young person into the home',
    'Manage and review the placement of children in the home',
    'Plan for, and support, young person to prepare to leave the home or to move into adult care',
    'Staff support young person to access and contribute to the records kept by the home',
    'Young people are admitted to the home only if their needs are within the range of needs for whom it is intended that the home is to provide care, as set out in the home\'s statement of purpose',
    'Young person requests a review of his or her relevant plans.',
    'Young Person\'s placing authority is contacted, and a review of relevant plans is requested, when;',
  ],
  default: ['Needs Improvement', 'Developing', 'Achieving', 'Excelling', 'Requires Immediate Action', 'On Track', 'Monitoring Required'],
}

const TARGETS = ['Current Level 5', 'brush teeth - Current Level 5', 'Education - Current Level 7']
const KEYWORKERS = ['Admin Accord', 'Key Worker 1', 'Key Worker 2', 'Manager']

function getDetails(standard) { return DETAILS_BY_STANDARD[standard] || DETAILS_BY_STANDARD.default }

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
function fmtDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB') + ' at ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
function fmtInput(iso) {
  if (!iso) return ''
  return new Date(iso).toISOString().split('T')[0]
}

const STATUS_META = {
  Approved: { color: 'success', bg: '#f0fdf4', border: '#bbf7d0', icon: CheckCircle, iconColor: GREEN },
  Pending:  { color: 'warning', bg: '#fffbeb', border: '#fde68a', icon: AccessTime,  iconColor: '#f59e0b' },
  Rejected: { color: 'default', bg: '#f9fafb', border: '#e5e7eb', icon: Inventory2,  iconColor: '#9ca3af' },
}

const EMPTY = { standard: '', detail: '', details: '', requiredActions: '', linkedTarget: '', sort: '1', reviewDate: '', status: 'Pending', keyworkerSigned: '' }

export default function PlacementPlanSection({ youngPersonId }) {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStandard, setFilterStandard] = useState('')
  const [globalReviewDate, setGlobalReviewDate] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/young-people/${youngPersonId}/placement-plans`)
    const data = await res.json()
    setPlans(data.plans || [])
    setLoading(false)
  }, [youngPersonId])

  useEffect(() => { load() }, [load])

  function setF(k, v) { setForm(f => ({ ...f, [k]: v })) }
  function setEF(k, v) { setEditForm(f => ({ ...f, [k]: v })) }

  async function addPlan() {
    setSaving(true)
    const res = await fetch(`/api/young-people/${youngPersonId}/placement-plans`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, reviewDate: globalReviewDate || form.reviewDate }),
    })
    setSaving(false)
    if (res.ok) { setForm(EMPTY); setShowForm(false); load() }
  }

  async function deletePlan(id) {
    if (!confirm('Delete this placement plan?')) return
    await fetch(`/api/young-people/${youngPersonId}/placement-plans/${id}`, { method: 'DELETE' })
    load()
  }

  async function saveEdit(id) {
    setSaving(true)
    await fetch(`/api/young-people/${youngPersonId}/placement-plans/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm),
    })
    setSaving(false); setEditingId(null); load()
  }

  async function signNow(id, kw) {
    if (!kw) return
    await fetch(`/api/young-people/${youngPersonId}/placement-plans/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyworkerSigned: kw, signedAt: new Date().toISOString() }),
    })
    load()
  }

  function startEdit(plan) {
    setEditingId(plan.id)
    setEditForm({
      standard: plan.standard || '', detail: plan.detail || '', details: plan.details || '',
      requiredActions: plan.requiredActions || '', linkedTarget: plan.linkedTarget || '',
      sort: String(plan.sort || 1), status: plan.status || 'Pending',
      reviewDate: fmtInput(plan.reviewDate), keyworkerSigned: plan.keyworkerSigned || '',
    })
  }

  const filtered = plans.filter(p => !filterStandard || p.standard === filterStandard)
  const approved = filtered.filter(p => p.status === 'Approved')
  const pending  = filtered.filter(p => p.status === 'Pending')
  const previous = filtered.filter(p => p.status === 'Rejected')

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

      {/* ── Toolbar ── */}
      <Paper elevation={0} sx={{ px: 2, py: 1.5, border: '1px solid #f3f4f6', borderRadius: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280' }}>Filter Items</Typography>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel sx={{ fontSize: 12 }}>Select a standard</InputLabel>
          <Select value={filterStandard} onChange={e => setFilterStandard(e.target.value)} label="Select a standard"
            sx={{ fontSize: 12, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: GREEN } }}>
            <MenuItem value=""><em>All</em></MenuItem>
            {STANDARDS.map(s => <MenuItem key={s} value={s} sx={{ fontSize: 12 }}>{s}</MenuItem>)}
          </Select>
        </FormControl>
        <Button variant="outlined" size="small" onClick={() => setFilterStandard('')}
          sx={{ textTransform: 'none', fontSize: 12, borderColor: '#d1d5db', color: '#374151', '&:hover': { borderColor: '#9ca3af' } }}>
          Show All
        </Button>
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280' }}>Review Date</Typography>
          <TextField type="date" size="small" value={globalReviewDate} onChange={e => setGlobalReviewDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150, '& .MuiInputBase-input': { fontSize: 12 }, '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: GREEN } }} />
          <Tooltip title="Add new plan">
            <IconButton onClick={() => { setShowForm(true); setForm(EMPTY) }} size="small"
              sx={{ bgcolor: DARK_GREEN, color: '#fff', width: 32, height: 32, '&:hover': { bgcolor: GREEN } }}>
              <Add sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* ── Add form ── */}
      {showForm && (
        <PlanForm form={form} setF={setF} onSave={addPlan} onCancel={() => setShowForm(false)} saving={saving} />
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={24} sx={{ color: GREEN }} />
        </Box>
      )}

      {/* ── Approved ── */}
      {approved.length > 0 && (
        <PlanGroup label="Currently Approved" icon={<CheckCircle sx={{ fontSize: 16, color: GREEN }} />} bg="#f0fdf4" border="#bbf7d0">
          {approved.map(p => (
            <PlanCard key={p.id} plan={p} editing={editingId === p.id} editForm={editForm} setEF={setEF}
              onEdit={() => startEdit(p)} onSaveEdit={() => saveEdit(p.id)} onCancelEdit={() => setEditingId(null)}
              onDelete={() => deletePlan(p.id)} onSign={signNow} saving={saving} />
          ))}
        </PlanGroup>
      )}

      {/* ── Pending ── */}
      {pending.length > 0 && (
        <PlanGroup label="Pending" icon={<AccessTime sx={{ fontSize: 16, color: '#f59e0b' }} />} bg="#fffbeb" border="#fde68a">
          {pending.map(p => (
            <PlanCard key={p.id} plan={p} editing={editingId === p.id} editForm={editForm} setEF={setEF}
              onEdit={() => startEdit(p)} onSaveEdit={() => saveEdit(p.id)} onCancelEdit={() => setEditingId(null)}
              onDelete={() => deletePlan(p.id)} onSign={signNow} saving={saving} />
          ))}
        </PlanGroup>
      )}

      {/* ── Previous ── */}
      {previous.length > 0 && (
        <PlanGroup label="Previous Plans" icon={<Inventory2 sx={{ fontSize: 16, color: '#9ca3af' }} />} bg="#f9fafb" border="#e5e7eb">
          {previous.map(p => (
            <PlanCard key={p.id} plan={p} editing={editingId === p.id} editForm={editForm} setEF={setEF}
              onEdit={() => startEdit(p)} onSaveEdit={() => saveEdit(p.id)} onCancelEdit={() => setEditingId(null)}
              onDelete={() => deletePlan(p.id)} onSign={signNow} saving={saving} />
          ))}
        </PlanGroup>
      )}

      {!loading && filtered.length === 0 && (
        <Paper elevation={0} sx={{ p: 5, textAlign: 'center', border: '1px solid #f3f4f6', borderRadius: 2 }}>
          <Typography variant="body2" sx={{ color: '#9ca3af', mb: 1.5 }}>No placement plans yet.</Typography>
          <Button variant="outlined" size="small" onClick={() => setShowForm(true)}
            sx={{ textTransform: 'none', fontSize: 12, borderColor: GREEN, color: GREEN, '&:hover': { bgcolor: 'rgba(22,163,74,0.05)' } }}>
            Add first plan
          </Button>
        </Paper>
      )}
    </Box>
  )
}

/* ── Group wrapper ── */
function PlanGroup({ label, icon, bg, border, children }) {
  return (
    <Paper elevation={0} sx={{ border: `1px solid ${border}`, borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ px: 2.5, py: 1.5, bgcolor: bg, borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon}
        <Typography variant="caption" sx={{ fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>
          {label}
        </Typography>
      </Box>
      <Box sx={{ '& > *:not(:last-child)': { borderBottom: '1px solid #f9fafb' } }}>{children}</Box>
    </Paper>
  )
}

/* ── Plan card ── */
function PlanCard({ plan, editing, editForm, setEF, onEdit, onSaveEdit, onCancelEdit, onDelete, onSign, saving }) {
  const [localKw, setLocalKw] = useState(plan.keyworkerSigned || '')
  const meta = STATUS_META[plan.status] || STATUS_META.Pending

  const statusColor = plan.status === 'Approved' ? 'success' : plan.status === 'Pending' ? 'warning' : 'default'

  return (
    <Box sx={{ px: 2.5, py: 2 }}>
      {/* Row 1: standard + sort + status + actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        {editing ? (
          <FormControl size="small" sx={{ flex: 1 }}>
            <InputLabel sx={{ fontSize: 12 }}>Select Standard</InputLabel>
            <Select value={editForm.standard} onChange={e => { setEF('standard', e.target.value); setEF('detail', '') }} label="Select Standard"
              sx={{ fontSize: 12 }}>
              <MenuItem value=""><em>Select Standard</em></MenuItem>
              {STANDARDS.map(s => <MenuItem key={s} value={s} sx={{ fontSize: 12 }}>{s}</MenuItem>)}
            </Select>
          </FormControl>
        ) : (
          <Typography variant="body2" fontWeight={500} sx={{ flex: 1, color: plan.standard ? '#374151' : '#9ca3af', fontSize: 12 }}>
            {plan.standard || 'No standard selected'}
          </Typography>
        )}

        <Chip label={plan.status} size="small" color={statusColor} variant="outlined"
          sx={{ fontSize: 10, height: 20, fontWeight: 600 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="caption" sx={{ color: '#9ca3af' }}>Sort</Typography>
          {editing ? (
            <TextField type="number" value={editForm.sort} onChange={e => setEF('sort', e.target.value)} size="small"
              inputProps={{ min: 1 }} sx={{ width: 52, '& .MuiInputBase-input': { fontSize: 12, textAlign: 'center', py: 0.5, px: 1 } }} />
          ) : (
            <Typography variant="caption" fontWeight={600} sx={{ color: '#374151' }}>{plan.sort}</Typography>
          )}
        </Box>

        {!editing && (
          <Tooltip title="Edit">
            <IconButton size="small" onClick={onEdit} sx={{ color: '#9ca3af', '&:hover': { color: GREEN } }}>
              <Edit sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Delete">
          <IconButton size="small" onClick={onDelete} sx={{ color: '#d1d5db', '&:hover': { color: '#ef4444' } }}>
            <Delete sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Status toggle (edit mode) */}
      {editing && (
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 0.5 }}>Status</Typography>
          <ToggleButtonGroup value={editForm.status} exclusive onChange={(_, v) => v && setEF('status', v)} size="small">
            {[
              { v: 'Approved', color: GREEN },
              { v: 'Pending',  color: '#f59e0b' },
              { v: 'Rejected', color: '#9ca3af' },
            ].map(({ v, color }) => (
              <ToggleButton key={v} value={v}
                sx={{ fontSize: 11, textTransform: 'none', px: 1.5, py: 0.4,
                  '&.Mui-selected': { bgcolor: `${color}22`, color, borderColor: color, fontWeight: 600 } }}>
                {v}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      )}

      {/* Detail select */}
      <Box sx={{ mb: 1.5 }}>
        {editing ? (
          <FormControl fullWidth size="small">
            <InputLabel sx={{ fontSize: 12 }}>Select Detail</InputLabel>
            <Select value={editForm.detail} onChange={e => setEF('detail', e.target.value)} label="Select Detail" sx={{ fontSize: 12 }}>
              <MenuItem value=""><em>Select Detail</em></MenuItem>
              {getDetails(editForm.standard).map(d => <MenuItem key={d} value={d} sx={{ fontSize: 12, whiteSpace: 'normal' }}>{d}</MenuItem>)}
            </Select>
          </FormControl>
        ) : (
          <Paper variant="outlined" sx={{ px: 1.5, py: 1, bgcolor: '#f9fafb', borderColor: '#f3f4f6' }}>
            <Typography variant="caption" sx={{ color: plan.detail ? '#374151' : '#9ca3af' }}>
              {plan.detail || 'Select Detail'}
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Details textarea */}
      {editing ? (
        <TextField fullWidth multiline rows={3} value={editForm.details} onChange={e => setEF('details', e.target.value)}
          placeholder="Please enter details" size="small" sx={{ mb: 1.5, '& .MuiInputBase-input': { fontSize: 12 } }} />
      ) : (
        <Paper variant="outlined" sx={{ px: 1.5, py: 1, bgcolor: '#fafafa', borderColor: '#f3f4f6', minHeight: 56, mb: 1.5 }}>
          <Typography variant="caption" sx={{ color: plan.details ? '#374151' : '#d1d5db', whiteSpace: 'pre-wrap' }}>
            {plan.details || 'Please enter details'}
          </Typography>
        </Paper>
      )}

      {/* Required actions */}
      {editing ? (
        <TextField fullWidth multiline rows={3} value={editForm.requiredActions} onChange={e => setEF('requiredActions', e.target.value)}
          placeholder="Please enter the required actions" size="small" sx={{ mb: 1.5, '& .MuiInputBase-input': { fontSize: 12 } }} />
      ) : (
        <Paper variant="outlined" sx={{ px: 1.5, py: 1, bgcolor: '#fafafa', borderColor: '#f3f4f6', minHeight: 56, mb: 1.5 }}>
          <Typography variant="caption" sx={{ color: plan.requiredActions ? '#374151' : '#d1d5db', whiteSpace: 'pre-wrap' }}>
            {plan.requiredActions || 'Please enter the required actions'}
          </Typography>
        </Paper>
      )}

      {/* Linked target */}
      <Box sx={{ mb: editing ? 2 : 1.5 }}>
        {editing ? (
          <FormControl fullWidth size="small">
            <InputLabel sx={{ fontSize: 12 }}>Target linked to</InputLabel>
            <Select value={editForm.linkedTarget} onChange={e => setEF('linkedTarget', e.target.value)} label="Target linked to" sx={{ fontSize: 12 }}>
              <MenuItem value=""><em>Please select the target this is linked to</em></MenuItem>
              {TARGETS.map(t => <MenuItem key={t} value={t} sx={{ fontSize: 12 }}>{t}</MenuItem>)}
            </Select>
          </FormControl>
        ) : (
          <Paper variant="outlined" sx={{ px: 1.5, py: 1, bgcolor: '#f9fafb', borderColor: '#f3f4f6' }}>
            <Typography variant="caption" sx={{ color: plan.linkedTarget ? '#374151' : '#9ca3af' }}>
              {plan.linkedTarget || 'Please select the target this is linked to'}
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Edit save/cancel */}
      {editing && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button variant="contained" size="small" startIcon={saving ? <CircularProgress size={12} color="inherit" /> : <Save sx={{ fontSize: 14 }} />}
            onClick={onSaveEdit} disabled={saving}
            sx={{ textTransform: 'none', fontSize: 12, bgcolor: GREEN, '&:hover': { bgcolor: DARK_GREEN } }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
          <Button variant="outlined" size="small" startIcon={<Close sx={{ fontSize: 14 }} />} onClick={onCancelEdit}
            sx={{ textTransform: 'none', fontSize: 12, borderColor: '#d1d5db', color: '#6b7280' }}>
            Cancel
          </Button>
        </Box>
      )}

      {/* Footer */}
      <Divider sx={{ mb: 1.5 }} />
      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="caption" display="block" sx={{ color: '#9ca3af', fontSize: 10 }}>
            <strong style={{ color: '#6b7280' }}>Created On</strong> {fmtDate(plan.createdAt)}{plan.createdBy ? ` by ${plan.createdBy}` : ''}
          </Typography>
          <Typography variant="caption" display="block" sx={{ color: '#9ca3af', fontSize: 10 }}>
            <strong style={{ color: '#6b7280' }}>Last modified</strong> by {plan.updatedBy || '—'} on {fmtDateTime(plan.updatedAt)}
          </Typography>
          {plan.signedAt && (
            <Typography variant="caption" display="block" sx={{ color: GREEN, fontSize: 10 }}>
              <strong>Signed</strong> by {plan.keyworkerSigned} on {fmtDateTime(plan.signedAt)}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel sx={{ fontSize: 11 }}>Keyworker Signed</InputLabel>
            <Select value={localKw} onChange={e => setLocalKw(e.target.value)} label="Keyworker Signed" sx={{ fontSize: 11 }}>
              <MenuItem value=""><em>Select…</em></MenuItem>
              {KEYWORKERS.map(k => <MenuItem key={k} value={k} sx={{ fontSize: 11 }}>{k}</MenuItem>)}
            </Select>
          </FormControl>
          <Button variant="contained" size="small" startIcon={<Draw sx={{ fontSize: 14 }} />}
            onClick={() => onSign(plan.id, localKw)} disabled={!localKw}
            sx={{ textTransform: 'none', fontSize: 12, bgcolor: DARK_GREEN, '&:hover': { bgcolor: GREEN }, whiteSpace: 'nowrap' }}>
            Sign Now
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

/* ── New plan form ── */
function PlanForm({ form, setF, onSave, onCancel, saving }) {
  return (
    <Paper elevation={0} sx={{ border: `1px solid #bbf7d0`, borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#f0fdf4', borderBottom: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: DARK_GREEN, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>
          New Placement Plan
        </Typography>
        <IconButton size="small" onClick={onCancel} sx={{ color: '#9ca3af' }}><Close sx={{ fontSize: 16 }} /></IconButton>
      </Box>
      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Status */}
        <Box>
          <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 0.8 }}>Status</Typography>
          <ToggleButtonGroup value={form.status} exclusive onChange={(_, v) => v && setF('status', v)} size="small">
            {[
              { v: 'Approved', color: GREEN },
              { v: 'Pending',  color: '#f59e0b' },
              { v: 'Rejected', color: '#9ca3af' },
            ].map(({ v, color }) => (
              <ToggleButton key={v} value={v}
                sx={{ fontSize: 12, textTransform: 'none', px: 2,
                  '&.Mui-selected': { bgcolor: `${color}22`, color, borderColor: color, fontWeight: 600 } }}>
                {v}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* Standard + Sort */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ flex: 1 }}>
            <InputLabel sx={{ fontSize: 12 }}>Select Standard</InputLabel>
            <Select value={form.standard} onChange={e => { setF('standard', e.target.value); setF('detail', '') }} label="Select Standard" sx={{ fontSize: 12 }}>
              <MenuItem value=""><em>Select Standard</em></MenuItem>
              {STANDARDS.map(s => <MenuItem key={s} value={s} sx={{ fontSize: 12 }}>{s}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Sort" type="number" value={form.sort} onChange={e => setF('sort', e.target.value)}
            size="small" inputProps={{ min: 1 }} sx={{ width: 80, '& .MuiInputBase-input': { fontSize: 12, textAlign: 'center' } }} />
        </Box>

        {/* Detail */}
        <FormControl fullWidth size="small">
          <InputLabel sx={{ fontSize: 12 }}>Select Detail</InputLabel>
          <Select value={form.detail} onChange={e => setF('detail', e.target.value)} label="Select Detail" sx={{ fontSize: 12 }}>
            <MenuItem value=""><em>Select Detail</em></MenuItem>
            {getDetails(form.standard).map(d => <MenuItem key={d} value={d} sx={{ fontSize: 12, whiteSpace: 'normal' }}>{d}</MenuItem>)}
          </Select>
        </FormControl>

        <TextField fullWidth multiline rows={3} value={form.details} onChange={e => setF('details', e.target.value)}
          placeholder="Please enter details" size="small" label="Details"
          sx={{ '& .MuiInputBase-input': { fontSize: 12 }, '& label.Mui-focused': { color: GREEN }, '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: GREEN } }} />

        <TextField fullWidth multiline rows={3} value={form.requiredActions} onChange={e => setF('requiredActions', e.target.value)}
          placeholder="Please enter the required actions" size="small" label="Required Actions"
          sx={{ '& .MuiInputBase-input': { fontSize: 12 }, '& label.Mui-focused': { color: GREEN }, '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: GREEN } }} />

        <FormControl fullWidth size="small">
          <InputLabel sx={{ fontSize: 12 }}>Target linked to</InputLabel>
          <Select value={form.linkedTarget} onChange={e => setF('linkedTarget', e.target.value)} label="Target linked to" sx={{ fontSize: 12 }}>
            <MenuItem value=""><em>Please select the target this is linked to</em></MenuItem>
            {TARGETS.map(t => <MenuItem key={t} value={t} sx={{ fontSize: 12 }}>{t}</MenuItem>)}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 1, pt: 0.5 }}>
          <Button variant="contained" size="small" onClick={onSave} disabled={saving}
            startIcon={saving ? <CircularProgress size={12} color="inherit" /> : <Save sx={{ fontSize: 14 }} />}
            sx={{ textTransform: 'none', fontSize: 13, bgcolor: DARK_GREEN, '&:hover': { bgcolor: GREEN }, px: 3 }}>
            {saving ? 'Saving…' : 'Save Plan'}
          </Button>
          <Button variant="outlined" size="small" onClick={onCancel}
            sx={{ textTransform: 'none', fontSize: 13, borderColor: '#d1d5db', color: '#6b7280' }}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}
