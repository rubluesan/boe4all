import { A11yModule } from '@angular/cdk/a11y';
import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { SupabaseService } from '../../../core/services/supabase-service';
import { UserProfile } from '../../../core/models/UserProfile';
import { SystemMessageService } from '../../../core/services/system-message-service';

@Component({
  selector: 'app-user-menu',
  imports: [LucideAngularModule, RouterLink, A11yModule],
  templateUrl: './user-menu.html',
  styleUrl: './user-menu.css',
})
export class UserMenu implements OnInit {
  private router = inject(Router);
  isOpen = signal(false);
  supabaseService = inject(SupabaseService);
  systemMessageService = inject(SystemMessageService);

  userProfile = computed(() => this.supabaseService.profile());

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {}

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isOpen()) {
      this.toggleMenu();
    }
  }

  @HostListener('document:click', ['$event'])
  onClick(event: Event) {
    if (this.isOpen()) {
      if (!this.elementRef.nativeElement.contains(event.target)) {
        this.toggleMenu();
      }
    }
  }

  toggleMenu() {
    this.isOpen.update((value) => !value);
  }

  signOut() {
    this.supabaseService.signOut();

    this.isOpen.set(false);
  }
}
