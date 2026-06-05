import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { NgOptimizedImage } from '@angular/common';
import { SeoService } from '../../core/services/seo-service';
import { SupabaseService } from '../../core/services/supabase-service';

export interface DailySummary {
  id: string;
  fecha: string;
  intro: string;
  bullets: { titulo: string; descripcion: string }[];
  conclusion: string;
}

@Component({
  selector: 'app-landing',
  imports: [LucideAngularModule, RouterLink, NgOptimizedImage],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {
  private supabase = inject(SupabaseService);

  dailySummary = signal<DailySummary | null>(null);
  summaryLoading = signal(true);

  constructor() {
    inject(SeoService).setLanding();
    this.loadDailySummary();
  }

  formatFecha(fecha: string): string {
    const meses = ['enero','febrero','marzo','abril','mayo','junio',
                   'julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const [, m, d] = fecha.split('-').map(Number);
    return `${d} de ${meses[m - 1]}`;
  }

  private async loadDailySummary(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await this.supabase.getClient()
      .from('daily_summaries')
      .select('*')
      .eq('fecha', today)
      .single();
    this.dailySummary.set(data ?? null);
    this.summaryLoading.set(false);
  }
}
