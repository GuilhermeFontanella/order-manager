import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { saveMesaSession } from '../../lib/mesaSession'

export default function MesaEntry() {
  const { tenantSlug, qrCodeToken } = useParams() as { tenantSlug: string; qrCodeToken: string }
  const navigate = useNavigate()

  useEffect(() => {
    saveMesaSession({ tenantSlug, qrCodeToken })
    navigate('/order', { replace: true })
  }, [tenantSlug, qrCodeToken, navigate])

  return null
}
