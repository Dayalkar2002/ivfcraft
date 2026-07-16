import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AsyncPipe, DatePipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AuthActions } from '../../store/auth/auth.actions';
import { PatientActions } from '../../store/patient/patient.actions';
import { selectAuthUser } from '../../store/auth/auth.selectors';
import { selectSelectedPatient } from '../../store/patient/patient.selectors';
import { PatientSelectComponent } from '../../shared/components/patient-select/patient-select.component';
import { SidebarNavIconComponent } from '../sidebar-nav-icon/sidebar-nav-icon.component';
import { SIDE_NAV_SECTIONS, TOP_NAV_MENUS, TopNavMenu } from '../app-nav.config';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe, DatePipe, PatientSelectComponent, SidebarNavIconComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  user$ = this.store.select(selectAuthUser);
  patient$ = this.store.select(selectSelectedPatient);
  today = new Date();
  showPatientModal = false;
  sidebarCollapsed = false;
  openMenu: string | null = null;
  private hoverMenu: string | null = null;
  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  topMenus: TopNavMenu[] = TOP_NAV_MENUS;
  sideNavSections = SIDE_NAV_SECTIONS;
  expandedSections = new Set<string>(['Clinical Modules', 'Patient Management']);

  ngOnInit(): void {
    this.store.dispatch(PatientActions.loadSatellites());
    this.checkPatientSelectionParam();
    this.syncExpandedSections();

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.checkPatientSelectionParam();
        this.openMenu = null;
        this.syncExpandedSections();
      });
  }

  isSectionExpanded(title: string): boolean {
    return this.expandedSections.has(title);
  }

  toggleSection(title: string): void {
    if (this.expandedSections.has(title)) {
      this.expandedSections.delete(title);
    } else {
      this.expandedSections.add(title);
    }
  }

  userInitial(user: { userName?: string }): string {
    const name = user.userName?.split('@')[0] || 'U';
    return name.charAt(0).toUpperCase();
  }

  displayName(user: { userName?: string }): string {
    const name = user.userName?.split('@')[0] || 'User';
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  isSingleLinkSection(section: { standalone?: boolean; items: { route: string }[] }): boolean {
    return !!section.standalone || section.items.length === 1;
  }

  private syncExpandedSections(): void {
    const url = this.router.url.split('?')[0];
    for (const section of this.sideNavSections) {
      const active = section.items.some(
        (item) => url === item.route || url.startsWith(`${item.route}/`)
      );
      if (active) {
        this.expandedSections.add(section.title);
      }
    }
  }

  hasDropdown(menu: TopNavMenu): boolean {
    return !!(menu.columns?.length || menu.items?.length || menu.groups?.length);
  }

  toggleMenu(label: string, event: MouseEvent): void {
    event.stopPropagation();
    this.clearCloseTimer();
    this.openMenu = this.openMenu === label ? null : label;
  }

  onMenuEnter(label: string): void {
    this.clearCloseTimer();
    this.hoverMenu = label;
    this.openMenu = label;
  }

  onMenuLeave(): void {
    this.hoverMenu = null;
    this.clearCloseTimer();
    this.closeTimer = setTimeout(() => {
      if (!this.hoverMenu) {
        this.openMenu = null;
      }
    }, 120);
  }

  private clearCloseTimer(): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }

  closeMenus(): void {
    this.clearCloseTimer();
    this.hoverMenu = null;
    this.openMenu = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('.top-nav-item')) {
      return;
    }
    this.closeMenus();
  }

  onMenuNavigate(event: MouseEvent): void {
    event.stopPropagation();
    this.closeMenus();
  }

  private checkPatientSelectionParam(): void {
    const selectPatient = this.router.parseUrl(this.router.url).queryParams['selectPatient'];
    if (selectPatient === '1') {
      this.showPatientModal = true;
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { selectPatient: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
  }

  ngOnDestroy(): void {
    this.clearCloseTimer();
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  openPatientSelect(): void {
    this.showPatientModal = true;
  }

  closePatientSelect(): void {
    this.showPatientModal = false;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}
