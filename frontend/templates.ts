export const templates = {
  buttonReload: getTemplateWithID("button-reload"),
  buttonShoot: getTemplateWithID("button-shoot"),
  buttonBlock: getTemplateWithID("button-block"),
  buttonTakeOutKnife: getTemplateWithID("button-take-out-knife"),
  buttonStab: getTemplateWithID("button-stab"),
  buttonBlankMove: getTemplateWithID("button-blank-move"),

  iconReload: getTemplateWithID("reload-icon"),
  iconShoot: getTemplateWithID("shoot-icon"),
  iconBlock: getTemplateWithID("block-icon"),
  iconTakeOutKnife: getTemplateWithID("take-out-knife-icon"),
  iconStab: getTemplateWithID("stab-icon"),
};

export type TemplateID = keyof typeof templates;

export function clone<T extends HTMLElement>(id: TemplateID): T {
  const t = templates[id] as HTMLTemplateElement;
  if (!t) {
    throw new Error(`Could not find template with ID ${id as string}`);
  }
  const childNodes = [...t.content.cloneNode(true).childNodes];
  return childNodes.find((e) => e instanceof HTMLElement) as T;
}

export default {
  _t: templates,
  clone,
};

function getTemplateWithID(id: string): HTMLTemplateElement {
  const e = document.getElementById(`template-${id}`) as HTMLTemplateElement;
  if (!e) {
    throw new Error(`Could not find template with id ${id}`);
  }
  return e;
}
