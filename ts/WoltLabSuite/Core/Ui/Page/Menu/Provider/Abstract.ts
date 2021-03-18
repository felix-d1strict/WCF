export abstract class UiPageMenuProviderAbstract {
  abstract hasContent(): boolean;

  abstract loadContent(): Promise<void>;

  abstract getContent(): HTMLElement[];

  abstract getFooterButtons(): HTMLElement[];
}

export default UiPageMenuProviderAbstract;
