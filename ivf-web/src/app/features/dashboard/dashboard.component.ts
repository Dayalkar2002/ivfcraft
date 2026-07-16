import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { selectAuthUser } from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, AsyncPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private store = inject(Store);

  userName$ = this.store.select(selectAuthUser).pipe(
    map((u) => {
      if (!u?.userName) return 'User';
      const name = u.userName.split('@')[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    })
  );

  cycleTotal = 84;

  kpis = [
    { label: "Today's Appointments", value: '12', trend: '↑ 2 from yesterday', color: 'blue', icon: '📅' },
    { label: 'Active Cycles', value: '28', trend: '↑ 5 from yesterday', color: 'green', icon: '🎯' },
    { label: 'Embryo Transfers', value: '06', trend: '↑ 1 from yesterday', color: 'red', icon: '🔬' },
    { label: 'Pregnancy Rate (MTD)', value: '32.4%', trend: '↑ 4.3% from last month', color: 'teal', icon: '📈' },
  ];

  cycleBreakdown = [
    { label: 'IUI', count: 18, pct: 21, color: '#43a047' },
    { label: 'IVF', count: 24, pct: 29, color: '#42a5f5' },
    { label: 'ICSI', count: 16, pct: 19, color: '#ff9800' },
    { label: 'ET', count: 14, pct: 17, color: '#26c6da' },
    { label: 'BT', count: 8, pct: 10, color: '#80deea' },
    { label: 'Other', count: 4, pct: 4, color: '#e0e0e0' },
  ];

  appointments = [
    { time: '09:30 AM', patient: 'Neha Patil', type: 'IUI Follow Up', doctor: 'Dr. Mehta' },
    { time: '10:15 AM', patient: 'Ashwini Gaikwad', type: 'Cycle Monitoring', doctor: 'Dr. Sharma' },
    { time: '11:00 AM', patient: 'Priya Deshmukh', type: 'ET Procedure', doctor: 'Dr. Mehta' },
    { time: '02:30 PM', patient: 'Sneha Kulkarni', type: 'New Consultation', doctor: 'Dr. Rao' },
  ];

  quickActions = [
    { label: 'Add New Patient', desc: 'Register a new patient record', route: '/masters/patient', icon: '👤', color: 'green' },
    { label: 'Cycle Entry', desc: 'Start a new treatment cycle', route: '/cycle', icon: '🔄', color: 'green' },
    { label: 'Lab Entry', desc: 'Record lab & embryology data', route: '/ivf', icon: '🧪', color: 'blue' },
    { label: 'Appointments', desc: 'View & manage appointments', route: '/masters/appointments', icon: '📅', color: 'orange' },
    { label: 'Reports', desc: 'Generate clinic reports', route: '/reports', icon: '📊', color: 'purple' },
  ];
}
