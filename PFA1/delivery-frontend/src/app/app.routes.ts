import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { LoginComponent } from './auth/login/login.component';
import { AdminDashboardComponent } from './admin/dashboard/admin-dashboard.component';
import { EmployeeDashboardComponent } from './employee/dashboard/employee-dashboard.component';
import { DriverDashboardComponent } from './driver/dashboard/driver-dashboard.component';
import { DriverLayoutComponent } from './driver/shared/driver-layout/driver-layout.component';
import { PlanningComponent } from './driver/planning/planning.component';
import { HistoriqueComponent as DriverHistoriqueComponent } from './driver/historique/historique.component';
import { MesMissionsComponent as DriverMesMissionsComponent } from './driver/mes-missions/mes-missions.component';
import { CongeFormComponent } from './driver/components/conge-form.component';
import { AddEmployeeComponent } from './admin/dashboard/add-employee/add-employee.component';
import { AddChauffeurComponent } from './admin/dashboard/add-chauffeur/add-chauffeur.component';
import { ChauffeursComponent } from './admin/chauffeurs/chauffeurs.component';
import { AddVehiculeComponent } from './admin/dashboard/add-vehicule/add-vehicule.component';
import { CreateMissionComponent } from './admin/dashboard/create-mission/create-mission.component';
import { EditChauffeurComponent } from './admin/dashboard/edit-chauffeur/edit-chauffeur.component';
import { ChauffeurMissionsComponent } from './admin/dashboard/chauffeur-missions/chauffeur-missions.component';
import { DemandesCongeComponent } from './admin/dashboard/demandes-conge/demandes-conge.component';
import { EmployeeCreateMissionComponent } from './employee/create-mission/employee-create-mission.component';
import { MissionDetailsComponent } from './employee/mission-details/mission-details.component';
import { DriverMissionDetailsComponent } from './driver/mission-details/driver-mission-details.component';
import { EmployeesComponent } from './admin/employees/employees.component';
import { MesMissionsComponent } from './employee/mes-missions/mes-missions.component';
import { HistoriqueComponent } from './employee/historique/historique.component';
import { NotificationsComponent } from './employee/notifications/notifications.component';
import { MissionsComponent } from './admin/missions/missions.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'admin/login', component: LoginComponent, data: { role: 'admin' } },
  { path: 'employee/login', component: LoginComponent, data: { role: 'employee' } },
  { path: 'driver/login', component: LoginComponent, data: { role: 'driver' } },
  { 
    path: 'admin/dashboard', 
    component: AdminDashboardComponent, 
    canActivate: [AuthGuard, RoleGuard], 
    data: { role: 'admin' }
  },
  { 
    path: 'admin/add-employee', 
    component: AddEmployeeComponent, 
    canActivate: [AuthGuard, RoleGuard], 
    data: { role: 'admin' }
  },
  { 
    path: 'admin/add-chauffeur',
    component: AddChauffeurComponent,
    canActivate: [AuthGuard, RoleGuard], 
    data: { role: 'admin' }
  },
  { 
    path: 'admin/chauffeurs',
    component: ChauffeursComponent,
    canActivate: [AuthGuard, RoleGuard], 
    data: { role: 'admin' }
  },
  { 
    path: 'admin/edit-chauffeur/:id',
    component: EditChauffeurComponent,
    canActivate: [AuthGuard, RoleGuard], 
    data: { role: 'admin' }
  },
  { 
    path: 'admin/chauffeur-missions/:id',
    component: ChauffeurMissionsComponent,
    canActivate: [AuthGuard, RoleGuard], 
    data: { role: 'admin' }
  },
  { 
    path: 'admin/employees',
    component: EmployeesComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'ADMIN' }
  },
  { 
    path: 'admin/edit-employee/:id',
    loadComponent: () => import('./admin/dashboard/edit-employee/edit-employee.component').then(m => m.EditEmployeeComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'ADMIN' }
  },
  { 
    path: 'admin/employee-missions/:id',
    loadComponent: () => import('./admin/employee-missions/employee-missions.component').then(m => m.EmployeeMissionsComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'ADMIN' }
  },
  { 
    path: 'admin/add-vehicule',
    component: AddVehiculeComponent,
    canActivate: [AuthGuard, RoleGuard], 
    data: { role: 'admin' }
  },
  { 
    path: 'admin/dashboard/create-mission',
    component: CreateMissionComponent,
    canActivate: [AuthGuard, RoleGuard], 
    data: { role: 'admin' }
  },
  { 
    path: 'admin/missions',
    component: MissionsComponent,
    canActivate: [AuthGuard, RoleGuard], 
    data: { role: 'admin' }
  },
  { 
    path: 'admin/missions/edit/:id',
    loadComponent: () => import('./admin/missions/edit-mission/edit-mission.component').then(m => m.EditMissionComponent),
    canActivate: [AuthGuard, RoleGuard], 
    data: { role: 'admin' }
  },
  { 
    path: 'admin/dashboard/demandes-conge',
    component: DemandesCongeComponent,
    canActivate: [AuthGuard, RoleGuard], 
    data: { role: 'admin' }
  },
  { 
    path: 'admin/dashboard/vehicles',
    loadComponent: () => import('./admin/vehicles/vehicles.component').then(m => m.VehiclesComponent),
    canActivate: [AuthGuard, RoleGuard], 
    data: { role: 'admin' }
  },
  { 
    path: 'employee',
    loadComponent: () => import('./employee/layout/employee-layout.component').then(m => m.EmployeeLayoutComponent),
    canActivate: [AuthGuard, RoleGuard], 
    data: { role: 'employee' },
    children: [
      {
        path: 'dashboard',
        component: EmployeeDashboardComponent
      },
      {
        path: 'create-mission',
        component: EmployeeCreateMissionComponent
      },
      {
        path: 'missions',
        component: MesMissionsComponent
      },
      {
        path: 'historique',
        component: HistoriqueComponent
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  { 
    path: 'employee/notifications',
    component: NotificationsComponent,
    canActivate: [AuthGuard, RoleGuard], 
    data: { role: 'employee' }
  },
  { 
    path: 'employee/mission/:id',
    component: MissionDetailsComponent,
    canActivate: [AuthGuard, RoleGuard], 
    data: { role: 'employee' }
  },
  { 
    path: 'driver',
    component: DriverLayoutComponent,
    canActivate: [AuthGuard, RoleGuard], 
    data: { role: 'driver' },
    children: [
      {
        path: 'mes-missions',
        component: DriverMesMissionsComponent
      },
      {
        path: 'planning',
        component: PlanningComponent
      },
      {
        path: 'historique',
        component: DriverHistoriqueComponent
      },
      {
        path: 'conge',
        component: CongeFormComponent
      },
      {
        path: 'profile',
        loadComponent: () => import('./driver/profile/driver-profile.component').then(m => m.DriverProfileComponent)
      },
      {
        path: 'dashboard',
        component: DriverDashboardComponent
      },
      {
        path: '',
        redirectTo: 'mes-missions',
        pathMatch: 'full'
      }
    ]
  },
  { 
    path: 'driver/mission/:id',
    component: DriverMissionDetailsComponent,
    canActivate: [AuthGuard, RoleGuard], 
    data: { role: 'driver' }
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];