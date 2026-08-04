import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrowserQRCodeReader } from '@zxing/browser'
import { parseMesaLink } from '../../lib/mesaSession'

export default function ScanQR() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const navigate = useNavigate()
  const [status, setStatus] = useState<string>('inicializando')
  const [manualLink, setManualLink] = useState('')
  const [manualError, setManualError] = useState<string | null>(null)
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null)

  useEffect(() => {
    const codeReader = new BrowserQRCodeReader()
    codeReaderRef.current = codeReader

    async function start() {
      try {
        setStatus('pedindo-permissao')
        const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices()
        const deviceId = videoInputDevices.length ? videoInputDevices[0].deviceId : undefined

        if (!videoRef.current) return

        setStatus('escaneando')
        codeReader.decodeFromVideoDevice(deviceId, videoRef.current, (result: any) => {
          if (result) {
            // resultado do QR
            try {
              const text = typeof result.getText === 'function' ? result.getText() : String(result)
              handleFound(text)
            } catch {
              handleFound(String(result))
            }
          }
        })
      } catch (e) {
        console.warn('Não foi possível acessar a câmera ou iniciar leitor de QR', e)
        setStatus('erro')
      }
    }

    start()

    return () => {
      // Parar leitura: parar tracks de vídeo é suficiente para interromper o decode
      if (videoRef.current && videoRef.current.srcObject) {
        const s = videoRef.current.srcObject as MediaStream
        s.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  function handleFound(text: string) {
    const mesa = parseMesaLink(text)
    if (!mesa) {
      setStatus('nao-reconhecido')
      return
    }

    // parar a câmera (tracks) já interrompe o leitor
    if (videoRef.current && videoRef.current.srcObject) {
      const s = videoRef.current.srcObject as MediaStream
      s.getTracks().forEach(t => t.stop())
    }
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
    <div>
      <h1>Escanear QR (pré-visualização)</h1>

      <div style={{ marginBottom: 12 }}>
        <video ref={videoRef} style={{ width: '100%', maxWidth: 480, borderRadius: 8 }} />
        {status === 'pedindo-permissao' && <p>Solicitando acesso à câmera...</p>}
        {status === 'escaneando' && <p>Aponte a câmera para o QR.</p>}
        {status === 'erro' && <p>Erro ao acessar câmera — use entrada manual abaixo.</p>}
        {status === 'nao-reconhecido' && <p>QR não reconhecido — use entrada manual abaixo.</p>}
      </div>

      <div>
        <p>Se o QR não for detectado automaticamente, cole o link da mesa:</p>
        <input
          value={manualLink}
          onChange={e => setManualLink(e.target.value)}
          placeholder="Ex: https://.../r/seu-restaurante/mesa/xxxxx"
          style={{ width: '100%', maxWidth: 420 }}
        />
        <button onClick={useManual} style={{ marginLeft: 8 }}>Usar mesa</button>
        {manualError && <p style={{ color: '#c00' }}>{manualError}</p>}
      </div>

      <p style={{ marginTop: 12, color: '#666' }}>
        A leitura automática usa <strong>@zxing/browser</strong>.
      </p>
    </div>
  )
}
