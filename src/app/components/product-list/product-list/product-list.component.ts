import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProductService } from '../../../service/productservice';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule ,FormsModule} from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
export interface Product {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  inventoryStatus?: string ;
  category?: string;
  rating?: number;
}
interface Sale {
    id: number;
    productName: string;
    price: number;
    date: string;
    time: string;
  }
  interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}
interface Columns {
    field: string;
    header: string;
    customExportHeader?: string;
}


interface ExportColumn {
    title: string;
    dataKey: string;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [TableModule, DialogModule, RippleModule, ButtonModule, ToastModule,FormsModule, ToolbarModule, ConfirmDialogModule, InputTextModule, InputTextareaModule, CommonModule, FileUploadModule, DropdownModule, TagModule, RadioButtonModule, RatingModule, InputTextModule, ReactiveFormsModule, InputNumberModule],
  providers: [MessageService, ConfirmationService, ProductService],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {

  productDialog: boolean = false;

  products!: Product[];

  product!: Product;
  exportColumns!: ExportColumn[];
    cols!: Column[];
    colss!:Columns[];
  selectedProducts!: Product[] | null;
  salesForm: FormGroup;
  editForm: FormGroup;
  showEditModal = false;
  showDeleteModal = false;
  selectedSale: Sale | null = null;
  sales: Sale[] = [];
  private readonly STORAGE_KEY = 'daily_sales';


  submitted: boolean = false;

  statuses!: any[];
    dt: any;

  constructor(private productService: ProductService, private messageService: MessageService, private confirmationService: ConfirmationService,private fb: FormBuilder) {
    this.salesForm = this.fb.group({
        productName: ['', Validators.required],
        price: ['', [Validators.required, Validators.min(0)]]
      });
  
      this.editForm = this.fb.group({
        productName: ['', Validators.required],
        price: ['', [Validators.required, Validators.min(0)]]
      });
    }
  ngOnInit() {
    this.loadSalesFromStorage();

      this.productService.getProducts().then((data) => (this.products = data));

      this.statuses = [
          { label: 'MATERYAL', value: 'MATERYAL' },
          { label: 'MEŞRUBAT', value: 'MEŞRUBAT' },
          { label: 'GIDA', value: 'GIDA' }
      ];

    this.cols = [
        { field: 'name', header: 'Name' },
        { field: 'price', header: 'Price' },
        { field: 'category', header: 'Category' },
        { field: 'description', header: 'description' },
        { field: 'inventoryStatus', header: 'inventoryStatus' },

    ];
    this.colss = [
        { field: 'productName', header: 'productName' },
        { field: 'date', header: 'date' },
        { field: 'time', header: 'time' },

    ];

    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));

  }

  private loadSalesFromStorage() {
    const storedSales = localStorage.getItem(this.STORAGE_KEY);
    if (storedSales) {
      this.sales = JSON.parse(storedSales);
      // Sadece bugünün satışlarını filtrele
      const today = new Date().toLocaleDateString();
      this.sales = this.sales.filter(sale => sale.date === today);
    }
  }
  private saveSalesToStorage() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.sales));
  }
  openNew() {
      this.product = {};
      this.submitted = false;
      this.productDialog = true;
  }

  deleteSelectedProducts() {
    this.confirmationService.confirm({
        message: 'Silmek İstediğine Emin Misin ?',
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            if (this.selectedProducts) {
                const selectedIds = this.selectedProducts.map(product => product.id as string);
                this.productService.deleteSelectedProducts(selectedIds).then(() => {
                    this.productService.getProducts().then((data) => {
                        this.products = data;
                        this.selectedProducts = null;
                        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
                    });
                });
            }
        }
    });
}
  editProduct(product: Product) {
      this.product = { ...product };
      this.productDialog = true;
  }

  deleteProduct(product: Product) {
    this.confirmationService.confirm({
        message: 'Are you sure you want to delete ' + product.name + '?',
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            if (product.id) {
                this.productService.deleteProduct(product.id).then(() => {
                    this.productService.getProducts().then((data) => {
                        this.products = data;
                        this.product = {};
                        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
                    });
                });
            }
        }
    });
}

  hideDialog() {
      this.productDialog = false;
      this.submitted = false;
  }

  saveProduct() {
    this.submitted = true;

    if (this.product.name?.trim()) {
        if (this.product.id) {
            this.productService.updateProduct(this.product).then(() => {
                this.productService.getProducts().then((data) => {
                    this.products = data;
                    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Updated', life: 3000 });
                });
            });
        } else {
            this.product.id = this.createId();
            this.productService.addProduct(this.product).then(() => {
                this.productService.getProducts().then((data) => {
                    this.products = data;
                    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 });
                });
            });
        }

        this.productDialog = false;
        this.product = {};
    }
}

  findIndexById(id: string): number {
      let index = -1;
      for (let i = 0; i < this.products.length; i++) {
          if (this.products[i].id === id) {
              index = i;
              break;
          }
      }

      return index;
  }

  createId(): string {
      let id = '';
      var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (var i = 0; i < 5; i++) {
          id += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return id;
  }

  getSeverity(status: string) {
      switch (status) {
          case 'MATERYAL':
              return 'success';
          case 'MEŞRUBAT':
              return 'warning';
          case 'GIDA':
              return 'danger';
              default: return 'info'
      }
  }
  onSubmit() {
    if (this.salesForm.valid) {
      const now = new Date();
      const newSale: Sale = {
        id: Date.now(), // Benzersiz ID için timestamp kullan
        productName: this.salesForm.value.productName,
        price: this.salesForm.value.price,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString()
      };

      this.sales.push(newSale);
      this.saveSalesToStorage();
      this.salesForm.reset();
    }
  }
  calculateTotal(): number {
    return this.sales.reduce((total, sale) => total + sale.price, 0);
  }

  // Form validation kontrolü
  isFieldInvalid(fieldName: string): boolean {
    const field = this.salesForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

 

  // Belirli bir tarihteki satışları getir (opsiyonel)
  getSalesByDate(date: string): Sale[] {
    return this.sales.filter(sale => sale.date === date);
  }

  // LocalStorage'ı temizle (opsiyonel)
  clearSales() {
    this.sales = [];
    localStorage.removeItem(this.STORAGE_KEY);
  }
  openEditModal(sale: Sale) {
    this.selectedSale = sale;
    this.editForm.patchValue({
      productName: sale.productName,
      price: sale.price
    });
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedSale = null;
    this.editForm.reset();
  }

  updateSale() {
    if (this.editForm.valid && this.selectedSale) {
      const index = this.sales.findIndex(s => s.id === this.selectedSale!.id);
      if (index !== -1) {
        this.sales[index] = {
          ...this.selectedSale,
          productName: this.editForm.value.productName,
          price: this.editForm.value.price
        };
        this.saveSalesToStorage();
        this.closeEditModal();
      }
    }
  }

  // Silme işlemleri
  confirmDelete(sale: Sale) {
    this.selectedSale = sale;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.selectedSale = null;
  }

  deleteSale() {
    if (this.selectedSale) {
      this.sales = this.sales.filter(sale => sale.id !== this.selectedSale!.id);
      this.saveSalesToStorage();
      this.closeDeleteModal();
    }
  }
  exportData() {
    this.dt.exportCSV();
  }
}
