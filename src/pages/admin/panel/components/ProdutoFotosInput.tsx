import { useRef, useState } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import Carousel from '../../../../components/Carousel'
import { getApiErrorMessage, resolveMediaUrl } from '../../../../services/apiClient'
import { uploadProdutoImagem } from '../../../../services/produtos'

const MAX_FOTOS = 5
const TAMANHO_MAXIMO = 5 * 1024 * 1024

export default function ProdutoFotosInput({
  imagens,
  onChange,
}: {
  imagens: string[]
  onChange: (imagens: string[]) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Envie apenas arquivos de imagem.')
      return
    }
    if (file.size > TAMANHO_MAXIMO) {
      setError('A foto deve ter no máximo 5MB.')
      return
    }

    setError(null)
    setUploading(true)
    try {
      const url = await uploadProdutoImagem(file)
      onChange([...imagens, url])
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível enviar a foto.'))
    } finally {
      setUploading(false)
    }
  }

  function removeFoto(index: number) {
    onChange(imagens.filter((_, i) => i !== index))
  }

  return (
    <div>
      {imagens.length > 0 && (
        <Carousel images={imagens.map(resolveMediaUrl)} alt="Foto do item" className="mb-3 h-40 w-full" />
      )}

      {imagens.map((foto, index) => (
        <div key={`${foto}-${index}`} className="ap-opcao-row">
          <img
            src={resolveMediaUrl(foto)}
            alt=""
            style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
          />
          <span style={{ flex: 1, fontSize: 12.5, color: 'var(--ap-ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Foto {index + 1}
          </span>
          <button type="button" className="ap-btn ap-btn-ghost ap-btn-icon" onClick={() => removeFoto(index)} aria-label="Remover foto">
            <Trash2 size={13} />
          </button>
        </div>
      ))}

      {imagens.length < MAX_FOTOS && (
        <div style={{ marginTop: imagens.length > 0 ? 10 : 0 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="ap-btn ap-btn-ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <ImagePlus size={13} />
            {uploading ? 'Enviando...' : 'Adicionar foto'}
          </button>
        </div>
      )}

      {error && <p style={{ color: 'var(--ap-red)', fontSize: 12.5, marginTop: 8, marginBottom: 0 }}>{error}</p>}

      <div className="ap-card-sub" style={{ marginBottom: 0, marginTop: 8 }}>
        {imagens.length}/{MAX_FOTOS} fotos · JPG, PNG ou WEBP, até 5MB cada
      </div>
    </div>
  )
}
