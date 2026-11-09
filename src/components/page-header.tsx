import { ArcadeIcon, type ArcadeIconName } from "./arcade-icon";
import { Eyebrow, type PanelTone } from "./retro-panel";

export function PageHeader({ eyebrow, title, description, action, tone = "amber", icon = "learn" }: {
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  tone?: PanelTone;
  icon?: ArcadeIconName;
}) {
  return (
    <header className="page-header" data-tone={tone}>
      <div className="page-header__body">
        <div className="page-header__icon"><ArcadeIcon name={icon} width={27} height={27} /></div>
        <div className="min-w-0">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="page-title">{title}</h1>
          {description ? <p className="page-description">{description}</p> : null}
        </div>
      </div>
      {action ? <div className="page-header__action">{action}</div> : null}
    </header>
  );
}
