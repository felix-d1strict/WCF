export abstract class UiPageMenuProviderAbstract {
  abstract hasContent(): boolean;

  abstract loadContent(): Promise<void>;

  abstract getContent(): HTMLElement[];
}

export default UiPageMenuProviderAbstract;
