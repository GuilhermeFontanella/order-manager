import { APP_VERSION, COMPANY } from '../../../../config/company'

// Para exibir o logo, coloque um arquivo chamado company-logo.svg, .png, .webp ou .jpg em src/assets/.
const logoFiles = import.meta.glob('/src/assets/company-logo.{svg,png,webp,jpg,jpeg}', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>
const logoUrl = Object.values(logoFiles)[0]

export default function CompanyFooter() {
  const initials = COMPANY.name
    .split(' ')
    .filter(word => word.length > 2)
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <footer className="ap-footer">
      <div className="ap-footer-brand">
        {logoUrl ? (
          <img className="ap-footer-logo" src={logoUrl} alt={COMPANY.name} />
        ) : (
          <div className="ap-footer-logo ap-footer-logo-placeholder" aria-hidden="true">
            {initials}
          </div>
        )}
        <div>
          <div className="ap-footer-title">Desenvolvido por {COMPANY.name}</div>
          <div className="ap-footer-line">CNPJ {COMPANY.cnpj}</div>
        </div>
      </div>

      <div className="ap-footer-contact">
        <a href={`tel:${COMPANY.phone.replace(/\D/g, '')}`}>{COMPANY.phone}</a>
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
        <span className="ap-footer-version">Versão {APP_VERSION}</span>
      </div>
    </footer>
  )
}
