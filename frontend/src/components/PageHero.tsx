import { ReactNode } from 'react'

interface PageHeroProps {
  title: string
  subtitle?: string
  badge?: string
  children?: ReactNode
}

export default function PageHero({ title, subtitle, badge, children }: PageHeroProps) {
  return (
    <div className="page-hero glass-panel">
      <div>
        {badge && <span className="page-hero__badge">{badge}</span>}
        <h1 className="page-hero__title">{title}</h1>
        {subtitle && <p className="page-hero__subtitle">{subtitle}</p>}
      </div>
      {children && <div className="page-hero__actions">{children}</div>}
    </div>
  )
}



