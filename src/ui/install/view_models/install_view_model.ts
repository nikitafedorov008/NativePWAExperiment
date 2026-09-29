/**
 * ui/install/view_models — the install banner's view model. It only knows the
 * install repository, so the banner widget can stay identical in every design
 * language.
 */
import { ChangeNotifier } from '../../../core/change_notifier.ts';
import type { InstallRepository, InstallState } from '../../../data/repositories/install_repository.ts';

export class InstallViewModel extends ChangeNotifier {
  constructor(private readonly install: InstallRepository) {
    super();
    this.install.addListener(() => this.notifyListeners());
  }

  get state(): InstallState {
    return this.install.state;
  }

  dismiss(): void {
    this.install.dismiss();
  }

  prompt(): void {
    void this.install.prompt();
  }
}
