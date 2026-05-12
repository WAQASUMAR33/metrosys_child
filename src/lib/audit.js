import { prisma } from './prisma'

export async function logAction({ session, action, entity, entityId, description }) {
  try {
    const firstName = session?.user?.firstName || ''
    const lastName = session?.user?.lastName || ''
    const userName = `${firstName} ${lastName}`.trim() || session?.user?.username || 'System'

    await prisma.auditLog.create({
      data: {
        userId: session?.user?.id ? parseInt(session.user.id) : null,
        userName,
        homeId: session?.user?.homeId ? parseInt(session.user.homeId) : null,
        companyId: session?.user?.companyId ? parseInt(session.user.companyId) : null,
        action,
        entity,
        entityId: entityId != null ? String(entityId) : null,
        description,
      },
    })
  } catch (err) {
    console.error('[AuditLog]', err)
  }
}
