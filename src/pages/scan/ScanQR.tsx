import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrowserQRCodeReader, type IScannerControls } from '@zxing/browser'
import type { Result } from '@zxing/library'
import { QrCode } from 'lucide-react'
import { parseMesaLink } from '../../lib/mesaSession'
import '../../styles/ember-theme.css'
import TextField from '../../components/ember/TextField'
import Button from '../../components/ember/Button'

const STATUS_MESSAGE: Record<string, string> = {
  'inicializando': 'Inicializando câmera...',
  'pedindo-permissao': 'Solicitando acesso à câmera...',
  'escaneando': 'Aponte a câmera para o QR code da mesa.',
  'erro': 'Erro ao acessar câmera — use a entrada manual abaixo.',
  'nao-reconhecido': 'QR não reconhecido — use a entrada manual abaixo.',
}

export default function ScanQR() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const navigate = useNavigate()
  const [status, setStatus] = useState<string>('inicializando')
  const [manualLink, setManualLink] = useState('')
  const [manualError, setManualError] = useState<string | null>(null)
  const controlsRef = useRef<IScannerControls | null>(null)

  useEffect(() => {
    const codeReader = new BrowserQRCodeReader()
    let cancelled = false

    async function start() {
      try {
        setStatus('pedindo-permissao')
        const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices()
        const deviceId = videoInputDevices.length ? videoInputDevices[0].deviceId : undefined

        if (!videoRef.current || cancelled) return

        setStatus('escaneando')
        const controls = await codeReader.decodeFromVideoDevice(deviceId, videoRef.current, (result?: Result) => {
          if (result) {
            handleFound(result.getText())
          }
        })
        controlsRef.current = controls
      } catch (e) {
        console.warn('Não foi possível acessar a câmera ou iniciar leitor de QR', e)
        if (!cancelled) setStatus('erro')
      }
    }

    start()

    return () => {
      cancelled = true
      controlsRef.current?.stop()
    }
  }, [])

  function handleFound(text: string) {
    const mesa = parseMesaLink(text)
    if (!mesa) {
      setStatus('nao-reconhecido')
      return
    }

    controlsRef.current?.stop()
    navigate(`/r/${mesa.tenantSlug}/mesa/${mesa.qrCodeToken}`, { replace: true })
  }

  function useManual() {
    const mesa = parseMesaLink(manualLink)
    if (!mesa) {
      setManualError('Link inválido. Cole o link completo da mesa (ex: .../r/seu-restaurante/mesa/xxxxx).')
      return
    }
    setManualError(null)
    navigate(`/r/${mesa.tenantSlug}/mesa/${mesa.qrCodeToken}`, { replace: true })
  }

  return (
    <div className="ember-theme relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        style={{ position: 'absolute', top: -140, left: -100, width: 460, height: 460, background: 'var(--gradient-ember-glow)', pointerEvents: 'none' }}
      />
      <div className="relative mx-auto max-w-md px-4 pt-10 pb-10">
        <div className="flex items-center gap-3" style={{ marginBottom: 'var(--sp-6)' }}>
          <div
            className="flex h-11 w-11 items-center justify-center"
            style={{ borderRadius: 'var(--r-pill)', background: 'var(--gradient-cta)', color: 'var(--text-on-accent)' }}
          >
            <QrCode size={20} />
          </div>
          <h1 style={{ font: 'var(--text-h1)', color: 'var(--text-primary)' }}>Escanear mesa</h1>
        </div>

        <div
          className="relative overflow-hidden"
          style={{ borderRadius: 'var(--r-card)', background: 'var(--surface-card)', boxShadow: 'var(--ring-inner), var(--shadow-card)', aspectRatio: '1 / 1' }}
        >
          <video ref={videoRef} className="h-full w-full object-cover" />
        </div>

        <p className="mt-4 text-center" style={{ font: 'var(--text-body)', color: 'var(--text-secondary)' }}>
          {STATUS_MESSAGE[status] ?? status}
        </p>

        <div className="mt-8" style={{ paddingTop: 'var(--sp-6)', borderTop: '1px solid var(--border-hairline)' }}>
          <p className="mb-3" style={{ font: 'var(--text-body)', color: 'var(--text-secondary)' }}>
            Se o QR não for detectado automaticamente, cole o link da mesa:
          </p>
          <TextField
            value={manualLink}
            onChange={e => setManualLink(e.target.value)}
            placeholder="Ex: https://.../r/seu-restaurante/mesa/xxxxx"
          />
          <Button fullWidth style={{ marginTop: 'var(--sp-3)' }} onClick={useManual}>Usar mesa</Button>
          {manualError && (
            <p className="mt-3" style={{ color: 'var(--danger)', font: 'var(--text-body)' }}>{manualError}</p>
          )}
        </div>
      </div>
    </div>
  )
}
