'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Box, Paper, Typography, TextField, Select, MenuItem, FormControl,
  InputLabel, IconButton, Chip, CircularProgress, Divider, Tooltip,
  Button,
} from '@mui/material'
import { Search, Refresh, ChevronLeft, ChevronRight } from '@mui/icons-material'

const ACTION_META = {
  LOGIN:     { label: 'Login',      color: '#3b82f6', bg: '#eff6ff' },
  CREATE:    { label: 'Create',     color: '#16a34a', bg: '#f0fdf4' },
  UPDATE:    { label: 'Update',     color: '#f59e0b', bg: '#fffbeb' },
  DELETE:    { label: 'Delete',     color: '#ef4444', bg: '#fef2f2' },
  SIGN:      { label: 'Sign',       color: '#8b5cf6', bg: '#f5f3ff' },
  SIGN_OUT:  { label: 'Sign Out',   color: '#6b7280', bg: '#f9fafb' },
  CLOCK_IN:  { label: 'Clock In',   color: '#0ea5e9', bg: '#f0f9ff' },
  CLOCK_OUT: { label: 'Clock Out',  color: '#64748b', bg: '#f8fafc' },
  UPLOAD:    { label: 'Upload',     color: '#10b981', bg: '#ecfdf5' },
}

const ENTITIES = [
  'YoungPerson', 'PlacementPlan', 'Incident', 'Staff', 'ShiftRecord',
  'VisitorSignIn', 'Finance', 'CalendarEvent', 'Message', 'User',
]

const ACTIONS = Object.keys(ACTION_META)

function ActionChip({ action }) {
  const meta = ACTION_META[action] || { label: action, color: '#6b7280', bg: '#f9fafb' }
  return (
    <Chip
      label={meta.label}
      size="small"
      sx={{
        fontSize: 10, height: 20, fontWeight: 700,
        bgcolor: meta.bg, color: meta.color,
        border: `1px solid ${meta.color}33`,
      }}
    />
  )
}

function fmtDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function groupByDay(logs) {
  const groups = {}
  for (const log of logs) {
    const day = new Date(log.createdAt).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    if (!groups[day]) groups[day] = []
    groups[day].push(log)
  }
  return Object.entries(groups)
}

export default function AuditLogClient() {
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [action, setAction] = useState('')
  const [entity, setEntity] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    const params = new URLSearchParams({ page: p })
    if (search) params.set('search', search)
    if (action) params.set('action', action)
    if (entity) params.set('entity', entity)
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)

    const res = await fetch(`/api/audit-logs?${params}`)
    const data = await res.json()
    setLogs(data.logs || [])
    setTotal(data.total || 0)
    setPages(data.pages || 1)
    setPage(data.page || 1)
    setLoading(false)
  }, [search, action, entity, dateFrom, dateTo])

  useEffect(() => { load(1) }, [])

  function handleSearch() { load(1) }

  const grouped = groupByDay(logs)

  return (
    <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h6" fontWeight={700} sx={{ color: '#111827' }}>Activity Log</Typography>
        <Typography variant="caption" sx={{ color: '#9ca3af' }}>
          All system actions recorded against logged-in users
        </Typography>
      </Box>

      {/* Filter bar */}
      <Paper elevation={0} sx={{ p: 2, border: '1px solid #f3f4f6', borderRadius: 2, mb: 2.5, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'flex-end' }}>
        <TextField
          label="Search user or description" size="small" value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          sx={{ width: 240, '& label.Mui-focused': { color: '#16a34a' }, '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#16a34a' } }}
          InputProps={{ endAdornment: <Search sx={{ fontSize: 16, color: '#9ca3af' }} /> }}
        />
        <FormControl size="small" sx={{ width: 150 }}>
          <InputLabel>Action</InputLabel>
          <Select value={action} onChange={e => setAction(e.target.value)} label="Action">
            <MenuItem value=""><em>All</em></MenuItem>
            {ACTIONS.map(a => <MenuItem key={a} value={a} sx={{ fontSize: 13 }}>{ACTION_META[a].label}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ width: 160 }}>
          <InputLabel>Entity</InputLabel>
          <Select value={entity} onChange={e => setEntity(e.target.value)} label="Entity">
            <MenuItem value=""><em>All</em></MenuItem>
            {ENTITIES.map(e => <MenuItem key={e} value={e} sx={{ fontSize: 13 }}>{e}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField label="From" type="date" size="small" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
          InputLabelProps={{ shrink: true }} sx={{ width: 145 }} />
        <TextField label="To" type="date" size="small" value={dateTo} onChange={e => setDateTo(e.target.value)}
          InputLabelProps={{ shrink: true }} sx={{ width: 145 }} />
        <Button variant="contained" size="small" onClick={handleSearch}
          sx={{ bgcolor: '#166534', '&:hover': { bgcolor: '#16a34a' }, textTransform: 'none', fontSize: 13, px: 2 }}>
          Filter
        </Button>
        <Tooltip title="Reset filters">
          <IconButton size="small" onClick={() => { setSearch(''); setAction(''); setEntity(''); setDateFrom(''); setDateTo(''); setTimeout(() => load(1), 0) }}>
            <Refresh sx={{ fontSize: 18, color: '#9ca3af' }} />
          </IconButton>
        </Tooltip>
        <Typography variant="caption" sx={{ ml: 'auto', color: '#9ca3af', alignSelf: 'center' }}>
          {total} record{total !== 1 ? 's' : ''}
        </Typography>
      </Paper>

      {/* Log list */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} sx={{ color: '#16a34a' }} />
        </Box>
      ) : logs.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: '1px solid #f3f4f6', borderRadius: 2 }}>
          <Typography variant="body2" sx={{ color: '#9ca3af' }}>No activity records found.</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {grouped.map(([day, dayLogs]) => (
            <Box key={day}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11, pl: 0.5, display: 'block', mb: 0.8 }}>
                {day}
              </Typography>
              <Paper elevation={0} sx={{ border: '1px solid #f3f4f6', borderRadius: 2, overflow: 'hidden' }}>
                {dayLogs.map((log, idx) => (
                  <Box key={log.id}>
                    {idx > 0 && <Divider sx={{ borderColor: '#f9fafb' }} />}
                    <Box sx={{ px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 2, '&:hover': { bgcolor: '#fafafa' } }}>
                      <ActionChip action={log.action} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ color: '#111827', fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>
                          {log.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.3 }}>
                          <Typography variant="caption" sx={{ color: '#6b7280', fontSize: 11 }}>
                            {log.userName}
                          </Typography>
                          {log.entity && (
                            <Chip label={log.entity} size="small"
                              sx={{ fontSize: 10, height: 17, bgcolor: '#f3f4f6', color: '#6b7280', border: 'none' }} />
                          )}
                          {log.entityId && (
                            <Typography variant="caption" sx={{ color: '#d1d5db', fontSize: 10 }}>
                              #{log.entityId}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: 11, whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {new Date(log.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Paper>
            </Box>
          ))}
        </Box>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 3 }}>
          <IconButton size="small" disabled={page <= 1} onClick={() => load(page - 1)}>
            <ChevronLeft sx={{ fontSize: 20 }} />
          </IconButton>
          <Typography variant="caption" sx={{ color: '#374151', fontWeight: 500 }}>
            Page {page} of {pages}
          </Typography>
          <IconButton size="small" disabled={page >= pages} onClick={() => load(page + 1)}>
            <ChevronRight sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      )}
    </Box>
  )
}
