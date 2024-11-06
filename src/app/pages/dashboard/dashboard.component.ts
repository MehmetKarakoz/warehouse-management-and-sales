import { Component } from '@angular/core';
import { ProductListComponent } from "../../components/product-list/product-list/product-list.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ProductListComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
