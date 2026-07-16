import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrowserQRCodeReader } from '@zxing/browser'

export default function ScanQR() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const navigate = useNavigate()
  const [status, setStatus] = useState<string>('inicializando')
  const [manualId, setManualId] = useState('')
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

  function normalizeTableIdFromQr(text: string) {
    try {
      const url = new URL(text)
      // tenta extrair /order/:tableId
      const parts = url.pathname.split('/')
      const idx = parts.indexOf('order')
      if (idx >= 0 && parts.length > idx + 1) return parts[idx + 1]
    } catch {
      // não é URL — pode ser apenas o id
    }
    return text
  }

  function handleFound(text: string) {
    const tableId = normalizeTableIdFromQr(text)
    localStorage.setItem('tableId', tableId)
    // stop reader before navigate
    // parar a câmera (tracks) já interrompe o leitor
    if (videoRef.current && videoRef.current.srcObject) {
      const s = videoRef.current.srcObject as MediaStream
      s.getTracks().forEach(t => t.stop())
    }
    navigate(`/order/${tableId}`, { replace: true })
  }

  function useManual() {
    if (!manualId) return
    localStorage.setItem('tableId', manualId)
    navigate(`/order/${manualId}`, { replace: true })
  }

  return (
    <div>
      <h1>Escanear QR (pré-visualização)</h1>

      <div style={{ marginBottom: 12 }}>
        <video ref={videoRef} style={{ width: '100%', maxWidth: 480, borderRadius: 8 }} />
        {status === 'pedindo-permissao' && <p>Solicitando acesso à câmera...</p>}
        {status === 'escaneando' && <p>Aponte a câmera para o QR.</p>}
        {status === 'erro' && <p>Erro ao acessar câmera — use entrada manual abaixo.</p>}
      </div>

      <div>
        <p>Se o QR não for detectado automaticamente, insira manualmente o número da mesa:</p>
        <input value={manualId} onChange={e => setManualId(e.target.value)} placeholder="Ex: mesa-5" />
        <button onClick={useManual} style={{ marginLeft: 8 }}>Usar mesa</button>
      </div>

      <p style={{ marginTop: 12, color: '#666' }}>
        A leitura automática usa <strong>@zxing/browser</strong>.
      </p>
    </div>
  )
}
