import { Injectable } from '@angular/core';
    
@Injectable()
export class ProductService {
    private readonly STORAGE_KEY = 'products';
    private readonly ORDERS_STORAGE_KEY = 'products_with_orders';
    private initialProducts = [];
        constructor() {
            // İlk kez çalıştığında örnek verileri localStorage'a kaydet
            if (!localStorage.getItem(this.STORAGE_KEY)) {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.initialProducts));
            }
        }
        private getProductsFromStorage(): any[] {
            const products = localStorage.getItem(this.STORAGE_KEY);
            return products ? JSON.parse(products) : [];
        }
        // Ürünleri localStorage'a kaydet
    private saveProductsToStorage(products: any[]): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(products));
    }

    // Tüm ürünleri getir
    getProducts(): Promise<any[]> {
        return Promise.resolve(this.getProductsFromStorage());
    }

    // Yeni ürün ekle
    addProduct(product: any): Promise<any> {
        const products = this.getProductsFromStorage();
        products.push(product);
        this.saveProductsToStorage(products);
        return Promise.resolve(product);
    }

    // Ürün güncelle
    updateProduct(product: any): Promise<any> {
        const products = this.getProductsFromStorage();
        const index = products.findIndex(p => p.id === product.id);
        if (index !== -1) {
            products[index] = product;
            this.saveProductsToStorage(products);
        }
        return Promise.resolve(product);
    }

    // Ürün sil
    deleteProduct(id: string): Promise<boolean> {
        const products = this.getProductsFromStorage();
        const filteredProducts = products.filter(p => p.id !== id);
        this.saveProductsToStorage(filteredProducts);
        return Promise.resolve(true);
    }

    // Seçili ürünleri sil
    deleteSelectedProducts(selectedProductIds: string[]): Promise<boolean> {
        const products = this.getProductsFromStorage();
        const remainingProducts = products.filter(p => !selectedProductIds.includes(p.id));
        this.saveProductsToStorage(remainingProducts);
        return Promise.resolve(true);
    }

    // Mini liste için ilk 5 ürünü getir
    getProductsMini(): Promise<any[]> {
        const products = this.getProductsFromStorage();
        return Promise.resolve(products.slice(0, 5));
    }

    // Küçük liste için ilk 10 ürünü getir
    getProductsSmall(): Promise<any[]> {
        const products = this.getProductsFromStorage();
        return Promise.resolve(products.slice(0, 10));
    }
}