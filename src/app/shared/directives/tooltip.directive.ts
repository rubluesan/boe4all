import { Directive, ElementRef, HostListener, Input, OnDestroy, inject } from '@angular/core';

@Directive({ selector: '[appTooltip]', standalone: true })
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') text = '';
  private el = inject(ElementRef);
  private tip: HTMLElement | null = null;

  @HostListener('mouseenter')
  @HostListener('focusin')
  show(): void {
    if (!this.text || this.tip) return;
    this.tip = document.createElement('div');
    this.tip.className = 'app-tooltip';
    this.tip.textContent = this.text;
    document.body.appendChild(this.tip);
    requestAnimationFrame(() => {
      if (!this.tip) return;
      const r = this.el.nativeElement.getBoundingClientRect();
      const t = this.tip.getBoundingClientRect();
      let top = r.top - t.height - 8;
      const left = Math.max(4, Math.min(r.left + r.width / 2 - t.width / 2, window.innerWidth - t.width - 4));
      if (top < 4) top = r.bottom + 8;
      this.tip.style.top = `${top}px`;
      this.tip.style.left = `${left}px`;
      this.tip.classList.add('app-tooltip--visible');
    });
  }

  @HostListener('mouseleave')
  @HostListener('focusout')
  hide(): void {
    this.tip?.remove();
    this.tip = null;
  }

  ngOnDestroy(): void {
    this.hide();
  }
}
