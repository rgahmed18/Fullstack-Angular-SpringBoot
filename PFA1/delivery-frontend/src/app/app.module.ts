import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { SharedModule } from './shared/shared.module';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { EmployeeService } from './core/services/employee.service';
import { ChauffeurService } from './core/services/chauffeur.service';
import { VehiculeService } from './core/services/vehicule.service';
import { DashboardService } from './core/services/dashboard.service';
import { MissionService } from './core/services/mission.service';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      BrowserModule,
      ReactiveFormsModule,
      FormsModule,
      HttpClientModule,
      SharedModule
    ),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
    AuthGuard,
    RoleGuard,
    EmployeeService,
    ChauffeurService,
    VehiculeService,
    DashboardService,
    MissionService
  ]
};
