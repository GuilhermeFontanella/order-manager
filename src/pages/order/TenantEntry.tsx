import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { saveMesaSession } from '../../lib/mesaSession'

// Acesso ao cardápio sem QR code de mesa (take away/delivery).
export default function TenantEntry() {
  const { tenantSlug } = useParams() as { tenantSlug: string }
  const navigate = useNavigate()

  useEffect(() => {
    saveMesaSession({ tenantSlug })
    navigate('/order', { replace: true })
  }, [tenantSlug, navigate])

  return null
}
