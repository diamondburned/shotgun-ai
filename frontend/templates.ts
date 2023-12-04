export default {
  _t: {
    buttonReload: getTemplateWithID("button-reload"),
    buttonShoot: getTemplateWithID("button-shoot"),
    buttonBlock: getTemplateWithID("button-block"),
    buttonTakeOutKnife: getTemplateWithID("button-take-out-knife"),
    buttonStab: getTemplateWithID("button-stab"),
  },
  clone<T extends HTMLElement>(id: keyof typeof this._t): T {
    const t = this._t[id] as HTMLTemplateElement;
    if (!t) {
      throw new Error(`Could not find template with ID ${id as string}`);
    }
    const childNodes = [...t.content.cloneNode(true).childNodes];
    return childNodes.find((e) => e instanceof HTMLElement) as T;
  },
};

function getTemplateWithID(id: string): HTMLTemplateElement {
  const e = document.getElementById(`template-${id}`) as HTMLTemplateElement;
  if (!e) {
    throw new Error(`Could not find template with id ${id}`);
  }
  return e;
}
